// Empirically verified against Yahoo Finance's own `industry` tag per symbol
// (the same field shown in the Hero card) — fetched live for ~100 NSE
// large/mid-caps, not guessed. Industries with only one mapped symbol are
// omitted since they could never produce a peer comparison anyway. Not an
// exhaustive market map — a curated subset covering the sectors people
// actually search for.
export const INDUSTRY_PEERS = {
  "Aerospace & Defense": ["BEL", "HAL"],
  "Auto Manufacturers": ["EICHERMOT", "HEROMOTOCO", "MARUTI"],
  "Banks - Regional": ["AUBANK", "AXISBANK", "BANDHANBNK", "BANKBARODA", "CANBK", "FEDERALBNK", "HDFCBANK", "ICICIBANK", "IDFCFIRSTB", "INDUSINDBK", "KOTAKBANK", "PNB", "SBIN"],
  "Building Materials": ["ACC", "AMBUJACEM", "GRASIM", "SHREECEM", "ULTRACEMCO"],
  "Credit Services": ["BAJFINANCE", "CHOLAFIN", "MUTHOOTFIN", "SHRIRAMFIN"],
  "Drug Manufacturers - Specialty & Generic": ["ALKEM", "AUROPHARMA", "CIPLA", "DIVISLAB", "DRREDDY", "LUPIN", "SUNPHARMA", "TORNTPHARM"],
  "Household & Personal Products": ["COLPAL", "DABUR", "GODREJCP", "HINDUNILVR", "MARICO"],
  "Information Technology Services": ["COFORGE", "HCLTECH", "INFY", "MPHASIS", "PERSISTENT", "TCS", "TECHM", "WIPRO"],
  "Insurance - Life": ["HDFCLIFE", "LICI", "SBILIFE"],
  "Medical Care Facilities": ["APOLLOHOSP", "FORTIS", "MAXHEALTH"],
  "Oil & Gas Refining & Marketing": ["BPCL", "RELIANCE"],
  "Packaged Foods": ["BRITANNIA", "NESTLEIND"],
  "Real Estate - Development": ["DLF", "GODREJPROP", "OBEROIRLTY"],
  "Specialty Chemicals": ["ASIANPAINT", "BERGEPAINT", "PIDILITIND"],
  "Specialty Industrial Machinery": ["ABB", "BHEL", "CUMMINSIND", "SIEMENS"],
  "Steel": ["JINDALSTEL", "JSWSTEEL", "NMDC", "SAIL", "TATASTEEL"],
  "Telecom Services": ["BHARTIARTL", "IDEA", "TATACOMM"],
  "Thermal Coal": ["ADANIENT", "COALINDIA"],
  "Utilities - Regulated Electric": ["NTPC", "POWERGRID"],
};

// Up to `limit` other symbols mapped to the same industry, excluding the
// stock itself. Returns [] for industries we haven't mapped or that only
// have one member — callers should treat that as "no peers", not an error.
export function findPeerSymbols(industry, ownSymbol, limit = 5) {
  const list = INDUSTRY_PEERS[industry];
  if (!list) return [];
  const bare = (ownSymbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
  return list.filter((s) => s !== bare).slice(0, limit);
}
