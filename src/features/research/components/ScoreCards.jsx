import { deriveNetMarginHistory } from "../lib/insights.js";
import Sparkline from "../../../shared/ui/Sparkline.jsx";
import { IconHealth, IconValuation, IconGrowth, IconShield } from "../../../shared/ui/icons.jsx";

const CARDS = [
  { key: "financialHealth", label: "Financial Health", Icon: IconHealth },
  { key: "valuation", label: "Valuation", Icon: IconValuation },
  { key: "growth", label: "Growth", Icon: IconGrowth },
  { key: "risk", label: "Risk", Icon: IconShield },
];

function toneForScore(score) {
  if (score == null) return "muted";
  if (score >= 65) return "positive";
  if (score >= 40) return "warning";
  return "negative";
}

export default function ScoreCards({ categories, fetchedData }) {
  const marginHistory = deriveNetMarginHistory(fetchedData || {});
  const revenueHistory = (fetchedData?.revenue_history || []).map((r) => r.value_cr);

  const sparklineFor = (key) => {
    if (key === "financialHealth") return marginHistory;
    if (key === "growth") return revenueHistory;
    return [];
  };

  return (
    <div className="score-cards-grid">
      {CARDS.map(({ key, label, Icon }) => {
        const cat = categories[key];
        const tone = toneForScore(cat.score);
        return (
          <div className={`score-card score-card--${tone}`} key={key}>
            <div className="score-card-top">
              <span className="score-card-icon">
                <Icon width={18} height={18} />
              </span>
              <span className="score-card-label">{label}</span>
            </div>
            {cat.available ? (
              <div className="score-card-value">
                {cat.score}
                <span className="score-card-max">/100</span>
              </div>
            ) : (
              <div className="score-card-value score-card-value--muted">—</div>
            )}
            <span className={`score-card-status score-card-status--${tone}`}>{cat.status}</span>
            <div className="score-card-spark">
              <Sparkline values={sparklineFor(key)} width={100} height={28} tone={tone === "muted" ? "accent" : tone} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
