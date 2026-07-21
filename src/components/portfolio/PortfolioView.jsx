import { useEffect, useMemo, useState } from "react";
import { buildSymbol, fetchStockChart } from "../../api.js";
import { formatCurrency, formatNumber } from "../../utils.js";
import { buildSparklinePoints } from "../../insights.js";
import { IconPortfolio, IconTrendUp, IconTrendDown } from "../icons.jsx";
import PageHeader from "../PageHeader.jsx";
import StockSearchBox from "../StockSearchBox.jsx";
import DataNotAvailable from "../research/DataNotAvailable.jsx";

function toDateInputValue(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function nearestPoint(points, targetMs) {
  if (!points.length) return null;
  let best = points[0];
  let bestDiff = Math.abs(points[0].t - targetMs);
  for (const p of points) {
    const diff = Math.abs(p.t - targetMs);
    if (diff < bestDiff) {
      best = p;
      bestDiff = diff;
    }
  }
  return best;
}

const MS_YEAR = 365.25 * 24 * 3600 * 1000;

export default function PortfolioView({ stockData }) {
  const { selected } = stockData;
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buyDate, setBuyDate] = useState("");
  const [sellDate, setSellDate] = useState("");
  const [amount, setAmount] = useState(10000);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const symbol = buildSymbol(selected.symbol, selected.exchange);
    fetchStockChart(symbol, "max").then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok && res.points.length >= 2) {
        setPoints(res.points);
        setBuyDate(toDateInputValue(res.points[0].t));
        setSellDate(toDateInputValue(res.points[res.points.length - 1].t));
      } else {
        setPoints([]);
        setError("Not enough historical price data available for this stock.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const minDate = points.length ? toDateInputValue(points[0].t) : undefined;
  const maxDate = points.length ? toDateInputValue(points[points.length - 1].t) : undefined;

  const scenario = useMemo(() => {
    if (!points.length || !buyDate || !sellDate) return null;
    const buyPoint = nearestPoint(points, new Date(buyDate).getTime());
    const sellPoint = nearestPoint(points, new Date(sellDate).getTime());
    if (!buyPoint || !sellPoint || !(amount > 0)) return null;

    const chronological = buyPoint.t <= sellPoint.t ? [buyPoint, sellPoint] : [sellPoint, buyPoint];
    const [earlier, later] = chronological;
    const units = amount / earlier.c;
    const finalValue = units * later.c;
    const gain = finalValue - amount;
    const percent = ((later.c - earlier.c) / earlier.c) * 100;
    const years = (later.t - earlier.t) / MS_YEAR;
    const cagr = years > 0.08 ? (Math.pow(finalValue / amount, 1 / years) - 1) * 100 : null;
    const slice = points.filter((p) => p.t >= earlier.t && p.t <= later.t);

    return { buyPoint: earlier, sellPoint: later, units, finalValue, gain, percent, years, cagr, slice, reversed: buyPoint.t > sellPoint.t };
  }, [points, buyDate, sellDate, amount]);

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
          onSelect={stockData.selectSecurity}
          onManualEntry={stockData.enterManualEntry}
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
                <label htmlFor="scenario-amount">Investment amount (₹)</label>
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
                        {formatCurrency(scenario.gain)} ({scenario.gain >= 0 ? "+" : ""}
                        {formatNumber(scenario.percent)}%)
                      </strong>
                      <span>
                        Final value {formatCurrency(scenario.finalValue)}
                        {scenario.cagr != null ? ` · ${formatNumber(scenario.cagr)}% annualized` : ""}
                      </span>
                    </div>
                  </div>
                  <svg viewBox="0 0 120 36" width="140" height="40" className={`sparkline sparkline--${scenario.gain >= 0 ? "positive" : "negative"}`}>
                    {buildSparklinePoints(scenario.slice.map((p) => p.c), 120, 36) ? (
                      <polyline
                        points={buildSparklinePoints(scenario.slice.map((p) => p.c), 120, 36)}
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null}
                  </svg>
                </div>

                <div className="scenario-detail-grid">
                  <div>
                    <span className="scenario-detail-label">Bought at (nearest trading date)</span>
                    <span className="scenario-detail-value">
                      {formatCurrency(scenario.buyPoint.c)} on {new Date(scenario.buyPoint.t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="scenario-detail-label">Sold at (nearest trading date)</span>
                    <span className="scenario-detail-value">
                      {formatCurrency(scenario.sellPoint.c)} on {new Date(scenario.sellPoint.t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
