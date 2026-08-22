import type { ReactNode } from "react";
import { signOut } from "@/lib/appwrite/auth";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { Button } from "@/components/ui/button";

export function PendingSellerShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipToContent />
      <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
        <p className="text-sm font-semibold tracking-tight">
          Knurdz<span className="text-accent">.</span>
        </p>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
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
