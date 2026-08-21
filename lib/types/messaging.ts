export type Thread = {
  $id: string;
  buyerId: string;
  sellerId: string;
  orderId: string;
  lastMessageAt: string | null;
};

export type Message = {
  $id: string;
  threadId: string;
  senderId: string;
  body: string;
};
