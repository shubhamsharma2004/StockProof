// Ensures a symbol is in the form Yahoo Finance expects: Indian listings
// carry an .NS/.BO suffix; US tickers (exchange "US") are used as-is.
export function buildSymbol(rawSymbol, exchange) {
  const symbol = (rawSymbol || "").trim().toUpperCase();
  if (exchange === "US") return symbol;
  if (symbol.endsWith(".NS") || symbol.endsWith(".BO")) return symbol;
  const suffix = exchange === "BSE" ? ".BO" : ".NS";
  return `${symbol}${suffix}`;
}

// Bare NSE symbol (no .NS/.BO suffix) — NSE's own filing endpoints are keyed
// by the regulatory symbol, not the Yahoo-style suffixed one.
export function bareSymbol(symbolWithSuffix) {
  return (symbolWithSuffix || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
}
