import { computeOverallRecommendation, applyResearchProgressToConfidence, computeStrengthsAndWatch, plainSummary } from "../../insights.js";
import { computeScore } from "../../checklistData.js";
import { IconTrendUp, IconTrendDown, IconArrowRight, IconCheckCircle, IconWarning } from "../icons.jsx";

export default function RecommendationCard({ stockData, categories, onSave }) {
  const progress = computeScore(stockData.checkedItems, stockData.mode);
  const overall = applyResearchProgressToConfidence(computeOverallRecommendation(categories), progress.percent);
  const hasSignal = overall.stars != null;
  const { strengths, watch } = computeStrengthsAndWatch(stockData.fetchedData || {});

  const scrollToChecklist = () => {
    document.getElementById("insight-checklist")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="sidebar-card">
      <h2 className="sidebar-card-title">Current Recommendation</h2>
      <div className={`recommendation-pill recommendation-pill--${hasSignal ? overall.tone : "muted"}`}>
        {hasSignal ? (
          overall.tone === "positive" ? (
            <IconTrendUp width={22} height={22} />
          ) : overall.tone === "negative" ? (
            <IconTrendDown width={22} height={22} />
          ) : (
            <IconArrowRight width={22} height={22} />
          )
        ) : null}
        <div>
          <strong>{hasSignal ? overall.label : "Not enough data"}</strong>
          <span>{hasSignal ? overall.confidence : "Add more figures to unlock this"}</span>
        </div>
      </div>

      {hasSignal ? <p className="recommendation-summary">{plainSummary(overall)}</p> : null}

      {hasSignal && (strengths.length > 0 || watch.length > 0) ? (
        <div className="recommendation-why">
          {strengths.length > 0 ? (
            <ul className="final-rec-list final-rec-list--positive">
              {strengths.map((r) => (
                <li key={r.label}>
                  <IconCheckCircle width={14} height={14} />
                  <span>
                    <strong>{r.label}</strong>
                    <span className="final-rec-proof">{r.proof}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {watch.length > 0 ? (
            <ul className="final-rec-list final-rec-list--warning">
              {watch.map((r) => (
                <li key={r.label}>
                  <IconWarning width={14} height={14} />
                  <span>
                    <strong>{r.label}</strong>
                    <span className="final-rec-proof">{r.proof}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <button type="button" className="btn btn-primary btn-full" onClick={scrollToChecklist}>
        Continue Evaluation <IconArrowRight width={16} height={16} />
      </button>
      <button type="button" className="btn btn-ghost btn-full" onClick={onSave}>
        Save to History
      </button>
    </section>
  );
}
