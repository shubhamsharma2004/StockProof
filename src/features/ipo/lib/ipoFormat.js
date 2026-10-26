import { formatNumber } from "../../../shared/lib/format.js";

export const TYPE_LABELS = { EQ: "Mainboard", SME: "SME", DEBT: "Debt" };

// "1585-1665" → "₹1,585 – ₹1,665"; a single number → "₹1,665".
export function formatPriceRange(range) {
  if (!range) return null;
  const parts = String(range)
    .split("-")
    .map((p) => Number(p.trim()))
    .filter(Number.isFinite);
  if (parts.length === 0) return String(range);
  return parts.map((p) => `₹${formatNumber(p, 0)}`).join(" – ");
}

// "1200cr" → "₹1,200 Cr". Anything unrecognised is shown as given.
export function formatIssueSize(size) {
  if (!size) return null;
  const match = String(size).match(/^([\d.]+)\s*cr$/i);
  return match ? `₹${formatNumber(Number(match[1]), 2)} Cr` : String(size);
}

// Upper end of a "low-high" price band — the price retail applicants pay.
export function upperPrice(range) {
  const parts = String(range || "")
    .split("-")
    .map(Number)
    .filter(Number.isFinite);
  return parts.length ? parts[parts.length - 1] : null;
}

// GMP as an implied listing gain over the upper price band.
export function impliedGainPercent(gmp, priceRange) {
  const price = upperPrice(priceRange);
  return gmp != null && price ? (gmp / price) * 100 : null;
}

export function formatRupees(value) {
  return value != null ? `₹${formatNumber(value, 0)}` : null;
}

// Whole days from today (local) to an ISO date; negative = in the past.
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target - today) / 864e5);
}

export function relativeDay(isoDate) {
  const d = daysUntil(isoDate);
  if (d == null) return null;
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}
