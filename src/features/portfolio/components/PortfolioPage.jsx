import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelected, manualEntryStarted } from "../../research/index.js";
import { useGetChartQuery } from "../../market-data/index.js";
import { StockSearchBox } from "../../search/index.js";
import { securityRequested } from "../../../shared/model/events.js";
import { buildSymbol } from "../../../shared/lib/symbols.js";
import { formatNumber, formatDate } from "../../../shared/lib/format.js";
import { moneyFor } from "../../../shared/lib/money.js";
import { MARKETS, marketOf } from "../../../shared/config/markets.js";
import { selectMarket } from "../../ui/index.js";
import Sparkline from "../../../shared/ui/Sparkline.jsx";
import DataNotAvailable from "../../../shared/ui/DataNotAvailable.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { IconPortfolio, IconTrendUp, IconTrendDown } from "../../../shared/ui/icons.jsx";
import { computeScenario, toDateInputValue } from "../lib/scenario.js";

export default function PortfolioPage() {
  const dispatch = useDispatch();
  const selected = useSelector(selectSelected);
  const market = useSelector(selectMarket);
  const money = moneyFor(MARKETS[selected ? marketOf(selected) : market.key].currency);
  const symbol = selected ? buildSymbol(selected.symbol, selected.exchange) : null;
  const { currentData, isFetching } = useGetChartQuery(symbol ? { symbol, range: "max" } : skipToken);
  const points = currentData && currentData.length >= 2 ? currentData : null;
  const error = !isFetching && currentData !== undefined && !points ? "Not enough historical price data available for this stock." : null;
  const loading = isFetching && !currentData;

  const [buyDate, setBuyDate] = useState("");
  const [sellDate, setSellDate] = useState("");
  const [amount, setAmount] = useState(10000);

  // Default the scenario to the full available history each time a new
  // stock's prices arrive.
  useEffect(() => {
    if (!points) return;
    setBuyDate(toDateInputValue(points[0].t));
    setSellDate(toDateInputValue(points[points.length - 1].t));
  }, [points]);

  const minDate = points ? toDateInputValue(points[0].t) : undefined;
  const maxDate = points ? toDateInputValue(points[points.length - 1].t) : undefined;
  const scenario = useMemo(() => computeScenario(points, buyDate, sellDate, amount), [points, buyDate, sellDate, amount]);

  return (
    <div className="page-shell">
      <PageHeader
        label="Portfolio"
        title="Portfolio"
        subtitle={
          selected
            ? `A "what if" scenario for ${selected.name} (${selected.symbol}) — uses real historical closing prices, not a prediction.`
            : "Pick any stock to run a buy/sell \"what if\" scenario on real historical closing prices."
        }
      />

      <div className="panel-card portfolio-picker-card">
        <label htmlFor="portfolio-stock-search" className="scenario-field-label">
          {selected ? "Change stock" : "Choose a stock"}
        </label>
        <StockSearchBox
          onSelect={(security) => dispatch(securityRequested({ security, navigate: false }))}
          onManualEntry={(text) => dispatch(manualEntryStarted({ text, exchange: market.defaultExchange }))}
          id="portfolio-stock-search"
          className="portfolio-search"
        />
      </div>

      {!selected ? (
        <DataNotAvailable
          icon={<IconPortfolio width={30} height={30} />}
          title="No stock selected yet"
          description="Search for a stock above, or pick one already open in Stock Research."
        />
      ) : (
        <div className="panel-card">
        <h2 className="panel-title">Buy / Sell Scenario</h2>
        {loading ? (
          <p className="panel-subtitle">Loading historical prices…</p>
        ) : error ? (
          <p className="panel-subtitle">{error}</p>
        ) : (
          <>
            <div className="scenario-inputs">
              <div className="scenario-field">
                <label htmlFor="scenario-buy-date">Buy date</label>
                <input
                  id="scenario-buy-date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                />
              </div>
              <div className="scenario-field">
                <label htmlFor="scenario-sell-date">Sell date</label>
                <input
                  id="scenario-sell-date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={sellDate}
                  onChange={(e) => setSellDate(e.target.value)}
                />
              </div>
              <div className="scenario-field">
                <label htmlFor="scenario-amount">Investment amount ({money.symbol})</label>
                <input
                  id="scenario-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {scenario ? (
              <div className="scenario-result">
                {scenario.reversed ? (
                  <p className="scenario-note">Sell date was before buy date — dates were swapped to keep this chronological.</p>
                ) : null}
                <div className="scenario-result-top">
                  <div className={`scenario-headline ${scenario.gain >= 0 ? "is-positive" : "is-negative"}`}>
                    {scenario.gain >= 0 ? <IconTrendUp width={22} height={22} /> : <IconTrendDown width={22} height={22} />}
                    <div>
                      <strong>
                        {scenario.gain >= 0 ? "+" : ""}
                        {money.price(scenario.gain)} ({scenario.gain >= 0 ? "+" : ""}
                        {formatNumber(scenario.percent)}%)
                      </strong>
                      <span>
                        Final value {money.price(scenario.finalValue)}
                        {scenario.cagr != null ? ` · ${formatNumber(scenario.cagr)}% annualized` : ""}
                      </span>
                    </div>
                  </div>
                  <Sparkline
                    values={scenario.slice.map((p) => p.c)}
                    width={140}
                    height={40}
                    tone={scenario.gain >= 0 ? "positive" : "negative"}
                    filled
                  />
                </div>

                <div className="scenario-detail-grid">
                  <div>
                    <span className="scenario-detail-label">Bought at (nearest trading date)</span>
                    <span className="scenario-detail-value">
                      {money.price(scenario.buyPoint.c)} on {formatDate(scenario.buyPoint.t)}
                    </span>
                  </div>
                  <div>
                    <span className="scenario-detail-label">Sold at (nearest trading date)</span>
                    <span className="scenario-detail-value">
                      {money.price(scenario.sellPoint.c)} on {formatDate(scenario.sellPoint.t)}
                    </span>
                  </div>
                  <div>
                    <span className="scenario-detail-label">Units bought</span>
                    <span className="scenario-detail-value">{formatNumber(scenario.units, 3)}</span>
                  </div>
                  <div>
                    <span className="scenario-detail-label">Holding period</span>
                    <span className="scenario-detail-value">{formatNumber(scenario.years, 1)} years</span>
                  </div>
                </div>

                <p className="scenario-disclaimer">
                  Based on actual historical closing prices for {selected.symbol}, snapped to the nearest available
                  trading day. Ignores brokerage, taxes, STT, and dividends — a real outcome would differ.
                </p>
              </div>
            ) : null}
          </>
        )}
        </div>
      )}
    </div>
  );
}
