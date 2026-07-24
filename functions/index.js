const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const corsLib = require("cors")({ origin: true });
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const REGION = "asia-south1";
const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};
const CRUMB_TTL_MS = 50 * 60 * 1000;

let crumbCache = null; // { crumb, cookie, fetchedAt }

function extractCookie(res) {
  const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

async function getCrumbAndCookie() {
  if (crumbCache && Date.now() - crumbCache.fetchedAt < CRUMB_TTL_MS) {
    return crumbCache;
  }

  let cookie = "";
  try {
    const consentRes = await fetch("https://fc.yahoo.com", { headers: YF_HEADERS });
    cookie = extractCookie(consentRes);
  } catch {
    // fc.yahoo.com occasionally errors but a crumb can sometimes still be obtained without it
  }

  const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    headers: { ...YF_HEADERS, Cookie: cookie },
  });
  const newCookie = extractCookie(crumbRes);
  if (newCookie) cookie = newCookie;
  const crumb = (await crumbRes.text()).trim();

  if (!crumb || crumb.toLowerCase().includes("<html")) {
    throw new Error("Could not obtain a Yahoo Finance session crumb");
  }

  crumbCache = { crumb, cookie, fetchedAt: Date.now() };
  return crumbCache;
}

function numField(mod, key) {
  const v = mod?.[key];
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v.raw === "number") return v.raw;
  return null;
}

function yearField(mod, key) {
  const v = mod?.[key];
  if (v == null) return null;
  if (typeof v.fmt === "string" && v.fmt.length >= 4) return Number(v.fmt.slice(0, 4));
  if (typeof v.raw === "number") return new Date(v.raw * 1000).getUTCFullYear();
  return null;
}

// Yahoo's annual statement history arrays are typically newest-first and
// carry a handful of years (availability varies a lot per symbol) — this
// just normalizes to {year, ...} objects, oldest-first, dropping any year
// missing the fields we actually chart.
function buildIncomeHistory(result) {
  const rows = result?.incomeStatementHistory?.incomeStatementHistory || [];
  return rows
    .map((row) => ({
      year: yearField(row, "endDate"),
      revenue_cr: numField(row, "totalRevenue") != null ? Number((numField(row, "totalRevenue") / 1e7).toFixed(2)) : null,
      net_income_cr: numField(row, "netIncome") != null ? Number((numField(row, "netIncome") / 1e7).toFixed(2)) : null,
    }))
    .filter((row) => row.year && row.revenue_cr != null && row.net_income_cr != null)
    .sort((a, b) => a.year - b.year)
    .slice(-5);
}

function buildBalanceSheetHistory(result) {
  const rows = result?.balanceSheetHistory?.balanceSheetHistory || [];
  return rows
    .map((row) => ({
      year: yearField(row, "endDate"),
      equity_cr: numField(row, "totalStockholderEquity") != null ? Number((numField(row, "totalStockholderEquity") / 1e7).toFixed(2)) : null,
      liabilities_cr: numField(row, "totalLiab") != null ? Number((numField(row, "totalLiab") / 1e7).toFixed(2)) : null,
    }))
    .filter((row) => row.year && row.equity_cr != null)
    .sort((a, b) => a.year - b.year)
    .slice(-5);
}

function pctField(mod, key) {
  const v = numField(mod, key);
  return v != null ? Number((v * 100).toFixed(2)) : null;
}

function companyOfficerName(profile) {
  const officers = profile?.companyOfficers;
  if (!Array.isArray(officers) || !officers.length) return null;
  const ceo = officers.find((o) => /\bCEO\b|Chief Executive/i.test(o?.title || "")) || officers[0];
  return ceo?.name || null;
}

