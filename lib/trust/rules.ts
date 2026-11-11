/**
 * Computed trust heuristics: transparent thresholds for human review.
 * Source of truth for docs/agent/TRUST_RULES.md. No persisted badge/flag state.
 */

import type { ReportStatus, SellerStatus } from "@/lib/types";

// ── Verification badge thresholds (tunable defaults) ──────────────────────

/** Minimum days since seller_profiles.$createdAt before badge eligibility. */
export const MIN_ACCOUNT_AGE_DAYS_FOR_BADGE = 14;

/** Minimum sold (completed) requests required for badge eligibility. */
export const MIN_COMPLETED_ORDERS_FOR_BADGE = 3;

// ── Fraud flag thresholds ───────────────────────────────────────────────────

/** Rolling window for cancellation-rate rules (days). */
export const FRAUD_ROLLING_WINDOW_DAYS = 30;

/** New-seller window: profile age ≤ this many days for high-first-sale rule. */
export const NEW_SELLER_WINDOW_DAYS = 14;

/** First sold amount (LKR) that triggers new-seller high-value flag. */
export const HIGH_FIRST_ORDER_AMOUNT_LKR = 50_000;

/** Minimum requests in window before cancellation-rate ratio is evaluated. */
export const MIN_ORDERS_FOR_CANCELLATION_RATE = 5;

/** Cancelled / total ratio in window that triggers rapid-cancellation flag. */
export const CANCELLATION_RATE_THRESHOLD = 0.5;

/** Report statuses treated as still open (unresolved). */
export const OPEN_REPORT_STATUSES: readonly ReportStatus[] = [
  "open",
  "reviewing",
];

/** Kept for callers that still pass slip arrays (always empty after contact-request cut). */
export const REJECTED_SLIP_FLAG_THRESHOLD = 2;

// ── Input shapes ───────────────────────────────────────────────────────────

export type TrustSellerProfile = {
  userId: string;
  shopName: string;
  status: SellerStatus;
  createdAt: string;
};

/** Mapped purchase request: sold → completed, cancelled → cancelled, else processing. */
export type TrustOrder = {
  $id: string;
  sellerId: string;
  status: "completed" | "cancelled" | "processing";
  totalAmount: number;
  createdAt: string;
};

export type TrustBankSlip = {
  orderId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type TrustReport = {
  productId: string;
  status: ReportStatus;
};

export type RuleResult = {
  rule: string;
  triggered: boolean;
  reason: string;
};

export type BadgeEligibilityResult = {
  verified: boolean;
  reasons: string[];
};

const MS_PER_DAY = 86_400_000;

function daysSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now.getTime() - then) / MS_PER_DAY));
}

function inWindow(iso: string, windowDays: number, now: Date): boolean {
  return daysSince(iso, now) <= windowDays;
}

export function evaluateBadgeEligibility(params: {
  profile: TrustSellerProfile;
  orders: TrustOrder[];
  openReportCount?: number;
  now?: Date;
}): BadgeEligibilityResult {
  const now = params.now ?? new Date();
  const failures: string[] = [];
  const passed: string[] = [];

  if (params.profile.status !== "approved") {
    failures.push(`Seller status is ${params.profile.status}`);
  } else {
    passed.push("Seller status is approved");
  }

  const ageDays = daysSince(params.profile.createdAt, now);
  if (ageDays < MIN_ACCOUNT_AGE_DAYS_FOR_BADGE) {
    failures.push(
      `Account age ${ageDays}d is below ${MIN_ACCOUNT_AGE_DAYS_FOR_BADGE}d`,
    );
  } else {
    passed.push(`Account age ${ageDays}d meets ${MIN_ACCOUNT_AGE_DAYS_FOR_BADGE}d`);
  }

  const completed = params.orders.filter((o) => o.status === "completed").length;
  if (completed < MIN_COMPLETED_ORDERS_FOR_BADGE) {
    failures.push(
      `Sold requests ${completed} is below ${MIN_COMPLETED_ORDERS_FOR_BADGE}`,
    );
  } else {
    passed.push(
      `Sold requests ${completed} meets ${MIN_COMPLETED_ORDERS_FOR_BADGE}`,
    );
  }

  const openCount = params.openReportCount ?? 0;
  if (openCount > 0) {
    failures.push(`${openCount} open report(s) need triage`);
  } else {
    passed.push("No open reports");
  }

  if (failures.length > 0) {
    return { verified: false, reasons: failures };
  }

  return { verified: true, reasons: passed };
}

export function evaluateFraudFlags(params: {
  profile: TrustSellerProfile;
  orders: TrustOrder[];
  slips?: TrustBankSlip[];
  bankSlips?: TrustBankSlip[];
  openReportCount?: number;
  now?: Date;
}): { rule: string; reason: string }[] {
  const now = params.now ?? new Date();
  const results: RuleResult[] = [];

  const windowed = params.orders.filter((o) =>
    inWindow(o.createdAt, FRAUD_ROLLING_WINDOW_DAYS, now),
  );
  if (windowed.length >= MIN_ORDERS_FOR_CANCELLATION_RATE) {
    const cancelled = windowed.filter((o) => o.status === "cancelled").length;
    const rate = cancelled / windowed.length;
    const triggered = rate >= CANCELLATION_RATE_THRESHOLD;
    results.push({
      rule: "rapid_cancellation_rate",
      triggered,
      reason: triggered
        ? `Cancellation rate ${(rate * 100).toFixed(0)}% in ${FRAUD_ROLLING_WINDOW_DAYS}d`
        : "Cancellation rate within threshold",
    });
  } else {
    results.push({
      rule: "rapid_cancellation_rate",
      triggered: false,
      reason: `Fewer than ${MIN_ORDERS_FOR_CANCELLATION_RATE} requests in window`,
    });
  }

  if (daysSince(params.profile.createdAt, now) <= NEW_SELLER_WINDOW_DAYS) {
    const sold = [...params.orders]
      .filter((o) => o.status === "completed")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    const first = sold[0];
    const amount = first?.totalAmount ?? 0;
    const triggered = Boolean(first && amount >= HIGH_FIRST_ORDER_AMOUNT_LKR);
    results.push({
      rule: "new_seller_high_first_order",
      triggered,
      reason: triggered
        ? `First sold amount LKR ${amount} ≥ ${HIGH_FIRST_ORDER_AMOUNT_LKR}`
        : "First sold amount within threshold",
    });
  } else {
    results.push({
      rule: "new_seller_high_first_order",
      triggered: false,
      reason: "Seller older than new-seller window",
    });
  }

  const openCount = params.openReportCount ?? 0;
  results.push({
    rule: "open_unresolved_reports",
    triggered: openCount > 0,
    reason:
      openCount > 0
        ? `${openCount} open report(s) need triage`
        : "No open reports",
  });

  results.push({
    rule: "rejected_bank_slips",
    triggered: false,
    reason: "Bank slips are not used on this marketplace",
  });

  return results
    .filter((r) => r.triggered)
    .map((r) => ({ rule: r.rule, reason: r.reason }));
}
