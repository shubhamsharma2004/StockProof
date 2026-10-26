import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "../../../shared/lib/format.js";
import { securityRequested } from "../../../shared/model/events.js";
import AreaChart from "../../../shared/ui/AreaChart.jsx";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import { IconArrowRight, IconCheckCircle, IconClose, IconExternalLink, IconWarning } from "../../../shared/ui/icons.jsx";
import { useGetIpoGmpQuery, useGetIpoProfileQuery, useGetListedQuoteQuery } from "../api/ipoApi.js";
import { daysUntil, formatIssueSize, formatPriceRange, formatRupees, impliedGainPercent, TYPE_LABELS } from "../lib/ipoFormat.js";
import { formatSubscriptionTimes } from "../lib/ipoInsights.js";

const shortDate = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function IpoDetailModal({ ipo, onClose }) {
  const dispatch = useDispatch();
  const listed = ipo.status === "listed";
  const profileQuery = useGetIpoProfileQuery(ipo.symbol);
  const gmpQuery = useGetIpoGmpQuery(ipo.symbol, { skip: listed });
  const { data: listedQuote } = useGetListedQuoteQuery(ipo.symbol, { skip: !listed });

  const p = profileQuery.data?.available ? profileQuery.data.profile : null;
  const gmp = gmpQuery.data?.available ? gmpQuery.data : null;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const priceRange = ipo.priceRange || p?.priceRange;
  const subscribed = ipo.timesSubscribed ?? p?.timesSubscribed;
  const facts = [
    [ipo.issuePrice ? "Issue price" : "Price band", ipo.issuePrice ? formatCurrency(ipo.issuePrice) : formatPriceRange(priceRange)],
    ["Lot size", p?.minQty != null ? `${p.minQty} shares` : null],
    ["Min. investment", formatRupees(p?.minAmount)],
    ["Issue size", formatIssueSize(p?.issueSize)],
    ["Subscribed", formatSubscriptionTimes(subscribed)],
    ["Listing date", ipo.listingDate || p?.listingDate ? formatDate(ipo.listingDate || p.listingDate) : null],
    ["Listing gain", p?.listingGain != null ? `${p.listingGain >= 0 ? "+" : ""}${formatNumber(p.listingGain)}%` : null],
  ].filter(([, v]) => v);

  const links = [
    ["Prospectus (RHP)", p?.prospectusUrl],
    ["NSE issue page", p?.nseInfoUrl],
    ["More details", p?.infoUrl],
  ].filter(([, url]) => url);

  const gain = gmp ? impliedGainPercent(gmp.latest, priceRange) : null;

  return (
    <div className="ipo-modal-backdrop" onClick={onClose}>
      <div className="ipo-modal" role="dialog" aria-modal="true" aria-label={ipo.name} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
          <IconClose width={16} height={16} />
        </button>

        <header className="ipo-modal-head">
          <CompanyLogo symbol={ipo.symbol} src={p?.logo} size={56} />
          <div>
            <h2>{ipo.name}</h2>
            <span>{[ipo.symbol, TYPE_LABELS[ipo.type] || ipo.type].filter(Boolean).join(" · ")}</span>
          </div>
        </header>

        <dl className="ipo-facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {p?.subscriptionUpdatedAt ? <p className="ipo-modal-note">Subscription as reported by NSE, {formatDateTime(p.subscriptionUpdatedAt)}.</p> : null}

        {gmp ? (
          <section className="ipo-modal-section">
            <h3>Grey market premium (GMP)</h3>
            <p className="ipo-gmp-summary">
              <strong>₹{formatNumber(gmp.latest)}</strong>
              {gain != null ? <span className={gain >= 0 ? "is-positive" : "is-negative"}> implies ~{gain >= 0 ? "+" : ""}{formatNumber(gain, 1)}% on listing</span> : null}
              <span className="ipo-modal-note"> · as of {formatDate(gmp.latestAt)}</span>
            </p>
            {gmp.series.length >= 2 ? (
              <AreaChart
                points={gmp.series}
                height={180}
                formatValue={(v) => `₹${formatNumber(v)}`}
                formatTick={shortDate}
                formatTooltipTime={(t) => formatDate(t)}
                ariaLabel="Daily grey market premium"
              />
            ) : null}
            <p className="ipo-modal-note">
              GMP is the unofficial price of IPO shares before listing. It's unregulated, can swing sharply, and often
              differs from the actual listing price.
            </p>
          </section>
        ) : null}

        {profileQuery.isFetching && !p ? (
          <p className="ipo-modal-note ipo-modal-loading">Loading company details…</p>
        ) : profileQuery.isError ? (
          <p className="ipo-modal-note ipo-modal-loading">
            {profileQuery.error?.status === 503
              ? "Add an ipoalerts API key (IPOALERTS_API_KEY) to see company details, strengths, risks and the timeline."
              : profileQuery.error?.data?.error || "Company details are unavailable right now."}
          </p>
        ) : !p ? (
          <p className="ipo-modal-note ipo-modal-loading">No detailed profile is available for this issue.</p>
        ) : null}

        {p?.about ? (
          <section className="ipo-modal-section">
            <h3>About the company</h3>
            <p>{p.about}</p>
          </section>
        ) : null}

        {p && (p.strengths.length || p.risks.length) ? (
          <div className="ipo-modal-columns">
            {p.strengths.length ? (
              <section className="ipo-modal-section">
                <h3>Strengths</h3>
                <ul className="final-rec-list final-rec-list--positive">
                  {p.strengths.map((s) => (
                    <li key={s}>
                      <IconCheckCircle width={14} height={14} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {p.risks.length ? (
              <section className="ipo-modal-section">
                <h3>Risks</h3>
                <ul className="final-rec-list final-rec-list--warning">
                  {p.risks.map((r) => (
                    <li key={r}>
                      <IconWarning width={14} height={14} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        {p?.schedule.length ? (
          <section className="ipo-modal-section">
            <h3>Timeline</h3>
            <ol className="ipo-timeline">
              {p.schedule.map((step) => (
                <li key={`${step.event}-${step.date}`} className={daysUntil(step.date) < 0 ? "is-past" : ""}>
                  <span className="ipo-timeline-dot" aria-hidden="true" />
                  <span className="ipo-timeline-event">{step.event}</span>
                  <span className="ipo-timeline-date">{formatDate(step.date)}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {links.length || (listed && listedQuote) ? (
          <footer className="ipo-modal-foot">
            <div className="ipo-modal-links">
              {links.map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer noopener" className="link-btn">
                  {label} <IconExternalLink width={12} height={12} />
                </a>
              ))}
            </div>
            {listed && listedQuote ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  dispatch(securityRequested({ security: { symbol: ipo.symbol, name: ipo.name, exchange: listedQuote.exchange } }));
                }}
              >
                Research this stock <IconArrowRight width={15} height={15} />
              </button>
            ) : null}
          </footer>
        ) : null}

        <p className="ipo-modal-disclaimer">
          Company details, strengths and risks are summarised by ipoalerts from the offer documents — read the prospectus
          before applying. Not investment advice.
        </p>
      </div>
    </div>
  );
}