exports.stockSearch = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const q = String(req.query.q || "").trim();
      if (q.length < 2) return res.json({ results: [] });

      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        q
      )}&quotesCount=10&newsCount=0`;
      const r = await fetch(url, { headers: YF_HEADERS });
      if (!r.ok) throw new Error(`Yahoo search responded ${r.status}`);
      const data = await r.json();

      const results = (data.quotes || [])
        .filter((qt) => qt.exchange === "NSI" || qt.exchange === "BSE")
        .filter((qt) => ["EQUITY", "ETF", "MUTUALFUND"].includes(qt.quoteType))
        .map((qt) => ({
          symbol: qt.symbol,
          name: qt.longname || qt.shortname || qt.symbol,
          exchange: qt.exchange === "NSI" ? "NSE" : "BSE",
        }));

      res.set("Cache-Control", "public, max-age=60");
      res.json({ results });
    } catch (err) {
      res.status(502).json({ error: err.message || "Search failed" });
    }
  });
});

exports.stockQuote = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const symbol = String(req.query.symbol || "").trim().toUpperCase();
      if (!symbol) return res.status(400).json({ error: "symbol is required" });

      const { crumb, cookie } = await getCrumbAndCookie();
      const modules = "price,summaryDetail,defaultKeyStatistics,assetProfile,financialData,incomeStatementHistory,balanceSheetHistory";
      const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
        symbol
      )}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;

      const r = await fetch(url, { headers: { ...YF_HEADERS, Cookie: cookie } });
      if (!r.ok) throw new Error(`Yahoo quote responded ${r.status}`);
      const data = await r.json();
      const result = data?.quoteSummary?.result?.[0];
      if (!result) throw new Error("No data returned for symbol");

      const price = result.price || {};
      const summary = result.summaryDetail || {};
      const stats = result.defaultKeyStatistics || {};
      const profile = result.assetProfile || {};
      const financials = result.financialData || {};

      const marketCap = numField(price, "marketCap");
      const dividendYield = numField(summary, "dividendYield");
      const percentChange = numField(price, "regularMarketChangePercent");
      const debtToEquityRaw = numField(financials, "debtToEquity");
      const ebitda = numField(financials, "ebitda");
      const totalRevenueTTM = numField(financials, "totalRevenue");
      const city = profile.city || null;
      const country = profile.country || null;
      const incomeHistory = buildIncomeHistory(result);

      res.set("Cache-Control", "public, max-age=15");
      res.json({
        // Core quote fields (unchanged shape)
        last_price: numField(price, "regularMarketPrice"),
        percent_change: percentChange != null ? Number((percentChange * 100).toFixed(2)) : null,
        year_high: numField(summary, "fiftyTwoWeekHigh"),
        year_low: numField(summary, "fiftyTwoWeekLow"),
        volume: numField(price, "regularMarketVolume"),
        market_cap: marketCap != null ? Number((marketCap / 1e7).toFixed(2)) : null,
        pe_ratio: numField(summary, "trailingPE"),
        dividend_yield: dividendYield != null ? Number((dividendYield * 100).toFixed(2)) : null,
        book_value: numField(stats, "bookValue"),
        earnings_per_share: numField(stats, "trailingEps"),
        shares_outstanding: numField(stats, "sharesOutstanding"),
        sector: profile.sector || null,
        industry: profile.industry || null,

        // Extra quote-day fields
        day_open: numField(price, "regularMarketOpen"),
        day_high: numField(price, "regularMarketDayHigh"),
        day_low: numField(price, "regularMarketDayLow"),
        prev_close: numField(price, "regularMarketPreviousClose"),
        avg_volume: numField(summary, "averageVolume"),
        beta: numField(stats, "beta"),
        forward_pe: numField(summary, "forwardPE"),
        currency: price.currency || null,

        // Company profile (real fields only — no founded/ISIN, Yahoo doesn't carry those)
        long_name: price.longName || price.shortName || null,
        website: profile.website || null,
        employees: numField(profile, "fullTimeEmployees"),
        ceo: companyOfficerName(profile),
        headquarters: city && country ? `${city}, ${country}` : city || country || null,

        // Profitability / leverage ratios (real, current — Yahoo has no "industry average" endpoint)
        return_on_equity: pctField(financials, "returnOnEquity"),
        return_on_assets: pctField(financials, "returnOnAssets"),
        debt_to_equity: debtToEquityRaw != null ? Number((debtToEquityRaw / 100).toFixed(2)) : null,
        profit_margin: pctField(financials, "profitMargins"),
        operating_margin: pctField(financials, "operatingMargins"),
        gross_margin: pctField(financials, "grossMargins"),
        ebitda_margin: ebitda != null && totalRevenueTTM ? Number(((ebitda / totalRevenueTTM) * 100).toFixed(2)) : null,
        revenue_growth: pctField(financials, "revenueGrowth"),
        earnings_growth: pctField(financials, "earningsGrowth"),
        current_ratio: numField(financials, "currentRatio"),
        total_cash_cr: numField(financials, "totalCash") != null ? Number((numField(financials, "totalCash") / 1e7).toFixed(2)) : null,
        total_debt_cr: numField(financials, "totalDebt") != null ? Number((numField(financials, "totalDebt") / 1e7).toFixed(2)) : null,

        // Historical annuals for trend sparklines — length varies by symbol,
        // frontend must handle 0-5 entries gracefully.
        revenue_history: incomeHistory.map((r) => ({ year: r.year, value_cr: r.revenue_cr })),
        net_income_history: incomeHistory.map((r) => ({ year: r.year, value_cr: r.net_income_cr })),
        balance_sheet_history: buildBalanceSheetHistory(result),
      });
    } catch (err) {
      // A bad crumb/cookie pair throws on the next call too; drop the cache so the
      // following request re-negotiates a fresh one instead of retrying the same one.
      crumbCache = null;
      res.status(502).json({ error: err.message || "Quote fetch failed" });
    }
  });
});

// Historical daily/weekly closes for the price chart. A distinct, more
// public Yahoo endpoint from quoteSummary — same crumb/cookie are reused
// defensively but this one has historically been reachable without them too.
exports.stockChart = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const symbol = String(req.query.symbol || "").trim().toUpperCase();
      if (!symbol) return res.status(400).json({ error: "symbol is required" });
      const allowedRanges = ["1d", "5d", "1mo", "6mo", "1y", "5y", "max"];
      const range = allowedRanges.includes(req.query.range) ? req.query.range : "1y";
      const interval = range === "1d" ? "5m" : range === "5d" ? "15m" : range === "1mo" ? "1d" : "1wk";

      let cookie = "";
      let crumb = "";
      try {
        ({ crumb, cookie } = await getCrumbAndCookie());
      } catch {
        // Chart endpoint sometimes works without a crumb; fall through and try anyway.
      }

      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol
      )}?range=${range}&interval=${interval}${crumb ? `&crumb=${encodeURIComponent(crumb)}` : ""}`;
      const r = await fetch(url, { headers: { ...YF_HEADERS, Cookie: cookie } });
      if (!r.ok) throw new Error(`Yahoo chart responded ${r.status}`);
      const data = await r.json();
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error("No chart data returned for symbol");

      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];
      let points = timestamps
        .map((t, i) => ({ t: t * 1000, c: closes[i] }))
        .filter((p) => typeof p.c === "number");

      const MAX_POINTS = 300;
      if (points.length > MAX_POINTS) {
        const step = Math.ceil(points.length / MAX_POINTS);
        points = points.filter((_, i) => i % step === 0);
      }

      res.set("Cache-Control", "public, max-age=60");
      res.json({ range, points });
    } catch (err) {
      res.status(502).json({ error: err.message || "Chart fetch failed" });
    }
  });
});

