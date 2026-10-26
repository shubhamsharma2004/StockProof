// The two markets the app can show. The India/US switch picks one; every
// market-aware page reads its settings from here instead of hard-coding
// "NSE" or "₹".
export const MARKET_KEYS = { INDIA: "IN", US: "US" };

export const MARKETS = {
  IN: {
    key: "IN",
    label: "India",
    flag: "🇮🇳",
    currency: "INR",
    exchangeLabel: "NSE",
    // Default exchange for a security picked in this market.
    defaultExchange: "NSE",
    defaultFeatured: { symbol: "RELIANCE", name: "Reliance Industries", exchange: "NSE" },
    popular: [
      { symbol: "RELIANCE", name: "Reliance Industries", exchange: "NSE" },
      { symbol: "TCS", name: "Tata Consultancy Services", exchange: "NSE" },
      { symbol: "HDFCBANK", name: "HDFC Bank", exchange: "NSE" },
      { symbol: "INFY", name: "Infosys", exchange: "NSE" },
      { symbol: "ICICIBANK", name: "ICICI Bank", exchange: "NSE" },
      { symbol: "BHARTIARTL", name: "Bharti Airtel", exchange: "NSE" },
      { symbol: "SBIN", name: "State Bank of India", exchange: "NSE" },
      { symbol: "ITC", name: "ITC", exchange: "NSE" },
      { symbol: "LT", name: "Larsen & Toubro", exchange: "NSE" },
      { symbol: "HINDUNILVR", name: "Hindustan Unilever", exchange: "NSE" },
    ],
  },
  US: {
    key: "US",
    label: "US",
    flag: "🇺🇸",
    currency: "USD",
    exchangeLabel: "US",
    defaultExchange: "US",
    defaultFeatured: { symbol: "AAPL", name: "Apple Inc.", exchange: "US" },
    popular: [
      { symbol: "AAPL", name: "Apple", exchange: "US" },
      { symbol: "MSFT", name: "Microsoft", exchange: "US" },
      { symbol: "NVDA", name: "Nvidia", exchange: "US" },
      { symbol: "GOOGL", name: "Alphabet", exchange: "US" },
      { symbol: "AMZN", name: "Amazon", exchange: "US" },
      { symbol: "META", name: "Meta Platforms", exchange: "US" },
      { symbol: "TSLA", name: "Tesla", exchange: "US" },
      { symbol: "JPM", name: "JPMorgan Chase", exchange: "US" },
      { symbol: "V", name: "Visa", exchange: "US" },
      { symbol: "KO", name: "Coca-Cola", exchange: "US" },
    ],
  },
};

// A security's market follows from its exchange: "US" → US, NSE/BSE → India.
export function marketOf(security) {
  return security?.exchange === "US" ? MARKET_KEYS.US : MARKET_KEYS.INDIA;
}
