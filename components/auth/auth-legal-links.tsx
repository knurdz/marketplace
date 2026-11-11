import Link from "next/link";

export function AuthLegalLinks() {
  return (
    <p className="text-center text-xs leading-relaxed text-muted-foreground">
      By continuing, you agree to our{" "}
      <Link
        href="/legal/terms"
        className="font-semibold text-primary underline-offset-4 hover:underline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/legal/privacy"
        className="font-semibold text-primary underline-offset-4 hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