// A curated pool of large/mid-cap NSE tickers spanning sectors — real
// symbols, used to compute real Day Gainers / Day Losers / Most Active
// among this pool. Not a full-market screener (Yahoo's unofficial API
// doesn't expose one we can rely on for NSE), so it's presented as such
// rather than implying full-market coverage.
const SCREENER_POOL = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "BHARTIARTL", "SBIN", "ITC", "LT", "HINDUNILVR",
  "KOTAKBANK", "AXISBANK", "BAJFINANCE", "MARUTI", "SUNPHARMA", "TITAN", "ULTRACEMCO", "ASIANPAINT",
  "NESTLEIND", "WIPRO", "HCLTECH", "ADANIENT", "ADANIPORTS", "ONGC", "NTPC", "POWERGRID", "TATASTEEL",
  "JSWSTEEL", "TATAMOTORS", "M&M", "BAJAJFINSV", "HDFCLIFE", "SBILIFE", "DIVISLAB", "DRREDDY", "CIPLA",
  "GRASIM", "BRITANNIA", "EICHERMOT", "HEROMOTOCO", "COALINDIA", "INDUSINDBK", "TECHM", "BPCL",
].map((s) => `${s}.NS`);

exports.screener = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const { crumb, cookie } = await getCrumbAndCookie();
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
        SCREENER_POOL.join(",")
      )}&crumb=${encodeURIComponent(crumb)}`;
      const r = await fetch(url, { headers: { ...YF_HEADERS, Cookie: cookie } });
      if (!r.ok) throw new Error(`Yahoo batch quote responded ${r.status}`);
      const data = await r.json();
      const quotes = data?.quoteResponse?.result || [];

      const rows = quotes
        .map((q) => ({
          symbol: (q.symbol || "").replace(/\.NS$/, ""),
          name: q.longName || q.shortName || q.symbol,
          last_price: typeof q.regularMarketPrice === "number" ? q.regularMarketPrice : null,
          percent_change: typeof q.regularMarketChangePercent === "number" ? Number(q.regularMarketChangePercent.toFixed(2)) : null,
          volume: typeof q.regularMarketVolume === "number" ? q.regularMarketVolume : null,
          market_cap: typeof q.marketCap === "number" ? Number((q.marketCap / 1e7).toFixed(2)) : null,
          pe_ratio: typeof q.trailingPE === "number" ? Number(q.trailingPE.toFixed(2)) : null,
        }))
        .filter((row) => row.last_price != null);

      const gainers = [...rows].filter((r) => r.percent_change != null).sort((a, b) => b.percent_change - a.percent_change).slice(0, 10);
      const losers = [...rows].filter((r) => r.percent_change != null).sort((a, b) => a.percent_change - b.percent_change).slice(0, 10);
      const mostActive = [...rows].filter((r) => r.volume != null).sort((a, b) => b.volume - a.volume).slice(0, 10);

      res.set("Cache-Control", "public, max-age=30");
      res.json({ asOf: new Date().toISOString(), poolSize: SCREENER_POOL.length, gainers, losers, mostActive });
    } catch (err) {
      crumbCache = null;
      res.status(502).json({ error: err.message || "Screener fetch failed" });
    }
  });
});

// Real news via Yahoo Finance's search endpoint, keyed by ticker per
// category. Verified behavior: when a query ticker has no genuine dedicated
// coverage, Yahoo silently falls back to an unrelated generic/trending
// article set (relatedTickers: null on every item) instead of an empty
// result — so every article here is kept only if its own relatedTickers
// actually includes the ticker we searched for. That's what keeps this feed
// honest instead of padded with irrelevant filler.
//
// India coverage from NSE/BSE tickers themselves is thin in Yahoo's index,
// so the India category also queries the US-listed ADRs of major Indian
// companies (real, same underlying businesses) to round it out.
const NEWS_CATEGORIES = {
  india: ["^NSEI", "^BSESN", "INFY", "IBN", "HDB", "WIT", "INR=X"],
  us: ["^GSPC", "^DJI", "^IXIC"],
  europe: ["^FTSE", "^STOXX50E"],
  japan: ["^N225"],
  commodities: ["CL=F", "GC=F"],
};

async function fetchNewsForTicker(ticker) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    ticker
  )}&newsCount=8&quotesCount=0`;
  try {
    const r = await fetch(url, { headers: YF_HEADERS });
    if (!r.ok) return [];
    const data = await r.json();
    const items = data?.news || [];
    return items
      .filter((n) => Array.isArray(n.relatedTickers) && n.relatedTickers.includes(ticker))
      .map((n) => ({
        uuid: n.uuid,
        title: n.title,
        publisher: n.publisher || null,
        link: n.link,
        publishedAt: typeof n.providerPublishTime === "number" ? n.providerPublishTime * 1000 : null,
      }));
  } catch {
    return [];
  }
}

