import Link from "next/link";
import { Suspense } from "react";
import {
  Heart,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  UserRound,
} from "lucide-react";
import {
  portalHomeForSessionUser,
  type SessionUserView,
} from "@/lib/backend/session-user";
import { BrandLogo, BrandLogoLink } from "@/components/brand/brand-logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { NavCountBadge } from "@/components/layout/nav-count-badge";
import { ProductSearchForm } from "@/components/layout/product-search-form";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { BuyerCommerceCounts } from "@/lib/services/buyer-commerce-counts";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type StoreNavbarProps = {
  user: SessionUserView | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  counts?: BuyerCommerceCounts | null;
};

function wishlistAriaLabel(count: number): string {
  return count > 0 ? `Wishlist, ${count} saved` : "Wishlist";
}

function pendingRequestsAriaLabel(count: number): string {
  return count > 0 ? `Requests, ${count} pending` : "Requests";
}

function allRequestsAriaLabel(count: number): string {
  return count > 0 ? `Requests, ${count}` : "Requests";
}

function SearchFormFallback({ className }: { className?: string }) {
  return (
    <form action="/search" method="get" className={className} role="search">
      <div className="relative flex w-full items-center rounded-full border border-border bg-muted/70">
        <Search
          className="pointer-events-none absolute left-4 size-4 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          placeholder="Search listings"
          maxLength={64}
          aria-label="Search products"
          className="h-10 w-full min-w-0 rounded-full bg-transparent pr-12 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <Search className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function SearchForm({ className }: { className?: string }) {
  return (
    <Suspense fallback={<SearchFormFallback className={className} />}>
      <ProductSearchForm className={className} />
    </Suspense>
  );
}

export function StoreNavbar({
  user,
  displayName,
  avatarUrl,
  counts,
}: StoreNavbarProps) {
  const wishlistCount = counts?.wishlist ?? 0;
  const requestCount = counts?.requests ?? 0;
  const pendingCount = counts?.pendingRequests ?? 0;
  const portalHome = user ? portalHomeForSessionUser(user) : null;
  const portalLabel =
    portalHome === "/admin"
      ? "Admin"
      : portalHome === "/seller"
        ? "Seller"
        : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_minmax(0,40rem)_1fr] md:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-start">
          <BrandLogoLink priority />
        </div>

        <SearchForm className="hidden w-full justify-self-center md:flex" />

        <div className="hidden items-center justify-end gap-1 md:flex">
          {user ? (
            <>
              {portalHome ? (
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <Link href={portalHome}>
                    <LayoutDashboard className="size-5" aria-hidden />
                    {portalLabel} portal
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="icon" className="relative" asChild>
                    <Link href="/wishlist" aria-label={wishlistAriaLabel(wishlistCount)}>
                      <Heart className="size-5" aria-hidden />
                      <NavCountBadge
                        count={wishlistCount}
                        tone="wishlist"
                        className="absolute -top-1 -right-1 ring-2 ring-background"
                      />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="relative" asChild>
                    <Link
                      href="/requests?filter=open"
                      aria-label={pendingRequestsAriaLabel(pendingCount)}
                    >
                      <Package className="size-5" aria-hidden />
                      <NavCountBadge
                        count={pendingCount}
                        tone="pending"
                        className="absolute -top-1 -right-1 ring-2 ring-background"
                      />
                    </Link>
                  </Button>
                </>
              )}
              <NotificationBell className="size-10" />
              <AccountMenu
                user={user}
                displayName={displayName}
                avatarUrl={avatarUrl}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/register">Create account</Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link href="/login">
                  <UserRound className="size-5" aria-hidden />
                  Sign in
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-1 md:hidden">
          {user && !portalHome ? (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/wishlist" aria-label={wishlistAriaLabel(wishlistCount)}>
                  <Heart className="size-5" aria-hidden />
                  <NavCountBadge
                    count={wishlistCount}
                    tone="wishlist"
                    className="absolute -top-1 -right-1 ring-2 ring-background"
                  />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link
                  href="/requests?filter=open"
                  aria-label={pendingRequestsAriaLabel(pendingCount)}
                >
                  <Package className="size-5" aria-hidden />
                  <NavCountBadge
                    count={pendingCount}
                    tone="pending"
                    className="absolute -top-1 -right-1 ring-2 ring-background"
                  />
                </Link>
              </Button>
              <NotificationBell className="size-10" />
            </>
          ) : user ? (
            <NotificationBell className="size-10" />
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <BrandLogo className="h-11" />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4 px-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    {portalHome ? (
                      <Button variant="secondary" asChild>
                        <Link href={portalHome}>{portalLabel} portal</Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="secondary" className="justify-between" asChild>
                          <Link href="/requests" aria-label={allRequestsAriaLabel(requestCount)}>
                            Requests
                            <NavCountBadge count={requestCount} tone="requests" />
                          </Link>
                        </Button>
                        <Button variant="secondary" className="justify-between" asChild>
                          <Link href="/wishlist" aria-label={wishlistAriaLabel(wishlistCount)}>
                            Wishlist
                            <NavCountBadge count={wishlistCount} tone="wishlist" />
                          </Link>
                        </Button>
                        <Button variant="secondary" asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </Button>
                      </>
                    )}
                    <Button variant="secondary" asChild>
                      <Link href="/account">Account</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link href="/register">Create account</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchForm className="flex w-full" />
      </div>
    </header>
  );
}
