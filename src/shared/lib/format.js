export function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `₹${formatNumber(value)}`;
}

export function formatUsd(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}%`;
}

export function formatVolume(value) {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${formatNumber(value / 1e7, 2)}Cr`;
  if (abs >= 1e5) return `${formatNumber(value / 1e5, 2)}L`;
  if (abs >= 1e3) return `${formatNumber(value / 1e3, 1)}K`;
  return formatNumber(value, 0);
}

// International volume: 1.2K / 34.5M / 1.1B.
export function formatVolumeIntl(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
}

export function formatMarketCap(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `₹${formatNumber(value, 0)} Cr`;
}

// Accepts a Date, an epoch-ms number, or an ISO string — Redux state only
// ever holds the latter two (Dates aren't serializable), so every caller
// can pass whatever it has.
export function formatDateTime(value) {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(value) {
  if (value == null) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}
