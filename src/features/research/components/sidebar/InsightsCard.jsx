import { useSelector } from "react-redux";
import { sectionsForMode, computeCategoryScore, MODES } from "../../lib/checklist.js";
import { selectUser } from "../../../auth/index.js";
import { selectHistoryItems } from "../../../history/index.js";

function computeInsights(history) {
  const totalEvaluations = history.length;
  const avgScore = totalEvaluations
    ? Math.round(history.reduce((sum, e) => sum + (e.score || 0), 0) / totalEvaluations)
    : 0;

  const categoryTotals = {};
  history.forEach((entry) => {
    const mode = entry.isETF ? MODES.ETF : MODES.STOCK;
    sectionsForMode(mode).forEach((section) => {
      const catScore = computeCategoryScore(section, entry.checkedItems || {});
      const bucket = categoryTotals[section.title] || { checked: 0, total: 0 };
      bucket.checked += catScore.checked;
      bucket.total += catScore.total;
      categoryTotals[section.title] = bucket;
    });
  });

  const categoryAverages = Object.entries(categoryTotals)
    .map(([title, { checked, total }]) => ({ title, percent: total ? Math.round((checked / total) * 100) : 0 }))
    .sort((a, b) => b.percent - a.percent);

  return { totalEvaluations, avgScore, categoryAverages };
}

export default function InsightsCard() {
  const user = useSelector(selectUser);
  const history = useSelector(selectHistoryItems);
  if (!user) return null;

  if (!history.length) {
    return (
      <section className="sidebar-card">
        <h2 className="sidebar-card-title">Your Insights</h2>
        <p className="insights-basis">Signed-in only. Save a few evaluations to see stats here.</p>
      </section>
    );
  }

  const { totalEvaluations, avgScore, categoryAverages } = computeInsights(history);

  return (
    <section className="sidebar-card">
      <h2 className="sidebar-card-title">Your Insights</h2>
      <p className="insights-basis">
        Computed from your {totalEvaluations} saved evaluation{totalEvaluations === 1 ? "" : "s"}.
      </p>
      <div className="insights-stats">
        <div className="insights-stat">
          <span className="insights-stat-value">{totalEvaluations}</span>
          <span className="insights-stat-label">Saved</span>
        </div>
        <div className="insights-stat">
          <span className="insights-stat-value">{avgScore}%</span>
          <span className="insights-stat-label">Avg. completion</span>
        </div>
      </div>
      <p className="insights-subhead">Where your research is strongest, on average:</p>
      <div className="score-breakdown">
        {categoryAverages.map((c) => (
          <div className="score-breakdown-row" key={c.title}>
            <span className="score-breakdown-label">{c.title}</span>
            <div className="score-breakdown-track">
              <div className="score-breakdown-fill" style={{ width: `${c.percent}%` }} />
            </div>
            <span className="score-breakdown-fraction">{c.percent}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