exports.marketNews = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const categoryEntries = Object.entries(NEWS_CATEGORIES);
      const results = await Promise.all(
        categoryEntries.map(async ([category, tickers]) => {
          const perTicker = await Promise.all(tickers.map(fetchNewsForTicker));
          const seen = new Set();
          const merged = [];
          for (const list of perTicker) {
            for (const article of list) {
              if (seen.has(article.uuid)) continue;
              seen.add(article.uuid);
              merged.push(article);
            }
          }
          merged.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
          return [category, merged.slice(0, 15)];
        })
      );

      res.set("Cache-Control", "public, max-age=300");
      res.json({ asOf: new Date().toISOString(), categories: Object.fromEntries(results) });
    } catch (err) {
      res.status(502).json({ error: err.message || "News fetch failed" });
    }
  });
});

// NSE India's own (unofficial, undocumented) IPO API — real current data:
// open-for-subscription issues with actual subscription counts, upcoming
// issues, and recently listed issues with real issue prices/listing dates.
// No crumb/session needed for these specific endpoints, unlike NSE's main
// site. Kept as a thin passthrough — no GMP, no BSE-only/SME coverage here,
// since neither is available from this source; the frontend shows those
// gaps honestly rather than guessing.
const NSE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/json",
};

async function fetchNseJson(path) {
  const r = await fetch(`https://www.nseindia.com/api/${path}`, { headers: NSE_HEADERS });
  if (!r.ok) throw new Error(`NSE ${path} responded ${r.status}`);
  return r.json();
}

