/** Map seller application validation messages to form field keys. */
export function sellerApplicationFieldErrors(
  message: string,
): Partial<Record<"shopName" | "slug" | "bio", string>> {
  const lower = message.toLowerCase();
  if (lower.startsWith("shop name")) return { shopName: message };
  if (lower.includes("slug")) return { slug: message };
  if (lower.startsWith("bio")) return { bio: message };
  return { shopName: message };
}
