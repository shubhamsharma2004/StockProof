import { sectionsForMode, computeCategoryScore } from "../../checklistData.js";
import { FIELD_LABELS, FIELD_FORMATTERS } from "../../fieldMeta.js";
import { IconCheckCircle } from "../icons.jsx";

export default function InsightChecklist({ stockData }) {
  const { mode, checkedItems, fetchedData, toggleItem } = stockData;
  const sections = sectionsForMode(mode);

  return (
    <section className="panel-card" id="insight-checklist">
      <h2 className="panel-title">Research Checklist</h2>
      <p className="panel-subtitle">Confirm each item yourself — checking a box means you've looked at it, not that it's automatically "good".</p>

      <div className="insight-section-list">
        {sections.map((section) => {
          const catScore = computeCategoryScore(section, checkedItems);
          return (
            <div className="insight-section" key={section.id}>
              <div className="insight-section-head">
                <h3>{section.title}</h3>
                <span className="insight-section-progress">{catScore.checked}/{catScore.total}</span>
              </div>
              <div className="insight-card-grid">
                {section.items.map((item) => (
                  <InsightCard
                    key={item.id}
                    item={item}
                    checked={Boolean(checkedItems[item.id])}
                    fetchedData={fetchedData}
                    onToggle={(checked) => toggleItem(item.id, checked)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsightCard({ item, checked, fetchedData, onToggle }) {
  const hasLiveFields = Boolean(item.liveFields?.length);
  const metricName = hasLiveFields ? FIELD_LABELS[item.liveFields[0]] : null;

  return (
    <label className={`insight-card ${checked ? "is-checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
      <div className="insight-card-body">
        <div className="insight-card-top">
          <span className="insight-card-check">
            <IconCheckCircle width={18} height={18} />
          </span>
          {metricName ? <span className="insight-card-metric">{metricName}</span> : null}
          <span className={`badge-pill ${checked ? "badge-pill--confirmed" : hasLiveFields ? "badge-pill--pending" : "badge-pill--manual"}`}>
            {checked ? "Confirmed" : hasLiveFields ? "Pending" : "Manual"}
          </span>
        </div>
        <p className="insight-card-label">{item.label}</p>
        {hasLiveFields ? (
          <div className="live-chips">
            {item.liveFields.map((key) => (
              <span className="live-chip" key={key}>
                <span className="live-chip-label">{FIELD_LABELS[key]}</span>
                <span className="live-chip-value">{FIELD_FORMATTERS[key](fetchedData[key])}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="manual-chip">Manual — no data source for this</span>
        )}
        <p className="insight-card-hint">{item.hint}</p>
      </div>
    </label>
  );
}
