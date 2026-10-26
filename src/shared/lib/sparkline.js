// Polyline points for a tiny inline trend line. Returns null when there
// aren't at least two real numbers to connect — callers render an
// "not enough history" state instead of a flat fake line.
export function buildSparklinePoints(values, width = 120, height = 36, padding = 3) {
  const nums = (values || []).filter((v) => typeof v === "number" && Number.isFinite(v));
  if (nums.length < 2) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  return nums
    .map((v, i) => {
      const x = padding + (i / (nums.length - 1)) * innerW;
      const y = padding + innerH - ((v - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
