import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LoadingStatusProps = {
  label?: string;
  children: ReactNode;
  className?: string;
};

export function LoadingStatus({
  label = "Loading",
  children,
  className,
}: LoadingStatusProps) {
  return (
    <div
      className={cn(className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
