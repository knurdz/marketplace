import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/appwrite/auth";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function AccountPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --session</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Account</h1>
      <p className="mt-2 text-sm text-muted">Signed-in session details.</p>

      <ul className="mt-8 space-y-3 rounded-md border border-border bg-card p-5 font-mono text-sm">
        <li>
          <span className="text-muted">email:</span> {user.email}
        </li>
        <li>
          <span className="text-muted">name:</span> {user.name || "—"}
        </li>
        <li>
          <span className="text-muted">id:</span> {user.$id}
        </li>
      </ul>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-mono text-sm transition hover:bg-card"
        >
          Home
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
