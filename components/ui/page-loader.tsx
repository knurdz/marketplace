import { useId } from "react";

/**
 * Route-level loading chrome for App Router loading.tsx files.
 * Forms should keep button pending labels; use this for segment navigations.
 */
const CX = 32;
const CY = 32;
const ORBIT_R = 22;
const HEAD_R = 3.75;
/** Degrees of arc behind each orb (tail trails clockwise motion). */
const TRAIL_DEG = 78;
const STROKE_W = 3.25;

const ORBS = [
  { opacity: 1 },
  { opacity: 0.55 },
  { opacity: 0.35 },
] as const;

function polar(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + ORBIT_R * Math.sin(rad),
    y: CY - ORBIT_R * Math.cos(rad),
  };
}

function trailArc(headDeg: number) {
  const tailDeg = headDeg - TRAIL_DEG;
  const head = polar(headDeg);
  const tail = polar(tailDeg);
  return `M ${tail.x.toFixed(3)} ${tail.y.toFixed(3)} A ${ORBIT_R} ${ORBIT_R} 0 0 1 ${head.x.toFixed(3)} ${head.y.toFixed(3)}`;
}

function OrbitalSpinner() {
  const baseId = useId().replace(/:/g, "");
  const headDeg = 0;
  const head = polar(headDeg);
  const tail = polar(headDeg - TRAIL_DEG);

  return (
    <svg
      className="knurdz-orbit size-16"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <defs>
        {ORBS.map((_, i) => (
          <linearGradient
            key={i}
            id={`${baseId}-trail-${i}`}
            gradientUnits="userSpaceOnUse"
            x1={tail.x}
            y1={tail.y}
            x2={head.x}
            y2={head.y}
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="45%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        ))}
      </defs>
      {ORBS.map((orb, i) => (
        <g
          key={i}
          transform={`rotate(${i * 120} ${CX} ${CY})`}
          opacity={orb.opacity}
        >
          <path
            d={trailArc(headDeg)}
            stroke={`url(#${baseId}-trail-${i})`}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
          />
          <circle
            cx={head.x}
            cy={head.y}
            r={HEAD_R}
            fill="currentColor"
          />
        </g>
      ))}
    </svg>
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="mx-auto flex min-h-[40vh] w-full max-w-5xl items-center justify-center px-6 py-16"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <OrbitalSpinner />
    </div>
  );
}
