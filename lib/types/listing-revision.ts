/** Staged field overrides for an active listing (stored in product_revisions.patch JSON). */

export type RevisionImagePatch = {
  fileId: string;
  sortOrder: number;
  alt: string | null;
};

export type ProductRevisionPatch = {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
  stock?: number;
  available?: boolean;
  images?: RevisionImagePatch[];
};

export type ProductRevision = {
  $id: string;
  productId: string;
  patch: ProductRevisionPatch;
  $createdAt?: string;
  $updatedAt?: string;
};

export type ModerationQueueKind = "new" | "edit";

export type ModerationQueueItem = {
  product: import("./models").Product;
  kind: ModerationQueueKind;
  revision: ProductRevision | null;
  submittedAt: Date;
  changeLines: string[];
};
