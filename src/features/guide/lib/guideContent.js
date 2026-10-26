// Everything the Guide page says, kept as data so the copy can be edited
// without touching layout. Score weights and thresholds mirror
// features/research/lib/insights.js — update both together.

export const STEPS = [
  {
    title: "Pick a market and a stock",
    body: "Switch between India and the US in the top bar, then search any company by name or ticker.",
  },
  {
    title: "Read the live snapshot",
    body: "Price, fundamentals, charts, peers and news load automatically, and four scores are calculated from the real figures.",
  },
  {
    title: "Work through the checklist",
    body: "Confirm each question yourself — some are backed by live data, others are judgment calls no feed can answer.",
  },
  {
    title: "Save, track and compare",
    body: "Save the evaluation to your history, add the stock to your watchlist, and come back as the numbers change.",
  },
];

// weight = points out of 100 that input can contribute to the score.
export const SCORES = [
  {
    key: "health",
    name: "Financial Health",
    question: "Is the business on solid ground?",
    inputs: [
      { label: "Debt to equity", weight: 30 },
      { label: "Net profit margin", weight: 25 },
      { label: "Return on equity", weight: 25 },
      { label: "Current ratio", weight: 20 },
    ],
    scale: ["Strong", "Good", "Moderate", "Weak"],
  },
  {
    key: "valuation",
    name: "Valuation",
    question: "Is the price reasonable for what you get?",
    inputs: [
      { label: "P/E ratio", weight: 40 },
      { label: "P/B ratio", weight: 30 },
      { label: "Dividend yield", weight: 30 },
    ],
    scale: ["Attractive", "Reasonable", "Expensive", "Overvalued"],
  },
  {
    key: "growth",
    name: "Growth",
    question: "Are sales and profits actually growing?",
    inputs: [
      { label: "Revenue growth", weight: 30 },
      { label: "Earnings growth", weight: 30 },
      { label: "Revenue CAGR (multi-year)", weight: 20 },
      { label: "Profit CAGR (multi-year)", weight: 20 },
    ],
    scale: ["Excellent", "Good", "Slow", "Weak"],
  },
  {
    key: "risk",
    name: "Risk",
    question: "How bumpy could the ride be? (higher = safer)",
    inputs: [
      { label: "Debt to equity", weight: 35 },
      { label: "Beta", weight: 30 },
      { label: "Position in 52-week range", weight: 20 },
      { label: "Trading volume", weight: 15 },
    ],
    scale: ["Low", "Moderate", "Elevated", "High"],
  },
];

export const RATING_RULES = [
  { title: "Stars", body: "The average of the scores that have data, out of 5 — rounded to the nearest half star." },
  { title: "Bullish · Neutral · Bearish", body: "Bullish from an average of 65, Bearish below 45. With fewer than three scores available, the bar is stricter (78 / 25)." },
  { title: "Confidence", body: "High with all four scores, Moderate with three, Limited with fewer — and Preliminary until you've confirmed 30% of the checklist." },
  { title: "Missing data", body: "Inputs without data are skipped and the rest rescaled; a score with under 40% of its inputs isn't shown at all, and partial scores are pulled toward the middle." },
];

export const GLOSSARY_CATEGORIES = ["Valuation", "Profitability", "Financial strength", "Growth", "Trading & risk", "IPOs", "Global & AI"];

