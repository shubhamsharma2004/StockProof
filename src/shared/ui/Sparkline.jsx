import { useId } from "react";
import { buildSparklinePoints } from "../lib/sparkline.js";

// `filled` adds the soft gradient wash under the line used on the
// dashboard's mover cards; the research score cards keep the bare line.
export default function Sparkline({ values, width = 120, height = 36, tone = "accent", filled = false }) {
  const gradientId = useId();
  const points = buildSparklinePoints(values, width, height);
  if (!points) return <span className="sparkline-empty">Not enough history</span>;

  const nums = values.filter((v) => typeof v === "number");
  const rising = nums[nums.length - 1] >= nums[0];
  const strokeTone = tone === "auto" ? (rising ? "positive" : "negative") : tone;
  const coords = points.split(" ");
  const first = coords[0].split(",")[0];
  const last = coords[coords.length - 1].split(",")[0];

  return (
    <svg className={`sparkline sparkline--${strokeTone}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {filled ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`${first},${height} ${points} ${last},${height}`} fill={`url(#${gradientId})`} stroke="none" />
        </>
      ) : null}
      <polyline points={points} fill="none" strokeWidth={filled ? 1.6 : 2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
