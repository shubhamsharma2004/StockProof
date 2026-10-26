// Per-IPO enrichment from ipoalerts (https://ipoalerts.in). Key from the
// server environment, sent as the x-api-key header — never to the browser.
//
// The free plan returns only one IPO per list request (6 requests/minute),
// so the IPO *lists* come from NSE's own feed (nse.js). ipoalerts is used
// where it works well on the free plan:
//   GET /ipos/{symbol}      → full profile, loaded when an IPO is opened
//   GET /ipos/{symbol}/gmp  → GMP trend (free preview, 250 requests/minute)
import { cached } from "./cache.js";

const BASE = "https://api.ipoalerts.in";

export class IpoAlertsUnavailable extends Error {}

async function ipoalerts(path) {
  const key = process.env.IPOALERTS_API_KEY;
  if (!key) throw new IpoAlertsUnavailable("IPOALERTS_API_KEY is not configured on the server");
  const r = await fetch(`${BASE}/${path}`, { headers: { "x-api-key": key } });
  if (r.status === 404) return null;
  const payload = await r.json().catch(() => null);
  if (!r.ok) {
    const message = payload?.detail || payload?.title || `ipoalerts responded ${r.status}`;
    throw new Error(r.status === 429 ? "IPO details are rate-limited right now — try again in a minute." : message);
  }
  return payload;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeProfile(ipo) {
  const sub = ipo.subscription;
  return {
    name: ipo.name,
    symbol: ipo.symbol || null,
    type: ipo.type || null,
    status: ipo.status || null,
    logo: ipo.logo || null,
    startDate: ipo.startDate || null,
    endDate: ipo.endDate || null,
    listingDate: ipo.listingDate || null,
    priceRange: ipo.priceRange || null,
    listingGain: ipo.listingGain != null && ipo.listingGain !== "" ? Number(ipo.listingGain) : null,
    minQty: typeof ipo.minQty === "number" ? ipo.minQty : null,
    minAmount: typeof ipo.minAmount === "number" ? ipo.minAmount : null,
    issueSize: ipo.issueSize || null,
    timesSubscribed: typeof sub?.timesSubscribed === "number" ? sub.timesSubscribed : null,
    subscriptionUpdatedAt: sub?.updatedAt || null,
    schedule: list(ipo.schedule).filter((s) => s.date && s.event),
    about: ipo.about || null,
    strengths: list(ipo.strengths),
    risks: list(ipo.risks),
    prospectusUrl: ipo.prospectusUrl || null,
    nseInfoUrl: ipo.nseInfoUrl || null,
    infoUrl: ipo.infoUrl || null,
  };
}

// Profiles barely change once published — cache for 6 hours.
export function getIpoProfile(symbol) {
  return cached(`ipoalerts:profile:${symbol}`, 6 * 60 * 60 * 1000, async () => {
    const payload = await ipoalerts(`ipos/${encodeURIComponent(symbol)}`);
    const ipo = payload?.ipo || payload;
    return ipo?.name ? { available: true, profile: normalizeProfile(ipo) } : { available: false };
  });
}

// Daily grey-market premium for the last 30 days. GMP is an unofficial,
// unregulated price — the UI labels it as such.
export function getIpoGmp(symbol) {
  return cached(`ipoalerts:gmp:${symbol}`, 30 * 60 * 1000, async () => {
    const payload = await ipoalerts(`ipos/${encodeURIComponent(symbol)}/gmp?interval=daily&field=mean`);
    const series = list(payload?.series)
      .filter((p) => typeof p.price === "number" && p.timestamp)
      .map((p) => ({ t: Date.parse(p.timestamp), c: p.price }));
    const latest = series.length ? series[series.length - 1] : null;
    return { available: series.length > 0, latest: latest?.c ?? null, latestAt: latest?.t ?? null, series };
  });
}
