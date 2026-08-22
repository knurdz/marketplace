/**
 * Runnable checks for bank-slip approve/reject eligibility (step 6.14).
 * Run: npx tsx scripts/verify-bank-slip-review.ts
 */
import type { BankSlip, Order, Payment } from "../lib/types";
import {
  BANK_SLIP_ALREADY_APPROVED,
  BANK_SLIP_ALREADY_REJECTED,
  BANK_SLIP_NOT_BANK_TRANSFER,
  BANK_SLIP_ORDER_CANCELLED,
  BANK_SLIP_ORDER_REFUNDED,
  BANK_SLIP_PAYMENT_ALREADY_PAID,
  BANK_SLIP_REJECT_PAID,
  BANK_SLIP_REJECT_REFUNDED,
  bankConfirmIdempotencyKey,
  canSellerReviewBankSlip,
  evaluateBankSlipApprove,
  evaluateBankSlipReject,
  evaluateBankSlipRejectAndCancel,
  shouldListPendingBankSlip,
} from "../lib/services/bank-slip-review-rules";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    $id: "ord_1",
    buyerId: "buyer_1",
    sellerId: "seller_1",
    status: "payment_review",
    totalAmount: 500,
    currency: "LKR",
    shippingAddress: "1 Main St",
    paymentMethod: "bank_transfer",
    couponCode: null,
    discountAmount: 0,
    ...overrides,
  };
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    $id: "pay_1",
    orderId: "ord_1",
    method: "bank_transfer",
    status: "awaiting_verification",
    amount: 500,
    currency: "LKR",
    payherePaymentId: null,
    idempotencyKey: null,
    ...overrides,
  };
}

function slip(overrides: Partial<BankSlip> = {}): BankSlip {
  return {
    $id: "slip_1",
    paymentId: "pay_1",
    orderId: "ord_1",
    fileId: "file_1",
    uploadedBy: "buyer_1",
    status: "pending",
    reviewedBy: null,
    reviewNote: null,
    ...overrides,
  };
}

function approve(overrides?: {
  slip?: Partial<BankSlip>;
  payment?: Partial<Payment>;
  order?: Partial<Order>;
}) {
  return evaluateBankSlipApprove({
    slip: slip(overrides?.slip),
    payment: payment(overrides?.payment),
    order: order(overrides?.order),
  });
}

function reject(overrides?: {
  slip?: Partial<BankSlip>;
  payment?: Partial<Payment>;
  order?: Partial<Order>;
}) {
  return evaluateBankSlipReject({
    slip: slip(overrides?.slip),
    payment: payment(overrides?.payment),
    order: order(overrides?.order),
  });
}

assert(
  bankConfirmIdempotencyKey("ord_1") === "bank:ord_1",
  "idempotency key prefix",
);

assert(approve().action === "settle", "happy-path approve settles");
assert(reject().action === "reopen", "happy-path reject reopens for retry");

assert(
  approve({ slip: { status: "approved" } }).action === "noop" &&
    (approve({ slip: { status: "approved" } }) as { message: string }).message ===
      BANK_SLIP_ALREADY_APPROVED,
  "replay approve of approved slip is noop",
);

assert(
  reject({ slip: { status: "rejected" } }).action === "noop" &&
    (reject({ slip: { status: "rejected" } }) as { message: string }).message ===
      BANK_SLIP_ALREADY_REJECTED,
  "replay reject of rejected slip is noop",
);

assert(
  approve({ payment: { status: "paid" } }).action === "noop" &&
    (approve({ payment: { status: "paid" } }) as { message: string }).message ===
      BANK_SLIP_PAYMENT_ALREADY_PAID,
  "sibling pending + already-paid approve is noop",
);

const rejectPaid = reject({ payment: { status: "paid" } });
assert(rejectPaid.action === "refuse", "reject must not touch paid");
assert(
  rejectPaid.action === "refuse" && rejectPaid.error === BANK_SLIP_REJECT_PAID,
  "reject-after-paid error",
);

const rejectRefunded = reject({
  payment: { status: "refunded" },
  order: { status: "refunded" },
});
assert(rejectRefunded.action === "refuse", "reject must not touch refunded");
assert(
  rejectRefunded.action === "refuse" &&
    rejectRefunded.error === BANK_SLIP_REJECT_REFUNDED,
  "reject-after-refunded error",
);

const approveCancelled = approve({
  order: { status: "cancelled" },
  payment: { status: "failed" },
});
assert(approveCancelled.action === "refuse", "approve refuses cancelled order");
assert(
  approveCancelled.action === "refuse" &&
    approveCancelled.error === BANK_SLIP_ORDER_CANCELLED,
  "approve-after-cancel error",
);

const approveRefunded = approve({
  order: { status: "refunded" },
  payment: { status: "refunded" },
});
assert(approveRefunded.action === "refuse", "approve refuses refunded order");
assert(
  approveRefunded.action === "refuse" &&
    approveRefunded.error === BANK_SLIP_ORDER_REFUNDED,
  "approve-after-refund error",
);

assert(
  approve({ payment: { method: "payhere" }, order: { paymentMethod: "payhere" } })
    .action === "refuse" &&
    (
      approve({
        payment: { method: "payhere" },
        order: { paymentMethod: "payhere" },
      }) as { error: string }
    ).error === BANK_SLIP_NOT_BANK_TRANSFER,
  "non-bank method refused",
);

assert(
  reject({
    payment: { status: "failed" },
    order: { status: "cancelled" },
  }).action === "settle_slip_only",
  "cancel leftover closes slip without rewriting payment",
);

assert(
  reject({
    order: { status: "cancelled" },
  }).action === "settle_slip_only",
  "cancelled + still-awaiting reject closes slip only",
);

assert(
  shouldListPendingBankSlip({
    slip: slip(),
    payment: payment(),
    order: order(),
  }),
  "queue lists pending + awaiting_verification",
);

assert(
  !shouldListPendingBankSlip({
    slip: slip(),
    payment: payment({ status: "paid" }),
    order: order({ status: "paid" }),
  }),
  "queue hides leftover after approve",
);

assert(
  !shouldListPendingBankSlip({
    slip: slip(),
    payment: payment({ status: "failed" }),
    order: order({ status: "cancelled" }),
  }),
  "queue hides leftover after cancel",
);

assert(
  !shouldListPendingBankSlip({
    slip: slip(),
    payment: null,
    order: order(),
  }),
  "queue hides unverifiable payment",
);

assert(
  evaluateBankSlipRejectAndCancel({
    slip: slip(),
    payment: payment(),
    order: order(),
  }).action === "cancel",
  "reject-and-cancel eligible row",
);

assert(
  evaluateBankSlipRejectAndCancel({
    slip: slip(),
    payment: payment({ status: "paid" }),
    order: order({ status: "paid" }),
  }).action === "refuse",
  "reject-and-cancel refuses paid",
);

assert(
  canSellerReviewBankSlip("seller_1", "seller_1"),
  "owning seller may review",
);
assert(
  !canSellerReviewBankSlip("seller_2", "seller_1"),
  "other seller must not review",
);
assert(
  !canSellerReviewBankSlip("admin_1", "seller_1"),
  "admin id without ownership must not review",
);

console.log("verify-bank-slip-review: OK");
