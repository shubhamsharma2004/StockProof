import { useDispatch, useSelector } from "react-redux";
import { sectionsForMode, computeCategoryScore } from "../lib/checklist.js";
import { FIELD_LABELS, fieldFormatters } from "../lib/fieldMeta.js";
import { CHECKLIST_ANCHOR_ID } from "../lib/scrollToChecklist.js";
import { itemToggled } from "../model/researchSlice.js";
import { selectMoney, selectResearch } from "../model/selectors.js";
import { IconCheckCircle } from "../../../shared/ui/icons.jsx";

export default function InsightChecklist() {
  const dispatch = useDispatch();
  const { mode, checkedItems, fetchedData } = useSelector(selectResearch);
  const money = useSelector(selectMoney);
  const formatters = fieldFormatters(money);
  const sections = sectionsForMode(mode);

  return (
    <section className="panel-card" id={CHECKLIST_ANCHOR_ID}>
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
                    formatters={formatters}
                    onToggle={(checked) => dispatch(itemToggled({ itemId: item.id, checked }))}
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

function InsightCard({ item, checked, fetchedData, formatters, onToggle }) {
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
                <span className="live-chip-value">{formatters[key](fetchedData[key])}</span>
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
