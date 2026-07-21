import { useState } from "react";
import { computeOverallRecommendation, computeStrengthsAndWatch, marketCapTier } from "../../insights.js";
import { formatCurrency, formatMarketCap, formatDateTime, formatNumber } from "../../utils.js";
import { companyLogoUrl } from "../../companyLogo.js";
import StarRating from "../StarRating.jsx";
import { IconTrendUp, IconTrendDown, IconCheckCircle, IconWarning, IconClose, IconStarFull, IconStarEmpty } from "../icons.jsx";

function stringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

// Tries a real logo (Brandfetch, keyed by the company's website domain)
// first; if there's no client ID configured, no website on record, or the
// image fails to load, it falls back to a generated letter avatar — never a
// broken image.
function CompanyAvatar({ symbol, website }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = companyLogoUrl(website, { symbol });

  if (logoUrl && !imgFailed) {
    return (
      <span className="company-avatar company-avatar--logo">
        <img src={logoUrl} alt="" width={44} height={44} onError={() => setImgFailed(true)} />
      </span>
    );
  }

  const hue = stringToHue(symbol || "SP");
  const initials = (symbol || "SP").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "SP";
  return (
    <span className="company-avatar" style={{ background: `hsl(${hue} 55% 30%)`, color: `hsl(${hue} 85% 85%)` }}>
      {initials}
    </span>
  );
}

export default function Hero({ stockData, categories, watchlist }) {
  const { selected, dataSource, fetchedData, fetchedAt } = stockData;
  const fd = fetchedData || {};

  if (dataSource === "loading") {
    return (
      <section className="hero-card hero-card--skeleton">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-lines">
          <div className="skeleton skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton skeleton-line" style={{ width: "25%" }} />
        </div>
      </section>
    );
  }

  const overall = computeOverallRecommendation(categories);
  const { strengths, watch } = computeStrengthsAndWatch(fd);
  const tier = marketCapTier(fd.market_cap);

  const absChange = fd.last_price != null && fd.prev_close != null ? fd.last_price - fd.prev_close : null;
  const isUp = (fd.percent_change ?? absChange ?? 0) >= 0;

  return (
    <section className="hero-card">
      <div className="hero-corner-actions">
        {watchlist ? (
          <button
            type="button"
            className={`hero-watchlist-btn ${watchlist.isWatchlisted(selected.symbol) ? "is-active" : ""}`}
            onClick={() => watchlist.toggle(selected)}
            aria-pressed={watchlist.isWatchlisted(selected.symbol)}
            aria-label={watchlist.isWatchlisted(selected.symbol) ? "Remove from watchlist" : "Add to watchlist"}
          >
            {watchlist.isWatchlisted(selected.symbol) ? (
              <IconStarFull width={16} height={16} />
            ) : (
              <IconStarEmpty width={16} height={16} />
            )}
            {watchlist.isWatchlisted(selected.symbol) ? "In Watchlist" : "Add to Watchlist"}
          </button>
        ) : null}
        <button type="button" className="hero-clear-btn" onClick={stockData.clearSelection} aria-label="Clear selection">
          <IconClose width={16} height={16} />
        </button>
      </div>

      <div className="hero-top">
        <CompanyAvatar symbol={selected.symbol} website={fd.website} />
        <div className="hero-identity">
          <h1 className="hero-name">{selected.name}</h1>
          <p className="hero-symbol">
            {selected.symbol} <span className="dot">•</span> {selected.exchange}
          </p>
          <div className="hero-tags">
            {tier ? <span className="tag">{tier}</span> : null}
            {fd.sector ? <span className="tag">{fd.sector}</span> : null}
          </div>
        </div>

        {fd.last_price != null ? (
          <div className="hero-price-block">
            <span className="hero-price">{formatCurrency(fd.last_price)}</span>
            <span className={`hero-change ${isUp ? "is-positive" : "is-negative"}`}>
              {isUp ? <IconTrendUp width={14} height={14} /> : <IconTrendDown width={14} height={14} />}
              {absChange != null ? `${isUp ? "+" : ""}${formatNumber(absChange)} ` : ""}
              {fd.percent_change != null ? `(${isUp ? "+" : ""}${formatNumber(fd.percent_change)}%)` : ""}
            </span>
          </div>
        ) : null}

        <div className="hero-rating-block">
          <span className="hero-rating-title">Overall Rating</span>
          <div className="hero-rating-row">
            <StarRating value={overall.stars} size={17} />
            {overall.stars != null ? <span className="hero-rating-number">{overall.stars.toFixed(1)}/5</span> : null}
          </div>
          {overall.stars != null ? (
            <div className="hero-badge-row">
              <span className={`pill pill--${overall.tone}`}>{overall.label}</span>
              <span className="pill pill--muted">{overall.confidence}</span>
            </div>
          ) : (
            <span className="pill pill--muted">Not enough data yet</span>
          )}
        </div>
      </div>

      <div className="hero-stats-strip">
        {fd.market_cap != null && <HeroStat label="Market Cap" value={formatMarketCap(fd.market_cap)} />}
        {fd.sector && <HeroStat label="Sector" value={fd.sector} />}
        {fd.industry && <HeroStat label="Industry" value={fd.industry} />}
        {fd.year_high != null && <HeroStat label="52W High" value={formatCurrency(fd.year_high)} />}
        {fd.year_low != null && <HeroStat label="52W Low" value={formatCurrency(fd.year_low)} />}
        {fd.dividend_yield != null && <HeroStat label="Dividend Yield" value={`${formatNumber(fd.dividend_yield)}%`} />}
      </div>

      {(strengths.length > 0 || watch.length > 0) && (
        <div className="hero-chip-rows">
          {strengths.length > 0 && (
            <div className="hero-chip-row">
              <span className="hero-chip-row-label">Strengths</span>
              <div className="chip-group">
                {strengths.map((s) => (
                  <span className="chip chip--positive" key={s}>
                    <IconCheckCircle width={14} height={14} /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {watch.length > 0 && (
            <div className="hero-chip-row">
              <span className="hero-chip-row-label">Things to Watch</span>
              <div className="chip-group">
                {watch.map((s) => (
                  <span className="chip chip--warning" key={s}>
                    <IconWarning width={14} height={14} /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="hero-footnote">
        {dataSource === "live" && fetchedAt ? `As of ${formatDateTime(fetchedAt)}` : "Manual entry — figures entered by you"}
        {" · Live data may be delayed; verify before acting."}
      </p>
    </section>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="hero-stat">
      <span className="hero-stat-label">{label}</span>
      <span className="hero-stat-value">{value}</span>
    </div>
  );
}
