import { computeCategoryScores, computeOverallRecommendation } from "../../research/index.js";
import { formatCurrency, formatDate, formatNumber } from "../../../shared/lib/format.js";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import Link from "../../../shared/ui/Link.jsx";
import StarRating from "../../../shared/ui/StarRating.jsx";
import { ipoPath } from "../../ui/index.js";
import { useGetListedQuoteQuery } from "../api/ipoApi.js";
import { formatPriceRange, relativeDay, TYPE_LABELS } from "../lib/ipoFormat.js";
import { formatSubscriptionTimes, subscriptionStrength } from "../lib/ipoInsights.js";
import GmpBadge from "./GmpBadge.jsx";

function Fact({ label, value, tone }) {
  return (
    <div>
      <span className="scenario-detail-label">{label}</span>
      <span className={`scenario-detail-value ${tone ? `is-${tone}` : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

const withRelative = (iso) => (iso ? `${formatDate(iso)} (${relativeDay(iso)})` : null);

// The one card used on every tab; which facts it shows depends on the
// IPO's stage (open → subscription, upcoming → dates, listed → returns).
export default function IpoCard({ ipo }) {
  const strength = subscriptionStrength(ipo.timesSubscribed);
  const preListing = ipo.status !== "listed";

  return (
    <Link className="ipo-card" to={ipoPath(ipo)}>
      <div className="ipo-card-top">
        <CompanyLogo symbol={ipo.symbol || ipo.name} size={44} />
        <div className="ipo-card-id">
          <strong title={ipo.name}>{ipo.name}</strong>
          <span>
            {ipo.symbol}
            <span className={`ipo-type ipo-type--${(ipo.type || "eq").toLowerCase()}`}>{TYPE_LABELS[ipo.type] || ipo.type}</span>
          </span>
        </div>
      </div>

      <div className="ipo-card-detail-grid">
        <Fact label={ipo.issuePrice ? "Issue price" : "Price band"} value={ipo.issuePrice ? formatCurrency(ipo.issuePrice) : formatPriceRange(ipo.priceRange)} />

        {ipo.status === "open" ? <Fact label="Closes" value={withRelative(ipo.endDate)} /> : null}
        {ipo.status === "upcoming" ? <Fact label="Opens" value={withRelative(ipo.startDate)} /> : null}
        {ipo.status === "closed" ? <Fact label="Bidding closed" value={ipo.endDate ? formatDate(ipo.endDate) : null} /> : null}
        {ipo.status === "listed" ? <Fact label="Listed" value={ipo.listingDate ? formatDate(ipo.listingDate) : null} /> : null}

        {ipo.status === "open" ? <Fact label="Subscribed" value={formatSubscriptionTimes(ipo.timesSubscribed) || "No bids yet"} /> : null}
        {ipo.status === "listed" ? <ListedNow ipo={ipo} /> : null}
      </div>

      {preListing ? (
        <div className="ipo-card-badges">
          {ipo.status === "open" && ipo.timesSubscribed != null ? <span className={`pill pill--${strength.tone}`}>{strength.label}</span> : null}
          <GmpBadge symbol={ipo.symbol} priceRange={ipo.priceRange} />
        </div>
      ) : null}
    </Link>
  );
}

// For a listed issue: live price, return since the issue price, and
// Stockproof's fundamentals rating — the same engine used across the app,
// only once real trading data exists.
function ListedNow({ ipo }) {
  const { data, isLoading } = useGetListedQuoteQuery(ipo.symbol, { skip: !ipo.symbol });
  const quote = data?.quote;
  const overall = quote ? computeOverallRecommendation(computeCategoryScores(quote)) : null;
  const gain = ipo.issuePrice && quote?.last_price != null ? ((quote.last_price - ipo.issuePrice) / ipo.issuePrice) * 100 : null;

  return (
    <>
      <Fact label="Now" value={quote?.last_price != null ? formatCurrency(quote.last_price) : isLoading ? "…" : "Not available"} />
      <Fact
        label="Since issue"
        value={gain != null ? `${gain >= 0 ? "+" : ""}${formatNumber(gain)}%` : isLoading ? "…" : null}
        tone={gain == null ? null : gain >= 0 ? "positive" : "negative"}
      />
      {overall?.stars != null ? (
        <div className="ipo-card-rating">
          <StarRating value={overall.stars} size={13} />
          <span>{overall.label}</span>
        </div>
      ) : null}
    </>
  );
}
