import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function Home() {
  const user = await getLoggedInUser();

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--background-alt)_0%,_transparent_55%)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="font-mono text-sm text-accent">
          $ ./marketplace --storefront
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
          Knurdz
          <span className="text-accent">.</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          A marketplace for creators — browse listings, sell what you build, and
          check out with PayHere, bank transfer, or free.
        </p>

        <p className="mt-4 font-mono text-sm text-muted-foreground">
          {user ? `Signed in as ${user.email}` : "Signed out"}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/#">Browse</Link>
          </Button>
          {user ? (
            <Button variant="outline" size="lg" asChild>
              <Link href="/account">Account</Link>
            </Button>
          ) : (
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
