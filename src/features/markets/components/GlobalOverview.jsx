import DataNotAvailable from "../../../shared/ui/DataNotAvailable.jsx";
import { IconMarket } from "../../../shared/ui/icons.jsx";
import { useGetUsMarketStatusQuery } from "../api/marketsApi.js";
import { INDIAN_ADRS, US_LEADERS } from "../lib/watchlists.js";
import MarketStatusBar from "./MarketStatusBar.jsx";
import UsQuoteGrid from "./UsQuoteGrid.jsx";
import WorldNews from "./WorldNews.jsx";

export default function GlobalOverview() {
  const status = useGetUsMarketStatusQuery();

  // 503 = the server has no FINNHUB_API_KEY. World news from Yahoo still
  // works, so show that rather than an empty page.
  const finnhubMissing = status.error?.status === 503;

  return (
    <>
      {finnhubMissing ? (
        <DataNotAvailable
          icon={<IconMarket width={30} height={30} />}
          title="US market data isn't set up"
          description="Add a free Finnhub API key as FINNHUB_API_KEY in .env.local and restart the dev server."
        />
      ) : (
        <>
          <MarketStatusBar />
          <UsQuoteGrid title="US market leaders" symbols={US_LEADERS} />
          <UsQuoteGrid
            title="Indian companies listed in the US"
            subtitle="American Depositary Receipts (ADRs) of Indian companies. They trade in US dollars on New York hours, so they can move differently from the NSE share."
            symbols={INDIAN_ADRS}
          />
        </>
      )}
      <WorldNews />
    </>
  );
}
