import { useGetUsMarketStatusQuery } from "../api/marketsApi.js";

const SESSION_LABELS = {
  "pre-market": "Pre-market session",
  regular: "Regular session",
  "post-market": "After-hours session",
};

function newYorkTime(ms) {
  return new Date(ms).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
}

export default function MarketStatusBar() {
  const { data: status, isLoading, isError } = useGetUsMarketStatusQuery(undefined, { pollingInterval: 60_000 });

  if (isLoading) return <div className="market-status market-status--loading">Checking US market status…</div>;
  if (isError || !status) return null;

  const open = status.isOpen;
  return (
    <div className={`market-status ${open ? "is-open" : ""}`} role="status">
      <span className="market-status-dot" aria-hidden="true" />
      <strong>US markets {open ? "open" : "closed"}</strong>
      <span className="market-status-detail">
        NYSE &amp; Nasdaq
        {status.holiday ? ` · ${status.holiday}` : ""}
        {open && status.session ? ` · ${SESSION_LABELS[status.session] || status.session}` : ""}
        {` · ${newYorkTime(status.asOf)} New York`}
      </span>
    </div>
  );
}
