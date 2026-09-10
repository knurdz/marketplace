"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

function subscribe() {
  return () => {};
}

function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();

  // Match SSR + first client paint to avoid aria/icon hydration mismatches.
  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        aria-label="Toggle color theme"
      >
        <Sun className="size-4 opacity-0" aria-hidden />
      </Button>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        className="size-4 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        className="absolute size-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100"
        aria-hidden
      />
    </Button>
  );
}
