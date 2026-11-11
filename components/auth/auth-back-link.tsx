import type { ReactNode } from "react";
import Link from "next/link";
import { AUTH_OUTLINE_BUTTON_CLASS } from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";

type AuthBackLinkProps = {
  href: string;
  children: ReactNode;
};

/** Full-width outline control for “back to sign in” style navigation on auth pages. */
export function AuthBackLink({ href, children }: AuthBackLinkProps) {
  return (
    <Button asChild variant="outline" className={AUTH_OUTLINE_BUTTON_CLASS}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
