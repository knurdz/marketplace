/**
 * Thin row shapes for marketplace contracts (SCHEMA fields + `$id`).
 */

import type {
  ProductStatus,
  PurchaseRequestStatus,
  ReportStatus,
  ReviewStatus,
  SellerStatus,
} from "./status";

export type Category = {
  $id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageFileId: string | null;
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
  featured: boolean;
};

export type ProductImage = {
  $id: string;
  productId: string;
  fileId: string;
  sortOrder: number;
  alt: string | null;
};

export type WishlistItem = {
  $id: string;
  userId: string;
  productId: string;
};

/** Live product join + validation flags for wishlist UI. */
export type WishlistLineIssue = "ok" | "inactive" | "unavailable" | "missing";

export type WishlistLine = {
  item: WishlistItem;
  product: Product | null;
  issue: WishlistLineIssue;
};

export type WishlistView = {
  lines: WishlistLine[];
  itemCount: number;
};

export type SellerProfile = {
  $id: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string | null;
  bannerFileId: string | null;
  status: SellerStatus;
  rejectionReason: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
};

export type PurchaseRequest = {
  $id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  status: PurchaseRequestStatus;
  $createdAt?: string;
  $updatedAt?: string;
};

/** Contact details revealed only to the other party on a request (and admin). */
export type PurchaseRequestContact = {
  phone: string | null;
  email: string | null;
  displayName: string | null;
};

export type PurchaseRequestDetail = {
  request: PurchaseRequest;
  /** Counterparty contact for the signed-in participant. */
  contact: PurchaseRequestContact;
};

export type Review = {
  $id: string;
  requestId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  $createdAt?: string;
};

export type Report = {
  $id: string;
  reporterId: string;
  productId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
};

export type Notification = {
  $id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  meta: string | null;
  $createdAt?: string;
};

export type PlatformSetting = {
  $id: string;
  key: string;
  value: string;
  description: string | null;
};

export type AuditLogEntry = {
  $id: string;
  actorId: string | null;
  event: string;
  resourceType: string;
  resourceId: string | null;
  meta: string | null;
  ip: string | null;
  $createdAt?: string;
};
