function formatHistoryDate(entry) {
  const raw = entry.createdAt;
  let d;
  if (raw?.toDate) d = raw.toDate();
  else if (raw?.seconds) d = new Date(raw.seconds * 1000);
  else d = new Date(raw);
  if (Number.isNaN(d?.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryCard({ history, onLoadEntry }) {
  return (
    <section className="sidebar-card">
      <h2 className="sidebar-card-title">Past Evaluations</h2>
      {history.historyNotice ? <p className="history-notice">{history.historyNotice}</p> : null}
      {history.historyLoading ? (
        <p className="history-status">Loading history…</p>
      ) : history.history.length === 0 ? (
        <p className="history-status">No saved evaluations yet.</p>
      ) : (
        <ul className="history-list">
          {history.history.map((entry, i) => (
            <li key={entry.id || i}>
              <button type="button" className="history-item" onClick={() => onLoadEntry(entry)}>
                <span className="history-ticker">
                  {entry.ticker} <em>{entry.isETF ? "ETF" : "Stock"}</em>
                </span>
                <span className="history-meta">
                  {formatHistoryDate(entry)} · {entry.score}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