export const GLOSSARY = [
  { term: "P/E ratio", full: "Price-to-Earnings", category: "Valuation", definition: "Share price divided by earnings per share — how much investors are paying for each unit of yearly profit." },
  { term: "P/B ratio", full: "Price-to-Book", category: "Valuation", definition: "Share price divided by book value per share — the market price compared with the company's accounting net worth." },
  { term: "Market cap", category: "Valuation", definition: "Share price × total shares — what the whole company is worth on the market. Stockproof's tiers: India large ₹20,000 Cr+, mid ₹5,000–20,000 Cr; US large $10B+, mid $2–10B." },
  { term: "Dividend yield", category: "Valuation", definition: "Yearly dividend per share as a percentage of the share price. Unusually high yields often mean the price has fallen, not that the payout is generous." },
  { term: "EPS", full: "Earnings Per Share", category: "Profitability", definition: "A company's profit divided by its total outstanding shares. For Indian stocks, Stockproof prefers the EPS reported to NSE." },
  { term: "ROE", full: "Return on Equity", category: "Profitability", definition: "Net profit as a percentage of shareholders' equity — how efficiently the company turns shareholders' money into profit." },
  { term: "Net profit margin", category: "Profitability", definition: "Net profit as a percentage of revenue — out of every 100 in sales, how much is left as actual profit." },
  { term: "Debt to equity", category: "Financial strength", definition: "Total debt divided by shareholders' equity. Lower generally means less reliance on borrowed money." },
  { term: "Book value", category: "Financial strength", definition: "Net assets (assets minus liabilities) divided by outstanding shares — the company's accounting worth per share." },
  { term: "Current ratio", category: "Financial strength", definition: "Current assets divided by current liabilities. Above 1 means short-term assets cover the bills due within a year." },
  { term: "Revenue & earnings growth", category: "Growth", definition: "How much sales and profit changed over the latest year, as reported by the data feed." },
  { term: "CAGR", full: "Compound Annual Growth Rate", category: "Growth", definition: "The steady yearly rate that would take a figure from its first value to its last over several years — smooths out bumpy years." },
  { term: "52-week high / low", category: "Trading & risk", definition: "The highest and lowest prices the stock has traded at over the past year." },
  { term: "Volume", category: "Trading & risk", definition: "Number of shares traded in a period. Higher volume usually means it's easier to buy or sell without moving the price." },
  { term: "Beta", category: "Trading & risk", definition: "How much a stock tends to move compared with the overall market. 1 moves with the market; above 1 swings more, below 1 less." },
  { term: "Sector / Industry", category: "Trading & risk", definition: "Sector is the broad category (e.g. Technology); industry is the narrower group within it (e.g. IT Services) — used to find peers." },
  { term: "Price band", category: "IPOs", definition: "The price range investors can bid within during an IPO. Most retail applicants bid at the upper end." },
  { term: "Lot size", category: "IPOs", definition: "The minimum number of shares you must apply for in an IPO — bids are made in multiples of it." },
  { term: "Subscription (×)", category: "IPOs", definition: "How many times the shares on offer were bid for. A demand signal, not a verdict on whether the company or price is good." },
  { term: "GMP", full: "Grey Market Premium", category: "IPOs", definition: "The unofficial premium IPO shares trade at before listing. Unregulated, it can swing sharply and often differs from the real listing price." },
  { term: "ADR", full: "American Depositary Receipt", category: "Global & AI", definition: "A certificate traded on US exchanges that represents shares of a foreign company — e.g. Infosys (INFY). It trades in dollars on US hours." },
  { term: "Headline sentiment", category: "Global & AI", definition: "FinBERT, a finance-trained AI model running in your browser, labels each headline positive, neutral or negative. It reads tone only — not the full article, and not a view on the stock." },
];

export const SOURCES = [
  { name: "Yahoo Finance", uses: ["Prices & charts", "Fundamentals", "Screener", "Europe, Japan & India news"] },
  { name: "NSE India", uses: ["IPO lists & subscription", "Shareholding pattern", "Reported EPS"] },
  { name: "Finnhub", uses: ["US market status", "US quotes & logos", "World news", "US IPO calendar", "US peers"] },
  { name: "ipoalerts", uses: ["IPO company profiles", "Strengths & risks", "GMP trend"] },
  { name: "Google News", uses: ["Company headlines (India & US editions)"] },
  { name: "FinBERT (in-browser AI)", uses: ["Headline sentiment"] },
];
