import Link from "next/link";

/**
 * First focusable control — jump past chrome to #main-content.
 * Off-screen until focused (keyboard users).
 */
export function SkipToContent() {
  return (
    <Link
      href="#main-content"
      className="bg-foreground text-background focus:ring-accent fixed left-4 top-4 z-50 -translate-y-[200%] rounded-md px-4 py-2.5 font-mono text-sm outline-none transition-transform focus:translate-y-0 focus:ring-2"
    >
      Skip to content
    </Link>
  );
}
