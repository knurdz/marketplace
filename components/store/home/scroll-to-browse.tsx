"use client";

import { useEffect } from "react";

/** Scroll to the browse catalog when home page filters are active. */
export function ScrollToBrowse({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("browse")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [enabled]);

  return null;
}
