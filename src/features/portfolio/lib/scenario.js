const MS_YEAR = 365.25 * 24 * 3600 * 1000;

export function toDateInputValue(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function nearestPoint(points, targetMs) {
  if (!points.length) return null;
  let best = points[0];
  let bestDiff = Math.abs(points[0].t - targetMs);
  for (const p of points) {
    const diff = Math.abs(p.t - targetMs);
    if (diff < bestDiff) {
      best = p;
      bestDiff = diff;
    }
  }
  return best;
}

// A buy/sell "what if" on real closing prices, snapped to the nearest
// trading day. Dates entered in reverse are swapped (and flagged) rather
// than rejected. Returns null when inputs aren't usable yet.
export function computeScenario(points, buyDate, sellDate, amount) {
  if (!points?.length || !buyDate || !sellDate) return null;
  const buyPoint = nearestPoint(points, new Date(buyDate).getTime());
  const sellPoint = nearestPoint(points, new Date(sellDate).getTime());
  if (!buyPoint || !sellPoint || !(amount > 0)) return null;

  const [earlier, later] = buyPoint.t <= sellPoint.t ? [buyPoint, sellPoint] : [sellPoint, buyPoint];
  const units = amount / earlier.c;
  const finalValue = units * later.c;
  const gain = finalValue - amount;
  const percent = ((later.c - earlier.c) / earlier.c) * 100;
  const years = (later.t - earlier.t) / MS_YEAR;
  const cagr = years > 0.08 ? (Math.pow(finalValue / amount, 1 / years) - 1) * 100 : null;
  const slice = points.filter((p) => p.t >= earlier.t && p.t <= later.t);

  return { buyPoint: earlier, sellPoint: later, units, finalValue, gain, percent, years, cagr, slice, reversed: buyPoint.t > sellPoint.t };
}
