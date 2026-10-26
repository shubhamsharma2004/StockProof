import { useDispatch, useSelector } from "react-redux";
import { marketCapTier } from "../lib/insights.js";
import { selectionCleared } from "../model/researchSlice.js";
import { selectMoney, selectOverall, selectResearch, selectStrengthsAndWatch } from "../model/selectors.js";
import { formatNumber } from "../../../shared/lib/format.js";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import StarRating from "../../../shared/ui/StarRating.jsx";
import { IconTrendUp, IconTrendDown, IconCheckCircle, IconWarning, IconClose } from "../../../shared/ui/icons.jsx";
import { WatchlistButton } from "../../watchlist/index.js";

export default function Hero() {
  const dispatch = useDispatch();
  const { selected, dataSource, fetchedData } = useSelector(selectResearch);
  const overall = useSelector(selectOverall);
  const { strengths, watch } = useSelector(selectStrengthsAndWatch);
  const money = useSelector(selectMoney);
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

  const tier = marketCapTier(fd.market_cap, fd.currency);
  const absChange = fd.last_price != null && fd.prev_close != null ? fd.last_price - fd.prev_close : null;
  const isUp = (fd.percent_change ?? absChange ?? 0) >= 0;

  return (
    <section className="hero-card">
      <div className="hero-corner-actions">
        <WatchlistButton security={selected} />
        <button type="button" className="hero-clear-btn" onClick={() => dispatch(selectionCleared())} aria-label="Clear selection">
          <IconClose width={16} height={16} />
        </button>
      </div>

      <div className="hero-top">
        <CompanyLogo symbol={selected.symbol} website={fd.website} size={60} className="company-logo--lg" />
        <div className="hero-identity">
          <h1 className="hero-name">{selected.name}</h1>
          <p className="hero-symbol">
            {selected.symbol} <span className="dot">•</span> {selected.exchange === "US" ? "NYSE / Nasdaq" : selected.exchange}
          </p>
          <div className="hero-tags">
            {tier ? <span className="tag">{tier}</span> : null}
            {fd.sector ? <span className="tag">{fd.sector}</span> : null}
          </div>
        </div>

        {fd.last_price != null ? (
          <div className="hero-price-block">
            <span className="hero-price">{money.price(fd.last_price)}</span>
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
        {fd.market_cap != null && <HeroStat label="Market Cap" value={money.amountCr(fd.market_cap)} />}
        {fd.sector && <HeroStat label="Sector" value={fd.sector} />}
        {fd.industry && <HeroStat label="Industry" value={fd.industry} />}
        {fd.year_high != null && <HeroStat label="52W High" value={money.price(fd.year_high)} />}
        {fd.year_low != null && <HeroStat label="52W Low" value={money.price(fd.year_low)} />}
        {fd.dividend_yield != null && <HeroStat label="Dividend Yield" value={`${formatNumber(fd.dividend_yield)}%`} />}
      </div>

      {(strengths.length > 0 || watch.length > 0) && (
        <div className="hero-chip-rows">
          {strengths.length > 0 && (
            <div className="hero-chip-row">
              <span className="hero-chip-row-label">Strengths</span>
              <div className="chip-group">
                {strengths.map((s) => (
                  <span className="chip chip--positive" key={s.label} title={s.proof}>
                    <IconCheckCircle width={14} height={14} /> {s.label}
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
                  <span className="chip chip--warning" key={s.label} title={s.proof}>
                    <IconWarning width={14} height={14} /> {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Only when the figures aren't live — typed in, or a saved snapshot. */}
      {dataSource === "manual" ? <p className="hero-footnote">Figures entered manually or from a saved evaluation — not live data.</p> : null}
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
