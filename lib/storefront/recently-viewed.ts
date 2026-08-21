/** Client-only localStorage key for recently viewed product ids (guest-safe). */
export const RECENTLY_VIEWED_STORAGE_KEY = "knurdz:recently-viewed";

export const RECENTLY_VIEWED_MAX = 12;

/** Read recently viewed ids from localStorage (newest first). */
export function readRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((id): id is string => typeof id === "string" && id.length > 0)
      .slice(0, RECENTLY_VIEWED_MAX);
  } catch {
    return [];
  }
}

/** Record a product view (moves id to front, caps list). */
export function recordRecentlyViewed(productId: string): void {
  if (typeof window === "undefined") return;
  const trimmed = productId.trim();
  if (!trimmed) return;

  const existing = readRecentlyViewedIds().filter((id) => id !== trimmed);
  const next = [trimmed, ...existing].slice(0, RECENTLY_VIEWED_MAX);

  try {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    /* quota / private mode */
  }
}
