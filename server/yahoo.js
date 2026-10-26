// Yahoo Finance endpoints, written against the standard fetch API so the
// proxy runs on any host (no paid backend plan required).
import { cached, forget } from "./cache.js";

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};
const CRUMB_KEY = "yahoo:crumb";
const CRUMB_TTL_MS = 50 * 60 * 1000;

function extractCookie(res) {
  const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

function getCrumbAndCookie() {
  return cached(CRUMB_KEY, CRUMB_TTL_MS, async () => {
    let cookie = "";
    try {
      cookie = extractCookie(await fetch("https://fc.yahoo.com", { headers: YF_HEADERS }));
    } catch {
      // fc.yahoo.com occasionally errors but a crumb can sometimes still be obtained without it
    }
    const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", { headers: { ...YF_HEADERS, Cookie: cookie } });
    const newCookie = extractCookie(crumbRes);
    if (newCookie) cookie = newCookie;
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.toLowerCase().includes("<html")) {
      throw new Error("Could not obtain a Yahoo Finance session crumb");
    }
    return { crumb, cookie };
  });
}

// A bad crumb/cookie pair fails every later call too; drop it so the next
// request negotiates a fresh one.
function resetCrumb() {
  forget(CRUMB_KEY);
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

function pctField(mod, key) {
  const v = numField(mod, key);
  return v != null ? Number((v * 100).toFixed(2)) : null;
}

function crore(v) {
  return v != null ? Number((v / 1e7).toFixed(2)) : null;
}

// Annual statement history, oldest-first, dropping years missing the fields we chart.
function buildIncomeHistory(result) {
  const rows = result?.incomeStatementHistory?.incomeStatementHistory || [];
  return rows
    .map((row) => ({
      year: yearField(row, "endDate"),
      revenue_cr: crore(numField(row, "totalRevenue")),
      net_income_cr: crore(numField(row, "netIncome")),
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
      equity_cr: crore(numField(row, "totalStockholderEquity")),
      liabilities_cr: crore(numField(row, "totalLiab")),
    }))
    .filter((row) => row.year && row.equity_cr != null)
    .sort((a, b) => a.year - b.year)
    .slice(-5);
}

function companyOfficerName(profile) {
  const officers = profile?.companyOfficers;
  if (!Array.isArray(officers) || !officers.length) return null;
  const ceo = officers.find((o) => /\bCEO\b|Chief Executive/i.test(o?.title || "")) || officers[0];
  return ceo?.name || null;
}

// Yahoo exchange codes for US listings: Nasdaq (NMS/NGM/NCM), NYSE (NYQ),
// NYSE American (ASE), NYSE Arca (PCX), Cboe BZX (BTS).
const US_EXCHANGES = new Set(["NMS", "NGM", "NCM", "NYQ", "ASE", "PCX", "BTS"]);

// market "IN" → NSE/BSE listings; "US" → US listings (exchange "US").
export async function searchSecurities(q, market = "IN") {
  if (q.length < 2) return { results: [] };
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=15&newsCount=0`;
  const r = await fetch(url, { headers: YF_HEADERS });
  if (!r.ok) throw new Error(`Yahoo search responded ${r.status}`);
  const data = await r.json();
  const results = (data.quotes || [])
    .filter((qt) => ["EQUITY", "ETF", "MUTUALFUND"].includes(qt.quoteType))
    .filter((qt) => (market === "US" ? US_EXCHANGES.has(qt.exchange) : qt.exchange === "NSI" || qt.exchange === "BSE"))
    .slice(0, 10)
    .map((qt) => ({
      symbol: qt.symbol,
      name: qt.longname || qt.shortname || qt.symbol,
      exchange: market === "US" ? "US" : qt.exchange === "NSI" ? "NSE" : "BSE",
    }));
  return { results };
}

export async function getQuote(symbol) {
  try {
    const { crumb, cookie } = await getCrumbAndCookie();
    const modules = "price,summaryDetail,defaultKeyStatistics,assetProfile,financialData,incomeStatementHistory,balanceSheetHistory";
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;
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

    const dividendYield = numField(summary, "dividendYield");
    const percentChange = numField(price, "regularMarketChangePercent");
    const debtToEquityRaw = numField(financials, "debtToEquity");
    const ebitda = numField(financials, "ebitda");
    const totalRevenueTTM = numField(financials, "totalRevenue");
    const city = profile.city || null;
    const country = profile.country || null;
    const incomeHistory = buildIncomeHistory(result);

    return {
      last_price: numField(price, "regularMarketPrice"),
      percent_change: percentChange != null ? Number((percentChange * 100).toFixed(2)) : null,
      year_high: numField(summary, "fiftyTwoWeekHigh"),
      year_low: numField(summary, "fiftyTwoWeekLow"),
      volume: numField(price, "regularMarketVolume"),
      market_cap: crore(numField(price, "marketCap")),
      pe_ratio: numField(summary, "trailingPE"),
      dividend_yield: dividendYield != null ? Number((dividendYield * 100).toFixed(2)) : null,
      book_value: numField(stats, "bookValue"),
      earnings_per_share: numField(stats, "trailingEps"),
      shares_outstanding: numField(stats, "sharesOutstanding"),
      sector: profile.sector || null,
      industry: profile.industry || null,

      day_open: numField(price, "regularMarketOpen"),
      day_high: numField(price, "regularMarketDayHigh"),
      day_low: numField(price, "regularMarketDayLow"),
      prev_close: numField(price, "regularMarketPreviousClose"),
      avg_volume: numField(summary, "averageVolume"),
      beta: numField(stats, "beta"),
      forward_pe: numField(summary, "forwardPE"),
      currency: price.currency || null,

      long_name: price.longName || price.shortName || null,
      website: profile.website || null,
      employees: numField(profile, "fullTimeEmployees"),
      ceo: companyOfficerName(profile),
      headquarters: city && country ? `${city}, ${country}` : city || country || null,

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
      total_cash_cr: crore(numField(financials, "totalCash")),
      total_debt_cr: crore(numField(financials, "totalDebt")),

      // Length varies by symbol; the frontend handles 0-5 entries.
      revenue_history: incomeHistory.map((r) => ({ year: r.year, value_cr: r.revenue_cr })),
      net_income_history: incomeHistory.map((r) => ({ year: r.year, value_cr: r.net_income_cr })),
      balance_sheet_history: buildBalanceSheetHistory(result),
    };
  } catch (err) {
    resetCrumb();
    throw err;
  }
}

const CHART_RANGES = ["1d", "5d", "1mo", "6mo", "1y", "5y", "max"];
const MAX_CHART_POINTS = 300;

export async function getChart(symbol, requestedRange) {
  const range = CHART_RANGES.includes(requestedRange) ? requestedRange : "1y";
  const interval = range === "1d" ? "5m" : range === "5d" ? "15m" : range === "1mo" ? "1d" : "1wk";

  let cookie = "";
  let crumb = "";
  try {
    ({ crumb, cookie } = await getCrumbAndCookie());
  } catch {
    // The chart endpoint usually works without a crumb; try anyway.
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}${
    crumb ? `&crumb=${encodeURIComponent(crumb)}` : ""
  }`;
  const r = await fetch(url, { headers: { ...YF_HEADERS, Cookie: cookie } });
  if (!r.ok) throw new Error(`Yahoo chart responded ${r.status}`);
  const data = await r.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("No chart data returned for symbol");

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  let points = timestamps.map((t, i) => ({ t: t * 1000, c: closes[i] })).filter((p) => typeof p.c === "number");
  if (points.length > MAX_CHART_POINTS) {
    const step = Math.ceil(points.length / MAX_CHART_POINTS);
    points = points.filter((_, i) => i % step === 0);
  }
  return { range, points };
}

// Curated pools — real Day Gainers / Losers / Most Active among these
// tickers, presented as such rather than implying full-market coverage.
const SCREENER_POOLS = {
  IN: {
    currency: "INR",
    symbols: [
      "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "BHARTIARTL", "SBIN", "ITC", "LT", "HINDUNILVR",
      "KOTAKBANK", "AXISBANK", "BAJFINANCE", "MARUTI", "SUNPHARMA", "TITAN", "ULTRACEMCO", "ASIANPAINT",
      "NESTLEIND", "WIPRO", "HCLTECH", "ADANIENT", "ADANIPORTS", "ONGC", "NTPC", "POWERGRID", "TATASTEEL",
      "JSWSTEEL", "TATAMOTORS", "M&M", "BAJAJFINSV", "HDFCLIFE", "SBILIFE", "DIVISLAB", "DRREDDY", "CIPLA",
      "GRASIM", "BRITANNIA", "EICHERMOT", "HEROMOTOCO", "COALINDIA", "INDUSINDBK", "TECHM", "BPCL",
    ].map((s) => `${s}.NS`),
  },
  // US large caps across sectors (Yahoo writes class B shares as BRK-B).
  US: {
    currency: "USD",
    symbols: [
      "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK-B", "JPM", "V", "UNH", "XOM", "JNJ",
      "WMT", "MA", "PG", "AVGO", "HD", "CVX", "LLY", "ABBV", "MRK", "KO", "PEP", "COST", "ADBE", "CRM",
      "NFLX", "AMD", "INTC", "CSCO", "ORCL", "BAC", "WFC", "DIS", "MCD", "NKE", "QCOM", "TXN", "IBM", "GS",
      "CAT", "BA", "UBER", "PYPL",
    ],
  },
};

export async function getScreener(marketParam) {
  const market = SCREENER_POOLS[marketParam] ? marketParam : "IN";
  const pool = SCREENER_POOLS[market];
  try {
    const { crumb, cookie } = await getCrumbAndCookie();
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(pool.symbols.join(","))}&crumb=${encodeURIComponent(crumb)}`;
    const r = await fetch(url, { headers: { ...YF_HEADERS, Cookie: cookie } });
    if (!r.ok) throw new Error(`Yahoo batch quote responded ${r.status}`);
    const data = await r.json();
    const rows = (data?.quoteResponse?.result || [])
      .map((q) => ({
        symbol: (q.symbol || "").replace(/\.NS$/, ""),
        name: q.longName || q.shortName || q.symbol,
        last_price: typeof q.regularMarketPrice === "number" ? q.regularMarketPrice : null,
        percent_change: typeof q.regularMarketChangePercent === "number" ? Number(q.regularMarketChangePercent.toFixed(2)) : null,
        volume: typeof q.regularMarketVolume === "number" ? q.regularMarketVolume : null,
        // ₹ crore for India; raw dollars for the US.
        market_cap: typeof q.marketCap === "number" ? (market === "IN" ? crore(q.marketCap) : q.marketCap) : null,
        pe_ratio: typeof q.trailingPE === "number" ? Number(q.trailingPE.toFixed(2)) : null,
      }))
      .filter((row) => row.last_price != null);

    const withChange = rows.filter((r) => r.percent_change != null);
    return {
      asOf: new Date().toISOString(),
      market,
      currency: pool.currency,
      poolSize: pool.symbols.length,
      gainers: [...withChange].sort((a, b) => b.percent_change - a.percent_change).slice(0, 10),
      losers: [...withChange].sort((a, b) => a.percent_change - b.percent_change).slice(0, 10),
      mostActive: rows.filter((r) => r.volume != null).sort((a, b) => b.volume - a.volume).slice(0, 10),
    };
  } catch (err) {
    resetCrumb();
    throw err;
  }
}

// Yahoo silently falls back to unrelated trending articles when a ticker has
// no dedicated coverage, so each article is kept only if its own
// relatedTickers includes the ticker searched for. India also queries the
// US-listed ADRs of major Indian companies to round out thin NSE coverage.
const NEWS_CATEGORIES = {
  india: ["^NSEI", "^BSESN", "INFY", "IBN", "HDB", "WIT", "INR=X"],
  us: ["^GSPC", "^DJI", "^IXIC"],
  europe: ["^FTSE", "^STOXX50E"],
  japan: ["^N225"],
  commodities: ["CL=F", "GC=F"],
};

async function fetchNewsForTicker(ticker) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=8&quotesCount=0`;
  try {
    const r = await fetch(url, { headers: YF_HEADERS });
    if (!r.ok) return [];
    const data = await r.json();
    return (data?.news || [])
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

export async function getMarketNews() {
  const results = await Promise.all(
    Object.entries(NEWS_CATEGORIES).map(async ([category, tickers]) => {
      const perTicker = await Promise.all(tickers.map(fetchNewsForTicker));
      const seen = new Set();
      const merged = [];
      for (const article of perTicker.flat()) {
        if (seen.has(article.uuid)) continue;
        seen.add(article.uuid);
        merged.push(article);
      }
      merged.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
      return [category, merged.slice(0, 15)];
    })
  );
  return { asOf: new Date().toISOString(), categories: Object.fromEntries(results) };
}
