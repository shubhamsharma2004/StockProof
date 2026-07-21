// Checklist definitions. Nothing here scores a security "good" or "bad" —
// every item is a yes/no confirmation that the user has looked at something
// themselves. `liveFields` just tells the renderer which fetched/manual data
// points to display alongside the hint; it never drives the checkbox state.

export const MODES = {
  STOCK: "stock",
  ETF: "etf",
};

export const CHECKLIST = [
  {
    id: "fundamentals",
    title: "Fundamentals",
    appliesTo: [MODES.STOCK],
    items: [
      {
        id: "revenue-earnings-growth",
        label: "Revenue and earnings growth are stable or improving",
        hint: "Look at the last 3–5 years of results, not just one quarter. The API has no historical trend data — check the company's filings or a financial data site.",
      },
      {
        id: "debt-levels",
        label: "Debt levels are manageable for the sector",
        hint: "Compare debt-to-equity against sector peers. Capital-intensive sectors (utilities, infra) naturally run higher than asset-light ones (IT, FMCG).",
      },
      {
        id: "profit-margins",
        label: "Profit margins are healthy versus peers",
        hint: "Operating and net margins, compared to a couple of direct competitors — not to unrelated sectors.",
      },
      {
        id: "eps-book-value",
        label: "EPS and book value look healthy for the price",
        hint: "A quick sense check that earnings and book value support the current valuation.",
        liveFields: ["earnings_per_share", "book_value"],
      },
    ],
  },
  {
    id: "valuation",
    title: "Valuation",
    appliesTo: [MODES.STOCK, MODES.ETF],
    items: [
      {
        id: "pe-ratio",
        label: "P/E ratio is reasonable versus the sector average",
        hint: "A high P/E isn't automatically bad, and a low one isn't automatically a bargain — context is what matters.",
        liveFields: ["pe_ratio"],
      },
      {
        id: "pb-ratio",
        label: "P/B ratio (derived from book value) looks reasonable",
        hint: "Derived from live price and book value below. More useful for banks/financials than for asset-light businesses.",
        liveFields: ["pb_ratio"],
      },
      {
        id: "dividend-yield",
        label: "Dividend yield is sustainable",
        hint: "A very high yield can be a warning sign rather than a bonus — check the payout ratio if it looks unusually generous.",
        liveFields: ["dividend_yield"],
      },
      {
        id: "price-reasoning",
        label: "You understand why it's priced where it is",
        hint: "Manual judgment — growth expectations, recent news, sector sentiment. No API field can answer this for you.",
      },
    ],
  },
  {
    id: "risk",
    title: "Risk",
    appliesTo: [MODES.STOCK, MODES.ETF],
    items: [
      {
        id: "52-week-range",
        label: "Price is far from its 52-week high/low, or you understand why it's near either extreme",
        hint: "Being near a high or low isn't inherently good or bad, but you should know which one it is and why.",
        liveFields: ["last_price", "year_high", "year_low"],
      },
      {
        id: "liquidity",
        label: "Trading volume/liquidity looks sufficient",
        hint: "Thin liquidity can mean wider spreads and difficulty exiting a position when you want to.",
        liveFields: ["volume"],
      },
      {
        id: "concentration",
        label: "You know the concentration/sector risk",
        hint: "Understand what sector and industry this falls into, and how that overlaps with the rest of your holdings.",
        liveFields: ["sector", "industry"],
      },
      {
        id: "news-flags",
        label: "No major red flags in recent news",
        hint: "Manual — this API has no news feed. Check for regulatory action, management changes, or litigation.",
      },
    ],
  },
  {
    id: "funds",
    title: "For Funds / ETFs",
    appliesTo: [MODES.ETF],
    items: [
      {
        id: "expense-ratio",
        label: "Expense ratio is competitive",
        hint: "Compare against similar funds tracking the same index or sector — manual entry, no live field for this.",
      },
      {
        id: "tracking-error",
        label: "Tracking error is low",
        hint: "For index funds/ETFs, a low tracking error means the fund closely mirrors its benchmark.",
      },
      {
        id: "aum",
        label: "AUM is large enough for stability",
        hint: "Very small funds carry a higher risk of being wound up or merged.",
      },
    ],
  },
  {
    id: "fit",
    title: "Fit For You",
    appliesTo: [MODES.STOCK, MODES.ETF],
    items: [
      {
        id: "time-horizon",
        label: "Matches your investment time horizon",
        hint: "Short-term needs and long-term goals call for very different kinds of holdings.",
      },
      {
        id: "affordability",
        label: "Losing this entirely wouldn't hurt your finances",
        hint: "A gut check on position sizing relative to your overall financial picture.",
      },
      {
        id: "portfolio-fit",
        label: "Fits your overall portfolio mix, without overloading one sector or theme",
        hint: "Consider what else you hold — this shouldn't be your fifth bet on the same theme.",
      },
    ],
  },
];

export function sectionsForMode(mode) {
  return CHECKLIST.filter((section) => section.appliesTo.includes(mode));
}

export function allItemIdsForMode(mode) {
  return sectionsForMode(mode).flatMap((section) => section.items.map((item) => item.id));
}

export function computeScore(checkedItems, mode) {
  const ids = allItemIdsForMode(mode);
  const total = ids.length;
  const checked = ids.filter((id) => checkedItems[id]).length;
  return {
    checked,
    total,
    percent: total === 0 ? 0 : Math.round((checked / total) * 100),
  };
}

const SCORE_CAPTIONS = [
  { min: 90, caption: "Thoroughly researched" },
  { min: 70, caption: "Well researched" },
  { min: 40, caption: "Partially researched" },
  { min: 1, caption: "Early research" },
  { min: 0, caption: "Not started" },
];

export function scoreCaption(percent) {
  return SCORE_CAPTIONS.find((tier) => percent >= tier.min).caption;
}

export function computeCategoryScore(section, checkedItems) {
  const total = section.items.length;
  const checked = section.items.filter((item) => checkedItems[item.id]).length;
  return {
    checked,
    total,
    percent: total === 0 ? 0 : Math.round((checked / total) * 100),
  };
}