exports.ipoData = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const [current, upcoming, past] = await Promise.all([
        fetchNseJson("ipo-current-issue").catch(() => []),
        fetchNseJson("all-upcoming-issues?category=ipo").catch(() => []),
        fetchNseJson("public-past-issues").catch(() => []),
      ]);

      const openNow = (Array.isArray(current) ? current : [])
        .filter((row) => row.status === "Active")
        .map((row) => ({
          company: row.companyName,
          symbol: row.symbol,
          exchange: row.isBse === "1" ? "BSE" : "NSE",
          series: row.series || null,
          priceBand: row.issuePrice || null,
          startDate: row.issueStartDate || null,
          endDate: row.issueEndDate || null,
          subscriptionTimes: row.noOfTime != null ? Number(row.noOfTime) : null,
        }));

      const upcomingList = (Array.isArray(upcoming) ? upcoming : []).map((row) => ({
        company: row.companyName,
        symbol: row.symbol,
        series: row.series || null,
        priceBand: row.issuePrice || null,
        startDate: row.issueStartDate || null,
        endDate: row.issueEndDate || null,
      }));

      const recentlyListed = (Array.isArray(past) ? past : [])
        .filter((row) => row.listingDate && row.listingDate !== "-")
        .slice(0, 20)
        .map((row) => {
          const issuePriceNum = Number(String(row.issuePrice || "").trim());
          return {
            company: row.company,
            symbol: row.symbol,
            securityType: row.securityType || null,
            issuePrice: Number.isFinite(issuePriceNum) ? issuePriceNum : null,
            priceBand: row.priceRange || null,
            listingDate: row.listingDate,
          };
        });

      res.set("Cache-Control", "public, max-age=120");
      res.json({ asOf: new Date().toISOString(), openNow, upcoming: upcomingList, recentlyListed });
    } catch (err) {
      res.status(502).json({ error: err.message || "IPO data fetch failed" });
    }
  });
});

