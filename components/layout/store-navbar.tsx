import Link from "next/link";
import type { Models } from "node-appwrite";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import { userHasLabel } from "@/lib/appwrite/roles";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  cartItemCount?: number;
};

function NavLinks({
  user,
  className,
}: {
  user: Models.User<Models.Preferences> | null;
  className?: string;
}) {
  return (
    <nav aria-label="Store" className={className}>
      <Link
        href="/"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Home
      </Link>
      <Link
        href="/search"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Browse
      </Link>
      {user ? (
        <Link
          href="/cart"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          Cart
        </Link>
      ) : null}
      {user ? (
        <Link
          href="/orders"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          Orders
        </Link>
      ) : null}
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

function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/search" method="get" className={className} role="search">
      <div className="relative flex min-w-0 flex-1 items-center">
        <Search
          className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          placeholder="Search…"
          maxLength={64}
          aria-label="Search products"
          className="h-8 pl-8 text-sm"
        />
      </div>
      <Button type="submit" size="sm" variant="outline" className="shrink-0">
        Go
      </Button>
    </form>
  );
}

export function StoreNavbar({ user, cartItemCount = 0 }: StoreNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
          <Link href="/" className="shrink-0 font-mono text-sm tracking-tight">
            Knurdz
            <span className="text-accent">.</span>
          </Link>
          <NavLinks
            user={user}
            className="hidden items-center gap-5 md:flex"
          />
          <SearchForm className="hidden min-w-0 max-w-xs flex-1 items-center gap-2 lg:flex" />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="relative gap-1.5" asChild>
                <Link href="/cart" aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}>
                  <ShoppingCart className="size-4" aria-hidden />
                  Cart
                  {cartItemCount > 0 ? (
                    <span className="font-mono text-xs tabular-nums text-accent">
                      ({cartItemCount})
                    </span>
                  ) : null}
                </Link>
              </Button>
              <NotificationBell className="size-10" />
              <Button variant="outline" size="sm" asChild>
                <Link href="/orders">Orders</Link>
              </Button>
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

        <div className="flex items-center gap-2 md:hidden">
          {user ? <NotificationBell className="size-10" /> : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10"
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
                <SearchForm className="flex w-full items-center gap-2" />
                <NavLinks user={user} className="flex flex-col gap-3" />
                {user ? (
                  <Button variant="outline" asChild>
                    <Link href="/orders">Orders</Link>
                  </Button>
                ) : null}
                {user ? (
                  <Button variant="outline" asChild>
                    <Link href="/cart">
                      Cart
                      {cartItemCount > 0 ? ` (${cartItemCount})` : ""}
                    </Link>
                  </Button>
                ) : null}
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
      </div>
    </header>
  );
}
