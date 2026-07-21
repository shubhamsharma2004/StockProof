import { sectionsForMode, computeScore, computeCategoryScore } from "../../checklistData.js";

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function ProgressCard({ stockData }) {
  const { mode, checkedItems } = stockData;
  const score = computeScore(checkedItems, mode);
  const sections = sectionsForMode(mode);
  const dashOffset = CIRCUMFERENCE * (1 - score.percent / 100);
  const remaining = score.total - score.checked;
  const estMinutes = Math.max(1, Math.round(remaining * 1.5));

  const scrollToChecklist = () => {
    document.getElementById("insight-checklist")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="sidebar-card progress-card">
      <h2 className="sidebar-card-title">Research Progress</h2>

      <div className="progress-ring-wrap">
        <svg className="progress-ring" viewBox="0 0 100 100" role="img" aria-label={`${score.percent}% of checklist complete`}>
          <circle className="progress-ring-track" cx="50" cy="50" r="42" />
          <circle
            className="progress-ring-fill"
            cx="50"
            cy="50"
            r="42"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="progress-ring-text">
          <span className="progress-ring-percent">{score.percent}%</span>
          <span className="progress-ring-caption">Completed</span>
        </div>
      </div>

      <div className="overall-score-row">
        <span className="overall-score-label">Overall Score</span>
        <span className="overall-score-value">
          {score.percent}
          <span className="overall-score-max">/100</span>
        </span>
      </div>

      <div className="score-breakdown">
        {sections.map((section) => {
          const catScore = computeCategoryScore(section, checkedItems);
          return (
            <div className="score-breakdown-row" key={section.id}>
              <span className="score-breakdown-label">{section.title}</span>
              <div className="score-breakdown-track">
                <div className="score-breakdown-fill" style={{ width: `${catScore.percent}%` }} />
              </div>
              <span className="score-breakdown-fraction">
                {catScore.checked}/{catScore.total}
              </span>
            </div>
          );
        })}
      </div>

      {remaining > 0 ? (
        <button type="button" className="questions-remaining" onClick={scrollToChecklist}>
          <span className="questions-remaining-count">{remaining}</span> Questions Remaining
          <span className="questions-remaining-time">Est. time: {estMinutes} min{estMinutes === 1 ? "" : "s"}</span>
        </button>
      ) : (
        <p className="questions-remaining questions-remaining--done">All checklist items confirmed</p>
      )}
    </section>
  );
}
