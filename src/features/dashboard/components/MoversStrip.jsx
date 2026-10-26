import { useRef } from "react";
import { useSelector } from "react-redux";
import { selectMarket } from "../../ui/index.js";
import { useGetScreenerQuery } from "../../screener/index.js";
import { IconChevronRight } from "../../../shared/ui/icons.jsx";
import MoverCard from "./MoverCard.jsx";

const PER_SIDE = 4;

// Interleaves the day's top gainers and losers so the strip shows both
// directions of the market, not just one.
function pickMovers(data) {
  const gainers = data?.gainers?.slice(0, PER_SIDE) || [];
  const losers = data?.losers?.slice(0, PER_SIDE) || [];
  const out = [];
  for (let i = 0; i < PER_SIDE; i++) {
    if (gainers[i]) out.push(gainers[i]);
    if (losers[i]) out.push(losers[i]);
  }
  return out;
}

export default function MoversStrip({ activeSymbol, onSelect }) {
  const market = useSelector(selectMarket);
  const { currentData: data, isFetching, isError } = useGetScreenerQuery(market.key);
  const isLoading = isFetching && !data;
  const scrollerRef = useRef(null);
  const movers = pickMovers(data);

  const scrollNext = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="dash-card movers-strip" aria-label="Today's movers">
      {isLoading ? (
        <div className="movers-scroller">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="mover-card mover-card--skeleton" key={i}>
              <div className="skeleton skeleton-line" style={{ width: "60%" }} />
              <div className="skeleton skeleton-line" style={{ width: "90%" }} />
              <div className="skeleton skeleton-line" style={{ width: "80%" }} />
            </div>
          ))}
        </div>
      ) : isError || movers.length === 0 ? (
        <p className="movers-empty">Live market movers are unavailable right now. Try again shortly.</p>
      ) : (
        <>
          <div className="movers-scroller" ref={scrollerRef}>
            {movers.map((m) => (
              <MoverCard key={m.symbol} mover={{ ...m, exchange: market.defaultExchange }} currency={market.currency} active={activeSymbol === m.symbol} onSelect={onSelect} />
            ))}
          </div>
          <button type="button" className="movers-next" onClick={scrollNext} aria-label="Show more movers">
            <IconChevronRight width={18} height={18} />
          </button>
        </>
      )}
    </section>
  );
}
