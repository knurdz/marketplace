import Link from "next/link";
import type { Models } from "node-appwrite";
import { Menu } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import { userHasLabel } from "@/lib/appwrite/roles";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type StoreNavbarProps = {
  user: Models.User<Models.Preferences> | null;
};

function NavLinks({
  user,
  className,
}: {
  user: Models.User<Models.Preferences> | null;
  className?: string;
}) {
  return (
    <nav className={className}>
      <Link
        href="/"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Home
      </Link>
      <Link
        href="/#"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Browse
      </Link>
      {user && userHasLabel(user, "seller") ? (
        <Link
          href="/seller"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          Seller
        </Link>
      ) : null}
      {user && userHasLabel(user, "admin") ? (
        <Link
          href="/admin"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          Admin
        </Link>
      ) : null}
    </nav>
  );
}

export function StoreNavbar({ user }: StoreNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-mono text-sm tracking-tight">
            Knurdz
            <span className="text-accent">.</span>
          </Link>
          <NavLinks
            user={user}
            className="hidden items-center gap-5 md:flex"
          />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/account">Account</Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="font-mono text-left">
                Knurdz<span className="text-accent">.</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4 px-4">
              <NavLinks user={user} className="flex flex-col gap-3" />
              <Separator />
              {user ? (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/account">Account</Link>
                  </Button>
                  <form action={signOut}>
                    <Button type="submit" variant="ghost" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
