import { computeOverallRecommendation } from "../../insights.js";
import { IconTrendUp, IconTrendDown, IconArrowRight } from "../icons.jsx";

export default function RecommendationCard({ categories, onSave }) {
  const overall = computeOverallRecommendation(categories);
  const hasSignal = overall.stars != null;

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

      <button type="button" className="btn btn-primary btn-full" onClick={scrollToChecklist}>
        Continue Evaluation <IconArrowRight width={16} height={16} />
      </button>
      <button type="button" className="btn btn-ghost btn-full" onClick={onSave}>
        Save to History
      </button>
    </section>
  );
}
