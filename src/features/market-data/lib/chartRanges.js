// The only ranges the stockChart proxy accepts. `long` labels match the
// dashboard's pill row; `short` labels fit the compact research chart.
export const CHART_RANGES = [
  { key: "1d", short: "1D", long: "1 Day" },
  { key: "5d", short: "5D", long: "1 Week" },
  { key: "1mo", short: "1M", long: "1 Month" },
  { key: "6mo", short: "6M", long: "6 Month" },
  { key: "1y", short: "1Y", long: "1 Year" },
  { key: "5y", short: "5Y", long: "5 Year" },
  { key: "max", short: "Max", long: "All" },
];

const VALID_KEYS = new Set(CHART_RANGES.map((r) => r.key));

export function safeRange(range) {
  return VALID_KEYS.has(range) ? range : "1y";
}

// X-axis tick label that suits the range: clock time intraday, day + month
// for weeks/months, month + year beyond that.
export function tickFormatterFor(range) {
  if (range === "1d") {
    return (t) => new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  // A week has several ticks per trading day, so the date alone repeats.
  if (range === "5d") {
    return (t) => {
      const d = new Date(t);
      const day = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
      return `${day}, ${time}`;
    };
  }
  if (range === "1mo") {
    return (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  return (t) => new Date(t).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
