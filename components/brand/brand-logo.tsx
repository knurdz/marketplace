import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/brand/logo.png";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
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
