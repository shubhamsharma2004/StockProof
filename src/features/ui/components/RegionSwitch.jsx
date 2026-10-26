import { useDispatch, useSelector } from "react-redux";
import { MARKETS } from "../../../shared/config/markets.js";
import { regionChanged, selectRegion } from "../model/uiSlice.js";

// The app-wide India ⇄ US switch in the top bar. Every market-aware page
// (dashboard, research, watchlist, portfolio, IPOs, screener, market
// overview) follows it.
export default function RegionSwitch() {
  const dispatch = useDispatch();
  const region = useSelector(selectRegion);

  return (
    <div className="region-switch" role="radiogroup" aria-label="Market">
      {Object.values(MARKETS).map((m) => (
        <button
          key={m.key}
          type="button"
          role="radio"
          aria-checked={region === m.key}
          className={`region-switch-option ${region === m.key ? "is-active" : ""}`}
          onClick={() => dispatch(regionChanged(m.key))}
        >
          <span aria-hidden="true">{m.flag}</span>
          <span className="region-switch-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
