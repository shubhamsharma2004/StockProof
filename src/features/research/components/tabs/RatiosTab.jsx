import { useSelector } from "react-redux";
import { deriveNetMarginHistory } from "../../lib/insights.js";
import { selectFetchedData } from "../../model/selectors.js";
import { formatNumber } from "../../../../shared/lib/format.js";
import { IconTrendUp, IconTrendDown } from "../../../../shared/ui/icons.jsx";

const NOT_AVAILABLE = "Data not available";

export default function RatiosTab() {
  const fd = useSelector(selectFetchedData) || {};
  const marginHistory = deriveNetMarginHistory(fd);
  const marginTrend =
    marginHistory.length >= 2 ? (marginHistory[marginHistory.length - 1] >= marginHistory[0] ? "up" : "down") : null;

  const rows = [
    { label: "Return on Equity (ROE)", value: fd.return_on_equity, trend: null },
    { label: "Return on Assets (ROA)", value: fd.return_on_assets, trend: null },
    { label: "Net Profit Margin", value: fd.profit_margin, trend: marginTrend },
    { label: "Operating Margin", value: fd.operating_margin, trend: null },
    { label: "Gross Margin", value: fd.gross_margin, trend: null },
    { label: "EBITDA Margin", value: fd.ebitda_margin, trend: null },
  ];

  return (
    <div className="tab-panel">
      <section className="panel-card">
        <h2 className="panel-title">Profitability Ratios</h2>
        <p className="panel-subtitle">
          Real, current figures from the live feed. Sector-average comparisons aren't available from
          this data source, so they're left out rather than estimated.
        </p>
        <div className="ratios-table">
          <div className="ratios-table-head">
            <span>Metric</span>
            <span>Value</span>
            <span>5Y Trend</span>
          </div>
          {rows.map((r) => (
            <div className="ratios-table-row" key={r.label}>
              <span>{r.label}</span>
              <span className={r.value == null ? "is-muted" : ""}>
                {r.value != null ? `${formatNumber(r.value)}%` : NOT_AVAILABLE}
              </span>
              <span>
                {r.trend === "up" ? (
                  <IconTrendUp width={15} height={15} className="trend-up" />
                ) : r.trend === "down" ? (
                  <IconTrendDown width={15} height={15} className="trend-down" />
                ) : (
                  <span className="is-muted">—</span>
                )}
              </span>
            </div>
          ))}
          <div className="ratios-table-row">
            <span>Debt to Equity</span>
            <span className={fd.debt_to_equity == null ? "is-muted" : ""}>
              {fd.debt_to_equity != null ? formatNumber(fd.debt_to_equity) : NOT_AVAILABLE}
            </span>
            <span className="is-muted">—</span>
          </div>
          <div className="ratios-table-row">
            <span>Current Ratio</span>
            <span className={fd.current_ratio == null ? "is-muted" : ""}>
              {fd.current_ratio != null ? formatNumber(fd.current_ratio) : NOT_AVAILABLE}
            </span>
            <span className="is-muted">—</span>
          </div>
        </div>
      </section>
    </div>
  );
}
