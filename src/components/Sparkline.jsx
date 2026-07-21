import { buildSparklinePoints } from "../insights.js";

export default function Sparkline({ values, width = 120, height = 36, tone = "accent" }) {
  const points = buildSparklinePoints(values, width, height);
  if (!points) return <span className="sparkline-empty">Not enough history</span>;

  const nums = values.filter((v) => typeof v === "number");
  const rising = nums[nums.length - 1] >= nums[0];
  const strokeTone = tone === "auto" ? (rising ? "positive" : "negative") : tone;

  return (
    <svg className={`sparkline sparkline--${strokeTone}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
