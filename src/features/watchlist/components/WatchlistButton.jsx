import { useDispatch, useSelector } from "react-redux";
import { IconStarEmpty, IconStarFull } from "../../../shared/ui/icons.jsx";
import { selectIsWatchlisted, toggleWatchlist } from "../model/watchlistSlice.js";

export default function WatchlistButton({ security }) {
  const dispatch = useDispatch();
  const active = useSelector((state) => selectIsWatchlisted(state, security.symbol));

  return (
    <button
      type="button"
      className={`hero-watchlist-btn ${active ? "is-active" : ""}`}
      onClick={() => dispatch(toggleWatchlist(security))}
      aria-pressed={active}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
    >
      {active ? <IconStarFull width={16} height={16} /> : <IconStarEmpty width={16} height={16} />}
      {active ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
