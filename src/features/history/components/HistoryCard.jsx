import { useSelector } from "react-redux";
import { selectHistory } from "../model/historySlice.js";
import { formatDate } from "../../../shared/lib/format.js";

// Presentational list of saved evaluations. What "loading" an entry means
// belongs to whoever renders this (the research feature), so it's a prop.
export default function HistoryCard({ onSelect }) {
  const { items, loading, notice } = useSelector(selectHistory);

  return (
    <section className="sidebar-card">
      <h2 className="sidebar-card-title">Past Evaluations</h2>
      {notice ? <p className="history-notice">{notice}</p> : null}
      {loading ? (
        <p className="history-status">Loading history…</p>
      ) : items.length === 0 ? (
        <p className="history-status">No saved evaluations yet.</p>
      ) : (
        <ul className="history-list">
          {items.map((entry, i) => (
            <li key={entry.id || i}>
              <button type="button" className="history-item" onClick={() => onSelect(entry)}>
                <span className="history-ticker">
                  {entry.ticker} <em>{entry.isETF ? "ETF" : "Stock"}</em>
                </span>
                <span className="history-meta">
                  {formatDate(entry.createdAt)} · {entry.score}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
