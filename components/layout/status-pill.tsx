import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "positive" | "warning" | "danger" | "info";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  positive: "border-accent/40 bg-accent/10 text-accent",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-border bg-card text-foreground",
};

/**
 * Small status chip for portal tables. Callers map their own domain status to
 * a tone so the canonical enums in `lib/types/status.ts` stay the source of truth.
 */
export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[11px] font-normal", TONE_CLASS[tone], className)}
    >
      {label}
    </Badge>
  );
}
