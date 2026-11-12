"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const SCROLL_EDGE_THRESHOLD = 4;

type HorizontalFadeScrollProps = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
};

export function HorizontalFadeScroll({
  children,
  className,
  trackClassName,
}: HorizontalFadeScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [showStartFade, setShowStartFade] = useState(false);
  const [showEndFade, setShowEndFade] = useState(false);

  const syncFades = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const overflow = max > SCROLL_EDGE_THRESHOLD;
    setShowStartFade(overflow && track.scrollLeft > SCROLL_EDGE_THRESHOLD);
    setShowEndFade(overflow && track.scrollLeft < max - SCROLL_EDGE_THRESHOLD);
  }, []);

  useEffect(() => {
    syncFades();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(syncFades);
    observer.observe(track);
    const content = track.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [syncFades]);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <div
        ref={trackRef}
        onScroll={syncFades}
        className={cn(
          "scrollbar-none w-full min-w-0 overflow-x-auto",
          trackClassName,
        )}
      >
        {children}
      </div>
      {showStartFade ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
        />
      ) : null}
      {showEndFade ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        />
      ) : null}
    </div>
  );
}
