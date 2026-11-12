import type { Metadata } from "next";
import { getAppUrl } from "@/lib/config/app";

export const SITE_NAME = "Knurdz Marketplace";
export const SITE_TITLE_DEFAULT = `${SITE_NAME} | Buy Directly from People`;
export const SITE_DESCRIPTION =
  "Community marketplace in Sri Lanka to buy and sell directly with people. Browse verified local shops, send direct purchase requests, and pay zero platform fees.";
export const SITE_LOCALE = "en_LK";
export const DEFAULT_OG_IMAGE_PATH = "/brand/logo.png";

const MAX_META_DESCRIPTION_LENGTH = 160;

/** Safe URL instance for Next.js `metadataBase`. */
export function getMetadataBase(): URL {
  try {
    return new URL(getAppUrl());
  } catch {
    return new URL("https://marketplace.knurdz.org");
  }
}

/** Normalize whitespace and cleanly truncate meta descriptions to ~160 chars. */
export function truncateMetaDescription(
  raw: string | null | undefined,
  fallback = SITE_DESCRIPTION,
  maxLength = MAX_META_DESCRIPTION_LENGTH,
): string {
  const cleaned = raw?.replace(/\s+/g, " ").trim() ?? "";
  if (!cleaned) return fallback;
  if (cleaned.length <= maxLength) return cleaned;

  const sliced = cleaned.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const boundary = lastSpace >= Math.floor(maxLength * 0.6) ? lastSpace : sliced.length;
  return `${sliced.slice(0, boundary).replace(/[.,;:!?-]+$/, "")}…`;
}

/** Resolve a relative or absolute path against the public app origin. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return getAppUrl();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = getAppUrl().replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${normalizedPath}`;
}

export type BuildPublicMetadataOptions = {
  title: string;
  description?: string | null;
  /** Canonical path starting with `/` (e.g. `/products/123`). */
  canonicalPath: string;
  image?: {
    url: string;
    alt?: string | null;
    width?: number;
    height?: number;
  } | null;
  type?: "website" | "article";
  /** Set true for filtered/search views that should not be indexed. */
  noIndex?: boolean;
  /** Whether links on a noIndex page should still be followed by crawlers. */
  follow?: boolean;
  keywords?: string[];
};

/**
 * Construct consistent public page Metadata with canonical URL, Open Graph,
 * Twitter Summary Large Image card, and optional robots directives.
 */
export function buildPublicMetadata(
  opts: BuildPublicMetadataOptions,
): Metadata {
  const description = truncateMetaDescription(opts.description);
  const canonical = opts.canonicalPath.startsWith("/")
    ? opts.canonicalPath
    : `/${opts.canonicalPath}`;
  const ogImageUrl = opts.image?.url
    ? toAbsoluteUrl(opts.image.url)
    : toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const ogImageAlt = opts.image?.alt?.trim() || `${opts.title} | ${SITE_NAME}`;

  const images = [
    {
      url: ogImageUrl,
      alt: ogImageAlt,
      ...(opts.image?.width ? { width: opts.image.width } : {}),
      ...(opts.image?.height ? { height: opts.image.height } : {}),
    },
  ];

  const robots: Metadata["robots"] = opts.noIndex
    ? {
        index: false,
        follow: opts.follow ?? true,
        googleBot: {
          index: false,
          follow: opts.follow ?? true,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      };

  return {
    title: opts.title,
    description,
    ...(opts.keywords && opts.keywords.length > 0
      ? { keywords: opts.keywords }
      : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      title: opts.title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: opts.type ?? "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
      images: [ogImageUrl],
    },
    robots,
  };
}

/** Reusable metadata preset for private/authenticated portals and utility pages. */
export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

/** Build noindex metadata with a specific page title. */
export function buildNoIndexMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    ...(description ? { description: truncateMetaDescription(description) } : {}),
    ...NOINDEX_METADATA,
  };
}
