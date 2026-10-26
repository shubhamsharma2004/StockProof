import { formatCurrency, formatNumber, formatUsd } from "./format.js";

// Large amounts from the quote proxy (market cap, revenue, cash, debt…)
// arrive in "crore units" (value ÷ 10⁷) whatever the currency. India shows
// them as ₹… Cr; the US converts back and shows $1.2B / $3.4T.
function compactUsdFromCrore(cr) {
  const dollars = cr * 1e7;
  return `$${dollars.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 })}`;
}

const MONEY = {
  INR: {
    symbol: "₹",
    price: formatCurrency,
    amountCr: (cr) => (cr == null || Number.isNaN(cr) ? "—" : `₹${formatNumber(cr, 0)} Cr`),
  },
  USD: {
    symbol: "$",
    price: formatUsd,
    amountCr: (cr) => (cr == null || Number.isNaN(cr) ? "—" : compactUsdFromCrore(cr)),
  },
};

// Formatters for one currency: { symbol, price(v), amountCr(crUnits) }.
export function moneyFor(currency) {
  return MONEY[currency] || MONEY.INR;
}
