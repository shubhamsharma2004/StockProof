// NSE India's own (unofficial, undocumented) endpoints. These specific ones
// answer plain requests without a browser session, unlike most of NSE's site.
//
// Shareholding and EPS are fetched live and held in the in-memory cache —
// no database writes, so no stored quarter-over-quarter history.
import { cached, lastKnown } from "./cache.js";

const NSE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/json",
};

async function fetchNseJson(path) {
  const r = await fetch(`https://www.nseindia.com/api/${path}`, { headers: NSE_HEADERS });
  if (!r.ok) throw new Error(`NSE ${path} responded ${r.status}`);
  return r.json();
}

// ---- IPO lists ---------------------------------------------------------
// NSE's IPO feeds are complete and free; ipoAlerts.js adds per-IPO detail.

const MONTHS = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };

// "28-Oct-2026" / "23-OCT-2026" → "2026-10-28"; "-" or junk → null.
function nseDate(value) {
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(String(value || "").trim());
  if (!m) return null;
  const month = MONTHS[m[2].toUpperCase()];
  if (month == null) return null;
  return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

// "Rs.1585 to Rs.1665" → "1585-1665"; "Rs.95" → "95".
function nsePriceRange(value) {
  const nums = String(value || "").match(/\d+(\.\d+)?/g);
  return nums ? nums.slice(0, 2).join("-") : null;
}

// NSE marks SME issues with series SME / SM / ST, mainboard with EQ (or BE,
// trade-for-trade equity). Everything else in these feeds — debt/NCDs (N*,
// DEBT, Z*, Y*), InvITs (IV), REITs (RR) — isn't a share IPO: null.
function nseType(series) {
  const s = String(series || "").trim().toUpperCase();
  if (s === "SME" || s === "SM" || s === "ST") return "SME";
  if (s === "EQ" || s === "BE") return "EQ";
  return null;
}

// The feeds can repeat an issue; keep the first of each symbol.
function uniqueBySymbol(ipos) {
  const seen = new Set();
  return ipos.filter((i) => i.type && i.symbol && !seen.has(i.symbol) && seen.add(i.symbol));
}

function daysAgo(isoDate) {
  return isoDate ? (Date.now() - Date.parse(`${isoDate}T00:00:00Z`)) / 864e5 : Infinity;
}

const AWAITING_WINDOW_DAYS = 15;
const MAX_LISTED = 20;

const IPO_STATUSES = new Set(["open", "upcoming", "closed", "listed"]);

export function getIpoList(statusParam) {
  const status = IPO_STATUSES.has(statusParam) ? statusParam : "open";
  return cached(`nse:ipos:${status}`, 5 * 60 * 1000, async () => {
    let ipos;
    if (status === "open" || status === "upcoming") {
      const rows = await fetchNseJson(status === "open" ? "ipo-current-issue" : "all-upcoming-issues?category=ipo");
      ipos = (Array.isArray(rows) ? rows : [])
        .filter((row) => (status === "open" ? row.status === "Active" : row.status === "Forthcoming"))
        .map((row) => {
          const times = Number(row.noOfTime);
          return {
            id: row.symbol,
            name: row.companyName,
            symbol: row.symbol,
            type: nseType(row.series),
            status,
            startDate: nseDate(row.issueStartDate),
            endDate: nseDate(row.issueEndDate),
            listingDate: null,
            priceRange: nsePriceRange(row.issuePrice),
            issuePrice: null,
            timesSubscribed: status === "open" && Number.isFinite(times) ? times : null,
          };
        });
    } else {
      const rows = await fetchNseJson("public-past-issues");
      const past = (Array.isArray(rows) ? rows : []).filter((row) => nseType(row.securityType)).map((row) => {
        const issuePrice = Number(String(row.issuePrice || "").trim());
        return {
          id: row.symbol,
          name: row.company,
          symbol: row.symbol,
          type: nseType(row.securityType),
          status,
          startDate: nseDate(row.ipoStartDate),
          endDate: nseDate(row.ipoEndDate),
          listingDate: nseDate(row.listingDate),
          priceRange: nsePriceRange(row.priceRange),
          issuePrice: Number.isFinite(issuePrice) && issuePrice > 0 ? issuePrice : null,
          timesSubscribed: null,
        };
      });
      ipos =
        status === "closed"
          ? // Bidding has ended but there's no listing date yet.
            past.filter((i) => !i.listingDate && daysAgo(i.endDate) <= AWAITING_WINDOW_DAYS)
          : past.filter((i) => i.listingDate).sort((a, b) => b.listingDate.localeCompare(a.listingDate)).slice(0, MAX_LISTED);
    }
    return { asOf: new Date().toISOString(), status, ipos: uniqueBySymbol(ipos) };
  });
}

// Promoter vs Public split from NSE's bulk shareholding master (every listed
// company in one response). It only changes quarterly, so the whole table
// is cached for 12 hours and individual symbols are looked up from it.
const SHAREHOLDING_KEY = "nse:shareholding-master";
const SHAREHOLDING_TTL_MS = 12 * 60 * 60 * 1000;

function loadShareholdingTable() {
  return cached(SHAREHOLDING_KEY, SHAREHOLDING_TTL_MS, async () => {
    const rows = await fetchNseJson("corporate-share-holdings-master?index=equities");
    if (!Array.isArray(rows)) throw new Error("Unexpected shareholding master response shape");
    const bySymbol = new Map();
    for (const row of rows) {
      const symbol = (row.symbol || "").trim().toUpperCase();
      const promoterPct = Number(row.pr_and_prgrp);
      const publicPct = Number(row.public_val);
      if (!symbol || !row.date || !Number.isFinite(promoterPct)) continue;
      // Last row wins, as it did when these were merged into Firestore.
      bySymbol.set(symbol, {
        promoter_pct: promoterPct,
        public_pct: Number.isFinite(publicPct) ? publicPct : null,
        quarter_end: row.date,
      });
    }
    return bySymbol;
  });
}

export async function getShareholding(symbol) {
  const table = await loadShareholdingTable();
  const entry = table.get(symbol);
  if (!entry) return { available: false };
  return { available: true, ...entry, history: [] };
}

// Real reported EPS from NSE's quarterly results: the four latest quarters
// summed into a genuine TTM figure when all four exist, otherwise the
// single latest quarter, labelled as such. Cached for a week; if NSE is
// unreachable, the last known real value is served marked stale.
const EPS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function rowEps(row) {
  const num = Number(row?.re_basic_eps ?? row?.re_basic_eps_for_cont_dic_opr);
  return Number.isFinite(num) ? num : null;
}

async function fetchEpsLive(symbol) {
  const data = await fetchNseJson(`results-comparision?symbol=${encodeURIComponent(symbol)}`);
  const rows = Array.isArray(data?.resCmpData) ? data.resCmpData : [];
  if (rows.length === 0) return null;

  const latest = rows[0];
  const last4 = rows.slice(0, 4).map(rowEps);
  if (last4.length === 4 && last4.every((v) => v != null)) {
    return { eps: Number(last4.reduce((a, b) => a + b, 0).toFixed(2)), basis: "ttm", periodEnd: latest.re_to_dt || null };
  }
  const singleEps = rowEps(latest);
  return singleEps != null ? { eps: singleEps, basis: "quarterly", periodEnd: latest.re_to_dt || null } : null;
}

export async function getNseEps(symbol) {
  const key = `nse:eps:${symbol}`;
  try {
    const result = await cached(key, EPS_TTL_MS, () => fetchEpsLive(symbol));
    return result ? { available: true, ...result } : { available: false };
  } catch {
    const stale = lastKnown(key);
    return stale ? { available: true, ...stale, stale: true } : { available: false };
  }
}
