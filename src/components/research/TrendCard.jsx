import Sparkline from "../Sparkline.jsx";
import { formatNumber } from "../../utils.js";

export default function TrendCard({ label, currentValueLabel, cagr, values, note, icon: Icon }) {
  const hasCagr = typeof cagr === "number" && Number.isFinite(cagr);
  return (
    <div className="trend-card">
      <div className="trend-card-top">
        {Icon ? (
          <span className="trend-card-icon">
            <Icon width={16} height={16} />
          </span>
        ) : null}
        <span className="trend-card-label">{label}</span>
      </div>
      <div className="trend-card-value">{currentValueLabel ?? "Data not available"}</div>
      {hasCagr ? (
        <span className={`trend-card-cagr ${cagr >= 0 ? "is-positive" : "is-negative"}`}>
          {cagr >= 0 ? "+" : ""}
          {formatNumber(cagr)}% CAGR
        </span>
      ) : null}
      <div className="trend-card-spark">
        <Sparkline values={values || []} width={130} height={32} tone="auto" />
      </div>
      {note ? <p className="trend-card-note">{note}</p> : null}
    </div>
  );
}
