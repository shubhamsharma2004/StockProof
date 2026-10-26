import { useDispatch } from "react-redux";
import { IconSparkle } from "../../../shared/ui/icons.jsx";
import { disableSentiment, enableSentiment, loadSentimentModel } from "../model/sentimentSlice.js";

// The opt-in prompt, download progress, and the aggregate mood for a set of
// headlines — one component for every state of the feature.
export default function SentimentPanel({ sentiment, subject = "these headlines" }) {
  const dispatch = useDispatch();
  const { enabled, status, progress, error, summary } = sentiment;

  if (!enabled) {
    return (
      <div className="sentiment-panel sentiment-panel--optin">
        <span className="sentiment-panel-icon">
          <IconSparkle width={18} height={18} />
        </span>
        <div className="sentiment-panel-text">
          <strong>AI headline sentiment</strong>
          <span>
            Scores the tone of {subject} with FinBERT, a finance-tuned AI model that runs entirely in your browser — no
            account or API key. One-time download of about 110 MB, then cached.
          </span>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => dispatch(enableSentiment())}>
          Enable
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="sentiment-panel">
        <div className="sentiment-panel-text">
          <strong>Sentiment model couldn't load</strong>
          <span>{error}</span>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch(loadSentimentModel())}>
          Retry
        </button>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="sentiment-panel">
        <div className="sentiment-panel-text">
          <strong>{progress > 0 ? `Loading sentiment model… ${progress}%` : "Loading sentiment model…"}</strong>
          <span>First time only — afterwards it loads from your browser's cache.</span>
          <div className="sentiment-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    );
  }

  const { counts, analyzed, total, mood } = summary;
  const pct = (n) => (analyzed ? (n / analyzed) * 100 : 0);

  return (
    <div className="sentiment-panel">
      <div className="sentiment-panel-text">
        <div className="sentiment-panel-headline">
          <strong>Headline tone</strong>
          <span className={`pill pill--${mood.tone}`}>{mood.label}</span>
        </div>
        {analyzed > 0 ? (
          <>
            <div className="sentiment-bar" aria-hidden="true">
              <span className="sentiment-bar-positive" style={{ width: `${pct(counts.positive)}%` }} />
              <span className="sentiment-bar-neutral" style={{ width: `${pct(counts.neutral)}%` }} />
              <span className="sentiment-bar-negative" style={{ width: `${pct(counts.negative)}%` }} />
            </div>
            <span>
              {counts.positive} positive · {counts.neutral} neutral · {counts.negative} negative
              {analyzed < total ? ` — scoring ${total - analyzed} more…` : ` across ${analyzed} headlines`}
            </span>
          </>
        ) : (
          <span>Scoring headlines…</span>
        )}
        <span className="sentiment-disclaimer">
          Automated reading of headline tone by FinBERT — not a view on the stock, and not investment advice.{" "}
          <button type="button" className="sentiment-off" onClick={() => dispatch(disableSentiment())}>
            Turn off
          </button>
        </span>
      </div>
    </div>
  );
}