// Shareholding pattern (Promoter % vs Public %) — real NSE regulatory
// disclosure data, sourced from a single bulk endpoint covering every listed
// company that (verified live) needs no session/cookie, unlike most of NSE's
// site. Only the Promoter/Public split is available here; a further FII/DII
// breakdown only exists in each company's linked XBRL filing, which would
// need real XML parsing per company — a separate, much more fragile task,
// intentionally not attempted here rather than guessed at.
//
// Refreshed on a weekly schedule (this data only changes quarterly, so
// fetching it live per page view would be pure waste) into one Firestore
// doc per symbol. Each refresh only appends a new history entry when the
// filing's own quarter-end date has actually advanced, so quarter-over-
// quarter change becomes available naturally over time rather than being
// backfilled with invented history.
const SHAREHOLDING_COLLECTION = "shareholding";

async function refreshShareholdingData() {
  const rows = await fetchNseJson("corporate-share-holdings-master?index=equities");
  if (!Array.isArray(rows)) throw new Error("Unexpected shareholding master response shape");

  let written = 0;
  const chunks = [];
  for (let i = 0; i < rows.length; i += 400) chunks.push(rows.slice(i, i + 400));

  for (const chunk of chunks) {
    const batch = db.batch();
    for (const row of chunk) {
      const symbol = (row.symbol || "").trim().toUpperCase();
      const promoterPct = Number(row.pr_and_prgrp);
      const publicPct = Number(row.public_val);
      const quarterEnd = row.date || null;
      if (!symbol || !quarterEnd || !Number.isFinite(promoterPct)) continue;

      const ref = db.collection(SHAREHOLDING_COLLECTION).doc(symbol);
      const entry = {
        promoter_pct: promoterPct,
        public_pct: Number.isFinite(publicPct) ? publicPct : null,
        quarter_end: quarterEnd,
        broadcast_date: row.broadcastDate || null,
      };
      // FieldValue.arrayUnion would dedupe on exact object equality (broadcast_date
      // included), so a same-quarter re-run correctly writes nothing new here —
      // only an actual new quarter grows the array.
      batch.set(
        ref,
        {
          ...entry,
          history: admin.firestore.FieldValue.arrayUnion(entry),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      written++;
    }
    await batch.commit();
  }
  return written;
}

exports.shareholdingRefresh = onSchedule({ schedule: "every monday 03:00", region: REGION, timeoutSeconds: 300 }, async () => {
  const count = await refreshShareholdingData();
  console.log(`shareholdingRefresh: wrote ${count} symbols`);
});

// One-off manual trigger for the same refresh — used to seed the cache right
// after deploy instead of waiting for the first Monday, and available if a
// fresher pull is ever wanted without editing the schedule.
exports.shareholdingRefreshNow = onRequest({ region: REGION, invoker: "public", timeoutSeconds: 300 }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const count = await refreshShareholdingData();
      res.json({ ok: true, symbolsWritten: count });
    } catch (err) {
      res.status(502).json({ error: err.message || "Shareholding refresh failed" });
    }
  });
});

exports.shareholding = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const symbol = String(req.query.symbol || "").trim().toUpperCase();
      if (!symbol) return res.status(400).json({ error: "symbol is required" });

      const doc = await db.collection(SHAREHOLDING_COLLECTION).doc(symbol).get();
      if (!doc.exists) return res.json({ available: false });

      const data = doc.data();
      const history = (data.history || []).slice().sort((a, b) => (a.quarter_end > b.quarter_end ? 1 : -1));

      res.set("Cache-Control", "public, max-age=3600");
      res.json({
        available: true,
        promoter_pct: data.promoter_pct,
        public_pct: data.public_pct,
        quarter_end: data.quarter_end,
        history,
      });
    } catch (err) {
      res.status(502).json({ error: err.message || "Shareholding lookup failed" });
    }
  });
});

