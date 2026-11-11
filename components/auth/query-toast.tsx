"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { oauthErrorMessage } from "@/lib/backend/oauth-errors";
import { toast } from "@/lib/ui/toast";

const SAFE_CODE = /^[a-z0-9_]{1,64}$/i;

/**
 * Surfaces `?error=` and `?verified=1` after OAuth and email links.
 * Sonner must already be mounted; this component is rendered after the toaster.
 */
export function QueryToast() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    const error = params.get("error")?.trim() ?? "";
    const verified = params.get("verified") === "1";
    const key = error ? `error:${error}` : verified ? "verified" : "";
    if (!key || shown.current === key) return;
    if (error && !SAFE_CODE.test(error)) return;

    shown.current = key;
    if (error) {
      toast.error(
        oauthErrorMessage(error) ??
          "Something went wrong. Please try again.",
      );
    } else {
      toast.success("Email verified. Sign in to continue.");
    }

    // Keep ?verified=1 and verify-email errors so the page stays on the
    // success or failure message. Other pages only needed the query for the toast.
    if (!error || pathname === "/verify-email") return;
    const next = new URLSearchParams(params.toString());
    next.delete("error");
    next.delete("error_description");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
