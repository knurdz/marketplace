import { useId } from "react";

/**
 * Route-level loading chrome for App Router loading.tsx files.
 * Forms should keep button pending labels; use this for segment navigations.
 */
const CX = 36;
const CY = 36;
const ORBIT_R = 26;
const HEAD_R = 4;
const TRAIL_DEG = 62;
const STROKE_W = 4;

const COMETS = [
  { opacity: 1 },
  { opacity: 0.62 },
  { opacity: 0.38 },
  { opacity: 0.22 },
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

function OrbitLoader() {
  const baseId = useId().replace(/:/g, "");
  const headDeg = 0;
  const head = polar(headDeg);
  const tail = polar(headDeg - TRAIL_DEG);

  return (
    <svg
      className="knurdz-orbit-loader size-[4.75rem]"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden
    >
      <circle
        cx={CX}
        cy={CY}
        r={ORBIT_R}
        className="stroke-muted/25"
        strokeWidth="0.75"
      />
      <defs>
        {COMETS.map((_, i) => (
          <linearGradient
            key={i}
            id={`${baseId}-g-${i}`}
            gradientUnits="userSpaceOnUse"
            x1={tail.x}
            y1={tail.y}
            x2={head.x}
            y2={head.y}
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        ))}
        <filter
          id={`${baseId}-glow`}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${baseId}-glow)`}>
        {COMETS.map((comet, i) => (
          <g
            key={i}
            transform={`rotate(${i * 90} ${CX} ${CY})`}
            opacity={comet.opacity}
          >
            <path
              d={trailArc(headDeg)}
              stroke={`url(#${baseId}-g-${i})`}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
            />
            <circle cx={head.x} cy={head.y} r={HEAD_R} fill="currentColor" />
          </g>
        ))}
      </g>
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
      <OrbitLoader />
    </div>
  );
}
