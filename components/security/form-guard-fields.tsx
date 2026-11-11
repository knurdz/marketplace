"use client";

import { useEffect, useState } from "react";
import { issueFormGuardToken } from "@/lib/security/bot-guard";

export function FormGuardFields({ action }: { action: string }) {
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
