import { useGetChartQuery } from "../../market-data/index.js";
import { buildSymbol } from "../../../shared/lib/symbols.js";
import { moneyFor } from "../../../shared/lib/money.js";
import ChangeText from "../../../shared/ui/ChangeText.jsx";
import CompanyLogo from "../../../shared/ui/CompanyLogo.jsx";
import Sparkline from "../../../shared/ui/Sparkline.jsx";

// One tile in the dashboard's movers strip: identity + 1-week sparkline on
// top, price and day change below.
export default function MoverCard({ mover, currency, active, onSelect }) {
  const { data: points } = useGetChartQuery({ symbol: buildSymbol(mover.symbol, mover.exchange), range: "5d" });
  const money = moneyFor(currency);
  const closes = (points || []).map((p) => p.c);

  return (
    <button type="button" className={`mover-card ${active ? "is-active" : ""}`} onClick={() => onSelect(mover)}>
      <div className="mover-card-top">
        <CompanyLogo symbol={mover.symbol} size={36} className="company-logo--round" />
        <span className="mover-card-name" title={mover.name}>
          {mover.symbol}
        </span>
        <span className="mover-card-spark">
          {closes.length >= 2 ? <Sparkline values={closes} width={84} height={34} tone="auto" filled /> : null}
        </span>
      </div>
      <dl className="mover-card-stats">
        <div>
          <dt>Price</dt>
          <dd>{mover.last_price != null ? money.price(mover.last_price) : "—"}</dd>
        </div>
        <div>
          <dt>Day change</dt>
          <dd>
            <ChangeText value={mover.percent_change} />
          </dd>
        </div>
      </dl>
    </button>
  );
}
