/**
 * Thin row shapes for marketplace contracts (SCHEMA fields + `$id`).
 * Members 2–4 import these instead of inventing parallel types.
 */

import type {
  BankSlipStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  ReportStatus,
  SellerStatus,
} from "./status";

export type Category = {
  $id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
};

export type Product = {
  $id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  status: ProductStatus;
  stock: number;
  available: boolean;
  currency: string;
};

export type ProductImage = {
  $id: string;
  productId: string;
  fileId: string;
  sortOrder: number;
  alt: string | null;
};

export type SellerProfile = {
  $id: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  bannerFileId: string | null;
  status: SellerStatus;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  rejectionReason: string | null;
};

export type Order = {
  $id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
};

export type OrderItem = {
  $id: string;
  orderId: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Payment = {
  $id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  payherePaymentId: string | null;
  idempotencyKey: string | null;
};

export type BankSlip = {
  $id: string;
  paymentId: string;
  orderId: string;
  fileId: string;
  uploadedBy: string;
  status: BankSlipStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
};

export type Report = {
  $id: string;
  reporterId: string;
  productId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
};
