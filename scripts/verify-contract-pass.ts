/**
 * Phase 6.16 contract pass — asserts MVP freeze in code.
 * Run: npx tsx scripts/verify-contract-pass.ts
 */
import { maskBankAccountNumber } from "../lib/services/seller-approvals";
import { canSubmitListingForReview } from "../lib/services/seller-listings";
import {
  bankConfirmIdempotencyKey,
  evaluateBankSlipApprove,
} from "../lib/services/bank-slip-review-rules";
import {
  evaluateFreeConfirm,
  freeConfirmIdempotencyKey,
} from "../lib/services/free-order-rules";
import {
  ACTIVE_PRODUCT_STATUS,
  canSellerFulfillmentTransition,
  PENDING_REVIEW_PRODUCT_STATUS,
  PRODUCT_STATUSES,
} from "../lib/types/status";
import type { BankSlip, Order, OrderItem, Payment } from "../lib/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// Publish: sellers never submit from active / pending_review / archived
for (const status of PRODUCT_STATUSES) {
  const maySubmit = canSubmitListingForReview(status);
  if (status === "draft" || status === "rejected") {
    assert(maySubmit, `${status} should be submittable`);
  } else {
    assert(!maySubmit, `${status} must not be submittable by seller`);
  }
}

assert(
  ACTIVE_PRODUCT_STATUS === "active",
  "ACTIVE_PRODUCT_STATUS is active",
);
assert(
  PENDING_REVIEW_PRODUCT_STATUS === "pending_review",
  "seller submit target is pending_review not active",
);

// Fulfillment FSM
assert(
  canSellerFulfillmentTransition("paid", "processing"),
  "paid → processing",
);
assert(
  !canSellerFulfillmentTransition("pending_payment", "processing"),
  "unpaid cannot fulfill",
);
assert(
  canSellerFulfillmentTransition("processing", "shipped"),
  "processing → shipped",
);

// Bank masking
assert(
  maskBankAccountNumber("1234567890") === "****7890",
  "maskBankAccountNumber shows last 4",
);
assert(maskBankAccountNumber(null) === null, "null stays null");
assert(
  maskBankAccountNumber("12") === "****",
  "short numbers fully masked",
);

// Idempotency key prefixes
assert(
  freeConfirmIdempotencyKey("ord_1") === "free:ord_1",
  "free idempotency prefix",
);
assert(
  bankConfirmIdempotencyKey("ord_2") === "bank:ord_2",
  "bank idempotency prefix",
);

// Free confirm settles only on pending unpaid early order
const buyerId = "buyer_1";
const baseOrder = {
  $id: "ord_free",
  buyerId,
  paymentMethod: "free",
  totalAmount: 0,
  status: "pending_payment",
} as Order;
const basePayment = {
  $id: "pay_free",
  orderId: "ord_free",
  method: "free",
  amount: 0,
  status: "pending",
} as Payment;
const baseItem = {
  orderId: "ord_free",
  unitPrice: 0,
  lineTotal: 0,
  quantity: 1,
} as OrderItem;

assert(
  evaluateFreeConfirm({
    buyerId,
    order: baseOrder,
    payment: basePayment,
    items: [baseItem],
  }).action === "settle",
  "free eligible order settles",
);

assert(
  evaluateFreeConfirm({
    buyerId,
    order: { ...baseOrder, status: "cancelled" },
    payment: basePayment,
    items: [baseItem],
  }).action === "reject",
  "cancelled free order rejected",
);

// Bank approve settles on awaiting_verification (clamp policy in service layer)
const bankOrder = {
  $id: "ord_bank",
  paymentMethod: "bank_transfer",
  status: "payment_review",
} as Order;
const bankPayment = {
  $id: "pay_bank",
  orderId: "ord_bank",
  method: "bank_transfer",
  status: "awaiting_verification",
} as Payment;
const bankSlip = {
  paymentId: "pay_bank",
  orderId: "ord_bank",
  status: "pending",
} as BankSlip;

assert(
  evaluateBankSlipApprove({
    slip: bankSlip,
    payment: bankPayment,
    order: bankOrder,
  }).action === "settle",
  "bank slip approve settles eligible row",
);

assert(
  evaluateBankSlipApprove({
    slip: bankSlip,
    payment: { ...bankPayment, status: "paid" },
    order: bankOrder,
  }).action === "noop",
  "already paid bank slip is noop",
);

console.log("verify-contract-pass: all checks passed");
