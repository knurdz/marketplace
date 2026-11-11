import type { ReactNode } from "react";
import { signOut } from "@/lib/backend/auth";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export function PendingSellerShell({ children }: { children: ReactNode }) {
  return (
    <div className="portal flex min-h-dvh flex-col bg-background text-foreground">
      <SkipToContent />
      <header className="flex h-16 items-center justify-between px-4 md:px-6">
        <p className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-sm font-bold text-accent-foreground">
            K
          </span>
          Knurdz
        </p>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 px-4 py-10 outline-none md:px-8"
      >
        {children}
      </main>
    </div>
  );
}
