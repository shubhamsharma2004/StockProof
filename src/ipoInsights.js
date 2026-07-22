// Deterministic classification of real subscription data into a demand
// label. This is NOT a valuation or buy/sell signal — an IPO can be heavily
// oversubscribed and still be a poor investment (retail FOMO is a real,
// well-documented pattern that doesn't correlate reliably with post-listing
// performance). It only describes how eager the market was to get shares,
// nothing about whether the business or the price is any good — that
// requires real fundamentals, which don't exist until a company is listed
// and trading (see insights.js, used for the Recently Listed tab instead).
export function subscriptionStrength(times) {
  if (times == null || Number.isNaN(times)) return { label: "Not enough data", tone: "muted" };
  if (times < 1) return { label: "Undersubscribed", tone: "negative" };
  if (times < 5) return { label: "Moderate Demand", tone: "neutral" };
  if (times < 20) return { label: "Strong Demand", tone: "positive" };
  return { label: "Very Strong Demand", tone: "positive" };
}

export function formatSubscriptionTimes(times) {
  if (times == null || Number.isNaN(times)) return null;
  return `${times.toFixed(2)}x subscribed`;
}
