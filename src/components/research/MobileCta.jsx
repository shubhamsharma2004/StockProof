import { computeOverallRecommendation } from "../../insights.js";
import { computeScore } from "../../checklistData.js";

export default function MobileCta({ stockData, categories, onSave }) {
  const overall = computeOverallRecommendation(categories);
  const score = computeScore(stockData.checkedItems, stockData.mode);

  const scrollToChecklist = () => {
    document.getElementById("insight-checklist")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mobile-cta">
      <div className="mobile-cta-progress">
        <svg viewBox="0 0 36 36" className="mobile-cta-ring">
          <circle cx="18" cy="18" r="15.5" className="mobile-cta-ring-track" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            className="mobile-cta-ring-fill"
            strokeDasharray={2 * Math.PI * 15.5}
            strokeDashoffset={2 * Math.PI * 15.5 * (1 - score.percent / 100)}
          />
        </svg>
        <span>{score.percent}%</span>
      </div>
      <div className="mobile-cta-text">
        <strong>{overall.label !== "Not enough data" ? overall.label : "Keep researching"}</strong>
        <span>{score.checked}/{score.total} confirmed</span>
      </div>
      <button type="button" className="btn btn-primary btn-sm" onClick={scrollToChecklist}>
        Continue
      </button>
    </div>
  );
}
