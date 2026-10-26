import { useSelector } from "react-redux";
import { buildFinalRecommendation } from "../../lib/insights.js";
import { selectCategories, selectFetchedData, selectProgress } from "../../model/selectors.js";
import StarRating from "../../../../shared/ui/StarRating.jsx";
import { IconCheckCircle, IconWarning } from "../../../../shared/ui/icons.jsx";

const REVIEW_MIN_CHECKED = 3;

export default function FinalRecommendationCard() {
  const score = useSelector(selectProgress);
  const eligible = score.checked >= REVIEW_MIN_CHECKED;

  return (
    <section className="sidebar-card final-recommendation-card">
      <div className="sidebar-card-title-row">
        <span className="trophy-icon" aria-hidden="true">🏆</span>
        <h2 className="sidebar-card-title">Final Recommendation</h2>
      </div>

      {!eligible ? (
        <p className="final-recommendation-hint">
          Confirm at least {REVIEW_MIN_CHECKED} checklist items to unlock this automated summary.
        </p>
      ) : (
        <FinalRecommendationBody score={score} />
      )}
    </section>
  );
}

function FinalRecommendationBody({ score }) {
  const fetchedData = useSelector(selectFetchedData);
  const categories = useSelector(selectCategories);
  const rec = buildFinalRecommendation(fetchedData || {}, categories, score.percent);

  return (
    <>
      <div className="final-rec-rating-row">
        <StarRating value={rec.stars} size={16} />
        {rec.stars != null ? <span>({rec.stars.toFixed(1)}/5)</span> : null}
      </div>
      <p className="final-rec-label">{rec.investmentLabel}</p>
      {rec.summary ? <p className="final-rec-summary">{rec.summary}</p> : null}

      {rec.reasons.length > 0 ? (
        <div className="final-rec-block">
          <h3>Reasons</h3>
          <ul className="final-rec-list final-rec-list--positive">
            {rec.reasons.map((r) => (
              <li key={r.label}>
                <IconCheckCircle width={14} height={14} />
                <span>
                  <strong>{r.label}</strong>
                  <span className="final-rec-proof">{r.proof}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rec.watchOuts.length > 0 ? (
        <div className="final-rec-block">
          <h3>Watch Out</h3>
          <ul className="final-rec-list final-rec-list--warning">
            {rec.watchOuts.map((r) => (
              <li key={r.label}>
                <IconWarning width={14} height={14} />
                <span>
                  <strong>{r.label}</strong>
                  <span className="final-rec-proof">{r.proof}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rec.suitableFor.length > 0 ? (
        <div className="final-rec-block">
          <h3>Suitable For</h3>
          <div className="chip-group">
            {rec.suitableFor.map((s) => (
              <span className="chip chip--muted" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
