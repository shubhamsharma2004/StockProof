import { useDispatch, useSelector } from "react-redux";
import { CHART_RANGES, tickFormatterFor, useGetChartQuery, useGetQuoteQuery } from "../../market-data/index.js";
import { buildSymbol } from "../../../shared/lib/symbols.js";
import { formatDateTime, formatTime } from "../../../shared/lib/format.js";
import { moneyFor } from "../../../shared/lib/money.js";
import { MARKETS, marketOf } from "../../../shared/config/markets.js";
import { securityRequested } from "../../../shared/model/events.js";
import AreaChart from "../../../shared/ui/AreaChart.jsx";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import RangePills from "../../../shared/ui/RangePills.jsx";
import { IconArrowRight } from "../../../shared/ui/icons.jsx";
import { rangeChanged, selectDashboardRange, selectFeatured } from "../model/dashboardSlice.js";

const RANGE_OPTIONS = CHART_RANGES.map((r) => ({ key: r.key, label: r.long }));

export default function FeaturedChartCard() {
  const dispatch = useDispatch();
  const featured = useSelector(selectFeatured);
  const range = useSelector(selectDashboardRange);
  const symbol = buildSymbol(featured.symbol, featured.exchange);
  const money = moneyFor(MARKETS[marketOf(featured)].currency);

  const quote = useGetQuoteQuery(symbol);
  const chart = useGetChartQuery({ symbol, range });
  const q = quote.currentData;
  const points = chart.currentData;

  return (
    <section className="dash-card featured-card">
      <header className="featured-head">
        <CompanyLogo symbol={featured.symbol} website={q?.website} size={52} className="company-logo--round" />
        <div className="featured-identity">
          <h2>{featured.name}</h2>
          <span>{featured.symbol}</span>
        </div>
        <div className="featured-price">
          <div className="featured-price-row">
            {q?.percent_change != null ? <ChangeText value={q.percent_change} variant="badge" /> : null}
            {q?.last_price != null ? (
              <strong>{money.price(q.last_price)}</strong>
            ) : quote.isFetching ? (
              <strong>…</strong>
            ) : null}
          </div>
          <span>
            {quote.fulfilledTimeStamp && q
              ? `Last update at ${formatTime(quote.fulfilledTimeStamp)}`
              : quote.isError
                ? "Live price unavailable"
                : " "}
          </span>
        </div>
      </header>

      <div className="featured-toolbar">
        <RangePills options={RANGE_OPTIONS} value={range} onChange={(key) => dispatch(rangeChanged(key))} />
      </div>

      <div className="featured-chart">
        {chart.isFetching && !points ? (
          <div className="skeleton featured-chart-skeleton" />
        ) : !points || points.length < 2 ? (
          <div className="chart-placeholder">
            <p>{chart.isError ? "Price chart unavailable right now." : "Not enough price history for this range."}</p>
          </div>
        ) : (
          <AreaChart
            points={points}
            height={340}
            formatValue={money.price}
            formatTick={tickFormatterFor(range)}
            formatTooltipTime={formatDateTime}
            ariaLabel={`${featured.name} closing price`}
          />
        )}
      </div>

      <footer className="featured-foot">
        <button type="button" className="link-btn featured-open" onClick={() => dispatch(securityRequested({ security: featured }))}>
          Open full research <IconArrowRight width={15} height={15} />
        </button>
      </footer>
    </section>
  );
}
