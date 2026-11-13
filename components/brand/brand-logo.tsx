import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/brand/logo.png";
export const BRAND_LOGO_DARK_SRC = "/brand/logo-dark.png";

type BrandLogoProps = {
  className?: string;
  /** Extra classes for the light-theme image when `themeAware` is set. */
  lightClassName?: string;
  priority?: boolean;
  /** Light theme uses `logo.png`. Dark theme uses `logo-dark.png`. */
  themeAware?: boolean;
};

export function BrandLogo({
  className,
  lightClassName,
  priority = false,
  themeAware = false,
}: BrandLogoProps) {
  if (!themeAware) {
    return (
      <Image
        src={BRAND_LOGO_SRC}
        alt="Knurdz Marketplace"
        width={767}
        height={325}
        priority={priority}
        className={cn("h-12 w-auto", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={BRAND_LOGO_SRC}
        alt="Knurdz Marketplace"
        width={3168}
        height={1344}
        priority={priority}
        className={cn("h-12 w-auto dark:hidden", className, lightClassName)}
      />
      <Image
        src={BRAND_LOGO_DARK_SRC}
        alt=""
        width={2170}
        height={725}
        priority={priority}
        aria-hidden
        className={cn("hidden h-12 w-auto dark:block", className)}
      />
    </>
  );
}

export function BrandLogoLink({ className, priority = false }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="Knurdz Marketplace home"
    >
      <BrandLogo priority={priority} />
    </Link>
  );
}
