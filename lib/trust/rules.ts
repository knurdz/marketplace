/**
 * Computed trust heuristics — transparent thresholds for human review.
 * Source of truth for docs/agent/TRUST_RULES.md. No persisted badge/flag state.
 */

import type { BankSlipStatus, OrderStatus, ReportStatus, SellerStatus } from "@/lib/types";

// ── Verification badge thresholds (tunable defaults) ──────────────────────

/** Minimum days since seller_profiles.$createdAt before badge eligibility. */
export const MIN_ACCOUNT_AGE_DAYS_FOR_BADGE = 14;

/** Minimum completed orders required for badge eligibility. */
export const MIN_COMPLETED_ORDERS_FOR_BADGE = 3;

// ── Fraud flag thresholds ───────────────────────────────────────────────────

/** Rolling window for rejected-bank-slip and cancellation-rate rules (days). */
export const FRAUD_ROLLING_WINDOW_DAYS = 30;

/** Rejected slips in window that trigger the multiple-rejected-slips flag. */
export const REJECTED_SLIP_FLAG_THRESHOLD = 2;

/** New-seller window: profile age ≤ this many days for high-first-order rule. */
export const NEW_SELLER_WINDOW_DAYS = 14;

/** First-order totalAmount (LKR) that triggers new-seller high-value flag. */
export const HIGH_FIRST_ORDER_AMOUNT_LKR = 50_000;

/** Minimum orders in window before cancellation-rate ratio is evaluated. */
export const MIN_ORDERS_FOR_CANCELLATION_RATE = 5;

/** Cancelled / total ratio in window that triggers rapid-cancellation flag. */
export const CANCELLATION_RATE_THRESHOLD = 0.5;

/** Report statuses treated as still open (unresolved). */
export const OPEN_REPORT_STATUSES: readonly ReportStatus[] = ["open", "reviewing"];

// ── Input shapes (pre-fetched data only — no Appwrite calls here) ───────────

export type TrustSellerProfile = {
  userId: string;
  shopName: string;
  status: SellerStatus;
  createdAt: string;
};

export type TrustOrder = {
  $id: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
};

export type TrustBankSlip = {
  orderId: string;
  status: BankSlipStatus;
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
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return (now.getTime() - d.getTime()) / MS_PER_DAY;
}

function isWithinRollingWindow(iso: string, windowDays: number, now: Date = new Date()): boolean {
  return daysSince(iso, now) <= windowDays;
}

// ── Verification badge (composite) ──────────────────────────────────────────

export function evaluateBadgeEligibility(input: {
  profile: TrustSellerProfile;
  orders: TrustOrder[];
  openReportCount: number;
  now?: Date;
}): BadgeEligibilityResult {
  const { profile, orders, openReportCount } = input;
  const now = input.now ?? new Date();
  const reasons: string[] = [];

  if (profile.status !== "approved") {
    reasons.push(`Seller status is "${profile.status}" (must be approved).`);
    return { verified: false, reasons };
  }

  const accountAgeDays = daysSince(profile.createdAt, now);
  if (accountAgeDays < MIN_ACCOUNT_AGE_DAYS_FOR_BADGE) {
    reasons.push(
      `Account age ${Math.floor(accountAgeDays)}d is below ${MIN_ACCOUNT_AGE_DAYS_FOR_BADGE}d minimum.`,
    );
  } else {
    reasons.push(`Account age ${Math.floor(accountAgeDays)}d meets minimum.`);
  }

  const completedCount = orders.filter((o) => o.status === "completed").length;
  if (completedCount < MIN_COMPLETED_ORDERS_FOR_BADGE) {
    reasons.push(
      `${completedCount} completed order(s) — need at least ${MIN_COMPLETED_ORDERS_FOR_BADGE}.`,
    );
  } else {
    reasons.push(`${completedCount} completed order(s) meet minimum.`);
  }

  if (openReportCount > 0) {
    reasons.push(`${openReportCount} open/unresolved report(s) on seller products.`);
  } else {
    reasons.push("No open reports on seller products.");
  }

  const verified =
    profile.status === "approved" &&
    accountAgeDays >= MIN_ACCOUNT_AGE_DAYS_FOR_BADGE &&
    completedCount >= MIN_COMPLETED_ORDERS_FOR_BADGE &&
    openReportCount === 0;

  return { verified, reasons };
}

// ── Fraud flags (independent pure rules) ────────────────────────────────────

