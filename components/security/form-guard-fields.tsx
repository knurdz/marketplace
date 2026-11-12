"use client";

import { useEffect, useState } from "react";
import { issueFormGuardToken } from "@/lib/security/bot-guard";

export function FormGuardFields({
  action,
  onGuardReady,
}: {
  action: string;
  /** Fires when the signed `_fg` token is present (or cleared on unmount). */
  onGuardReady?: (ready: boolean) => void;
}) {
  const [token, setToken] = useState("");

  useEffect(() => {
    let active = true;
    void issueFormGuardToken(action).then((value) => {
      if (active) setToken(value);
    });
    return () => {
      active = false;
    };
  }, [action]);

  useEffect(() => {
    onGuardReady?.(token.length > 0);
  }, [token, onGuardReady]);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor={`company-website-${action}`}>Company website</label>
        <input
          id={`company-website-${action}`}
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="_fg" value={token} />
    </>
  );
}