// Real reported EPS from NSE's quarterly results filings — fills the gap
// when Yahoo's trailingEps is missing for a symbol (common for Indian
// stocks). Sums the four most recent quarters into a genuine trailing-
// twelve-month figure when all four are reported; if that can't be
// assembled, falls back to the single latest quarter with a label that
// makes clear it isn't annualized, rather than silently understating it.
// Cached per symbol in Firestore for a week since this only changes when a
// company files new quarterly results — not on every page view. On a
// failed live NSE fetch, a stale cached value is served rather than
// nothing, since it's still real previously-reported data, not a guess.
const NSE_EPS_COLLECTION = "nseFinancials";
const NSE_EPS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function rowEps(row) {
  const raw = row?.re_basic_eps ?? row?.re_basic_eps_for_cont_dic_opr;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

async function fetchNseEpsLive(symbol) {
  const data = await fetchNseJson(`results-comparision?symbol=${encodeURIComponent(symbol)}`);
  const rows = Array.isArray(data?.resCmpData) ? data.resCmpData : [];
  if (rows.length === 0) return null;

  const latest = rows[0];
  const last4 = rows.slice(0, 4).map(rowEps);
  if (last4.length === 4 && last4.every((v) => v != null)) {
    return {
      eps: Number(last4.reduce((a, b) => a + b, 0).toFixed(2)),
      basis: "ttm",
      periodEnd: latest.re_to_dt || null,
    };
  }

  const singleEps = rowEps(latest);
  if (singleEps != null) {
    return { eps: singleEps, basis: "quarterly", periodEnd: latest.re_to_dt || null };
  }
  return null;
}

exports.nseEps = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      const symbol = String(req.query.symbol || "").trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
      if (!symbol) return res.status(400).json({ error: "symbol is required" });

      const ref = db.collection(NSE_EPS_COLLECTION).doc(symbol);
      const cached = await ref.get();
      const cachedData = cached.exists ? cached.data() : null;
      const isFresh = cachedData && Date.now() - Date.parse(cachedData.updatedAt) < NSE_EPS_TTL_MS;
      if (isFresh) {
        res.set("Cache-Control", "public, max-age=3600");
        return res.json({ available: true, ...cachedData.result });
      }

      let live = null;
      for (let attempt = 0; attempt < 2 && live == null; attempt++) {
        try {
          live = await fetchNseEpsLive(symbol);
        } catch {
          live = null;
        }
      }

      if (live) {
        await ref.set({ result: live, updatedAt: new Date().toISOString() }, { merge: true });
        res.set("Cache-Control", "public, max-age=3600");
        return res.json({ available: true, ...live });
      }

      if (cachedData) {
        // Live fetch failed but a stale real value exists — serve that
        // rather than an empty state.
        return res.json({ available: true, ...cachedData.result, stale: true });
      }
      return res.json({ available: false });
    } catch (err) {
      res.status(502).json({ error: err.message || "NSE EPS lookup failed" });
    }
  });
});

// Server-side counter for guest-mode entries — kept off the client so an
// open Firestore write rule for anonymous users is never needed.
const GUEST_COUNTER_REF = db.collection("counters").doc("guestLogins");

exports.guestCounter = onRequest({ region: REGION, invoker: "public" }, (req, res) => {
  corsLib(req, res, async () => {
    try {
      if (req.method === "POST") {
        const result = await db.runTransaction(async (tx) => {
          const doc = await tx.get(GUEST_COUNTER_REF);
          const next = (doc.exists ? doc.data().count : 0) + 1;
          tx.set(GUEST_COUNTER_REF, { count: next }, { merge: true });
          return next;
        });
        return res.json({ count: result });
      }
      const doc = await GUEST_COUNTER_REF.get();
      res.json({ count: doc.exists ? doc.data().count : 0 });
    } catch (err) {
      res.status(502).json({ error: err.message || "Counter request failed" });
    }
  });
});