export function ruleRejectedBankSlips(input: {
  slips: TrustBankSlip[];
  now?: Date;
}): RuleResult {
  const now = input.now ?? new Date();
  const rejected = input.slips.filter(
    (s) =>
      s.status === "rejected" &&
      isWithinRollingWindow(s.createdAt, FRAUD_ROLLING_WINDOW_DAYS, now),
  );

  const triggered = rejected.length >= REJECTED_SLIP_FLAG_THRESHOLD;
  return {
    rule: "rejected_bank_slips",
    triggered,
    reason: triggered
      ? `${rejected.length} rejected bank slip(s) in the last ${FRAUD_ROLLING_WINDOW_DAYS} days (threshold: ${REJECTED_SLIP_FLAG_THRESHOLD}).`
      : `${rejected.length} rejected bank slip(s) in window — below threshold of ${REJECTED_SLIP_FLAG_THRESHOLD}.`,
  };
}

export function ruleNewSellerHighFirstOrder(input: {
  profile: TrustSellerProfile;
  orders: TrustOrder[];
  now?: Date;
}): RuleResult {
  const now = input.now ?? new Date();
  const profileAgeDays = daysSince(input.profile.createdAt, now);

  if (profileAgeDays > NEW_SELLER_WINDOW_DAYS) {
    return {
      rule: "new_seller_high_first_order",
      triggered: false,
      reason: `Seller profile is ${Math.floor(profileAgeDays)}d old — outside ${NEW_SELLER_WINDOW_DAYS}d new-seller window.`,
    };
  }

  const sorted = [...input.orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const firstOrder = sorted[0];

  if (!firstOrder) {
    return {
      rule: "new_seller_high_first_order",
      triggered: false,
      reason: "No orders yet — cannot evaluate first-order value.",
    };
  }

  const triggered = firstOrder.totalAmount >= HIGH_FIRST_ORDER_AMOUNT_LKR;
  return {
    rule: "new_seller_high_first_order",
    triggered,
    reason: triggered
      ? `New seller (≤${NEW_SELLER_WINDOW_DAYS}d) with first order of LKR ${firstOrder.totalAmount.toLocaleString()} (threshold: LKR ${HIGH_FIRST_ORDER_AMOUNT_LKR.toLocaleString()}).`
      : `First order LKR ${firstOrder.totalAmount.toLocaleString()} is below LKR ${HIGH_FIRST_ORDER_AMOUNT_LKR.toLocaleString()} threshold.`,
  };
}

export function ruleOpenUnresolvedReports(input: {
  openReportCount: number;
}): RuleResult {
  const triggered = input.openReportCount >= 1;
  return {
    rule: "open_unresolved_reports",
    triggered,
    reason: triggered
      ? `${input.openReportCount} open or reviewing report(s) on seller products.`
      : "No open or reviewing reports on seller products.",
  };
}

export function ruleRapidCancellationRate(input: {
  orders: TrustOrder[];
  now?: Date;
}): RuleResult {
  const now = input.now ?? new Date();
  const inWindow = input.orders.filter((o) =>
    isWithinRollingWindow(o.createdAt, FRAUD_ROLLING_WINDOW_DAYS, now),
  );
  const total = inWindow.length;
  const cancelled = inWindow.filter((o) => o.status === "cancelled").length;

  if (total < MIN_ORDERS_FOR_CANCELLATION_RATE) {
    return {
      rule: "rapid_cancellation_rate",
      triggered: false,
      reason: `${total} order(s) in last ${FRAUD_ROLLING_WINDOW_DAYS}d — need at least ${MIN_ORDERS_FOR_CANCELLATION_RATE} before evaluating cancellation rate.`,
    };
  }

  const rate = cancelled / total;
  const triggered = rate >= CANCELLATION_RATE_THRESHOLD;
  const pct = Math.round(rate * 100);

  return {
    rule: "rapid_cancellation_rate",
    triggered,
    reason: triggered
      ? `${cancelled}/${total} orders (${pct}%) cancelled in last ${FRAUD_ROLLING_WINDOW_DAYS}d — at or above ${Math.round(CANCELLATION_RATE_THRESHOLD * 100)}% threshold.`
      : `${cancelled}/${total} orders (${pct}%) cancelled in window — below ${Math.round(CANCELLATION_RATE_THRESHOLD * 100)}% threshold.`,
  };
}

/** Run all fraud flag rules; returns only triggered flags. */
export function evaluateFraudFlags(input: {
  profile: TrustSellerProfile;
  orders: TrustOrder[];
  slips: TrustBankSlip[];
  openReportCount: number;
  now?: Date;
}): { rule: string; reason: string }[] {
  const rules = [
    ruleRejectedBankSlips({ slips: input.slips, now: input.now }),
    ruleNewSellerHighFirstOrder({
      profile: input.profile,
      orders: input.orders,
      now: input.now,
    }),
    ruleOpenUnresolvedReports({ openReportCount: input.openReportCount }),
    ruleRapidCancellationRate({ orders: input.orders, now: input.now }),
  ];

  return rules
    .filter((r) => r.triggered)
    .map(({ rule, reason }) => ({ rule, reason }));
}
