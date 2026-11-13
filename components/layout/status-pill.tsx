import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "positive"
  | "warning"
  | "danger"
  | "info"
  | "suspended";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral:
    "border-border/80 bg-background text-muted-foreground dark:bg-muted/30",
  positive:
    "border-emerald-200/80 bg-emerald-50/70 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning:
    "border-amber-200/90 bg-amber-50/80 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
  danger:
    "border-rose-200/80 bg-rose-50/70 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300",
  info:
    "border-sky-200/80 bg-sky-50/70 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300",
  suspended:
    "border-orange-300/85 bg-orange-50/75 text-orange-900 dark:border-orange-700/70 dark:bg-orange-950/45 dark:text-orange-300",
};

const DOT_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/70",
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  suspended: "bg-orange-600 dark:bg-orange-500",
};

function formatStatusLabel(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Small status chip for portal tables matching the reference table aesthetic.
 * Callers map their own domain status to a tone so the canonical enums in
 * `lib/types/status.ts` stay the source of truth.
 */
export function StatusPill({
  label,
  tone = "neutral",
  className,
  showDot = true,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
  showDot?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 rounded-md px-2 py-0.5 font-sans text-xs font-medium shadow-2xs",
        TONE_CLASS[tone],
        className,
      )}
    >
      {showDot ? (
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[tone])}
        />
      ) : null}
      {formatStatusLabel(label)}
    </Badge>
  );
}
