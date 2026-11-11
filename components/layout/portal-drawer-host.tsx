"use client";

import { useLayoutEffect, useRef } from "react";

export const PORTAL_DRAWER_ROOT_ID = "portal-drawer-root";

/** Fixed host aligned to SidebarInset so drawers stay in the main column. */
export function PortalDrawerHost() {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const inset = host?.parentElement;
    if (!host || !inset) return;

    const sync = () => {
      const rect = inset.getBoundingClientRect();
      host.style.left = `${rect.left}px`;
      host.style.width = `${rect.width}px`;
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(inset);
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]');
    if (gap) observer.observe(gap);

    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div
      id={PORTAL_DRAWER_ROOT_ID}
      ref={hostRef}
      className="pointer-events-none fixed inset-y-0 z-50 [&>*]:pointer-events-auto"
    />
  );
}
