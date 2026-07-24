import TrendCard from "../TrendCard.jsx";
import { historyCAGR } from "../../../insights.js";
import { formatCurrency, formatNumber } from "../../../utils.js";
import { IconGrowth, IconHealth, IconValuation, IconShield } from "../../icons.jsx";

export default function FinancialsTab({ stockData, nse }) {
  const fd = stockData.fetchedData || {};
  const revenueHistory = fd.revenue_history || [];
  const netIncomeHistory = fd.net_income_history || [];

  const latestRevenue = revenueHistory[revenueHistory.length - 1];
  const latestProfit = netIncomeHistory[netIncomeHistory.length - 1];

  const epsHistory =
    fd.shares_outstanding > 0
      ? netIncomeHistory.map((r) => ({ year: r.year, value_cr: (r.value_cr * 1e7) / fd.shares_outstanding }))
      : [];

  // The 5-year sparkline above still has to use the approximation (NSE's
  // quarterly feed only covers ~5 quarters, not 5 years, so it can't replace
  // that history) — but the single current-value figure can use the real
  // reported NSE EPS when available, same as the Overview tab, so the two
  // don't show two different numbers for the same thing.
  const nseEps = nse?.eps;
  const currentEps = nseEps?.eps ?? fd.earnings_per_share ?? null;
  const currentEpsNote = nseEps?.eps != null
    ? nseEps.basis === "ttm" ? "Reported (NSE, TTM)." : `Reported (NSE, single quarter ended ${nseEps.periodEnd || "—"}, not annualized).`
    : fd.earnings_per_share != null
      ? "Reported (Yahoo, TTM)."
      : null;

  return (
    <div className="tab-panel">
      <section className="panel-card">
        <h2 className="panel-title">Financial Performance</h2>
        <p className="panel-subtitle">Annual figures as reported, most recent years available.</p>
        <div className="trend-card-grid">
          <TrendCard
            label="Revenue"
            icon={IconGrowth}
            currentValueLabel={latestRevenue ? `₹${formatNumber(latestRevenue.value_cr, 0)} Cr` : null}
            cagr={historyCAGR(revenueHistory)}
            values={revenueHistory.map((r) => r.value_cr)}
          />
          <TrendCard
            label="Net Profit"
            icon={IconHealth}
            currentValueLabel={latestProfit ? `₹${formatNumber(latestProfit.value_cr, 0)} Cr` : null}
            cagr={historyCAGR(netIncomeHistory)}
            values={netIncomeHistory.map((r) => r.value_cr)}
          />
          <TrendCard
            label="EPS"
            icon={IconValuation}
            currentValueLabel={currentEps != null ? formatCurrency(currentEps) : null}
            cagr={historyCAGR(epsHistory)}
            values={epsHistory.map((r) => r.value_cr)}
            note={
              epsHistory.length > 1
                ? [currentEpsNote, "5Y trend is approximate — derived from net profit ÷ current shares outstanding, not reported EPS history."]
                    .filter(Boolean)
                    .join(" ")
                : currentEpsNote
            }
          />
          <TrendCard
            label="Debt to Equity"
            icon={IconShield}
            currentValueLabel={fd.debt_to_equity != null ? formatNumber(fd.debt_to_equity) : null}
            values={[]}
            note="Historical trend needs fuller balance-sheet history than this data source provides — showing current value only."
          />
        </div>
      </section>
    </div>
  );
}
