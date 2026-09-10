"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight + 300) {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 250px 0px" },
    );

    observer.observe(node);

    // Fallback safety timeout so content is never stuck invisible
    const safetyTimer = setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 600);

    return () => {
      observer.disconnect();
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out-expo",
        visible
          ? "translate-y-0 opacity-100"
          : "motion-safe:translate-y-4 motion-safe:opacity-0",
        className,
      )}
      style={
        visible && delayMs
          ? ({ transitionDelay: `${delayMs}ms` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
