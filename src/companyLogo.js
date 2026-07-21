// Brandfetch Logo API — real company logos, keyed by domain. Requires a
// free client ID (see .env.example); without one, companyLogoUrl() returns
// null everywhere and callers fall back to a generated letter avatar.
const BRANDFETCH_CLIENT_ID = import.meta.env.VITE_BRANDFETCH_CLIENT_ID || "";

// Yahoo Finance's self-reported `website` field is occasionally wrong or
// outdated (e.g. it returns "icici.bank.in" for ICICI Bank instead of the
// real icicibank.com), which sends Brandfetch a domain that resolves to the
// wrong or a generic logo. Each entry below was verified live (DNS + HTTPS)
// before being added — this only covers the curated large/mid-cap pool used
// elsewhere in the app; every other symbol still falls back to Yahoo's raw
// website field, which is correct for the large majority of companies.
const DOMAIN_OVERRIDES = {
  RELIANCE: "ril.com",
  TCS: "tcs.com",
  HDFCBANK: "hdfcbank.com",
  INFY: "infosys.com",
  ICICIBANK: "icicibank.com",
  BHARTIARTL: "airtel.in",
  SBIN: "sbi.co.in",
  ITC: "itcportal.com",
  LT: "larsentoubro.com",
  HINDUNILVR: "hul.co.in",
  KOTAKBANK: "kotak.com",
  AXISBANK: "axisbank.com",
  BAJFINANCE: "bajajfinserv.in",
  MARUTI: "marutisuzuki.com",
  SUNPHARMA: "sunpharma.com",
  TITAN: "titancompany.in",
  ULTRACEMCO: "ultratechcement.com",
  ASIANPAINT: "asianpaints.com",
  WIPRO: "wipro.com",
  HCLTECH: "hcltech.com",
  ADANIENT: "adanienterprises.com",
  ADANIPORTS: "adaniports.com",
  ONGC: "ongcindia.com",
  NTPC: "ntpc.co.in",
  TATASTEEL: "tatasteel.com",
  JSWSTEEL: "jsw.in",
  TATAMOTORS: "tatamotors.com",
  "M&M": "mahindra.com",
  BAJAJFINSV: "bajajfinserv.in",
  HDFCLIFE: "hdfclife.com",
  SBILIFE: "sbilife.co.in",
  DIVISLAB: "divislabs.com",
  DRREDDY: "drreddys.com",
  CIPLA: "cipla.com",
  BRITANNIA: "britannia.co.in",
  EICHERMOT: "eichermotors.com",
  HEROMOTOCO: "heromotocorp.com",
  COALINDIA: "coalindia.co.in",
  INDUSINDBK: "indusind.com",
  TECHM: "techmahindra.com",
  BPCL: "bharatpetroleum.com",
  IOC: "iocl.com",
};

function domainFromWebsite(website) {
  if (!website) return null;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function companyLogoUrl(website, { size = 96, symbol } = {}) {
  const domain = (symbol && DOMAIN_OVERRIDES[symbol]) || domainFromWebsite(website);
  if (!domain || !BRANDFETCH_CLIENT_ID) return null;
  return `https://cdn.brandfetch.io/${domain}/w/${size}/h/${size}/fallback/lettermark/icon?c=${BRANDFETCH_CLIENT_ID}`;
}
