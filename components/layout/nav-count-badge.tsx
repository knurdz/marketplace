import { cn } from "@/lib/utils";

/** Wishlist rose, all-requests sky, pending (requested) amber. */
export type NavCountTone = "wishlist" | "requests" | "pending";

const TONE_CLASS: Record<NavCountTone, string> = {
  wishlist: "bg-rose-500 text-white",
  requests: "bg-sky-600 text-white",
  pending: "bg-amber-500 text-amber-950",
};

export function formatNavCount(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

export function NavCountBadge({
  count,
  tone,
  className,
}: {
  count: number;
  tone: NavCountTone;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums",
        TONE_CLASS[tone],
        className,
      )}
    >
      {formatNavCount(count)}
    </span>
  );
}
