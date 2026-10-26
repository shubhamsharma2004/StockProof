import { formatNumber } from "../../../shared/lib/format.js";
import { useGetIpoGmpQuery } from "../api/ipoApi.js";
import { impliedGainPercent } from "../lib/ipoFormat.js";

// Latest grey-market premium for a pre-listing IPO, with the listing gain
// it implies. Renders nothing when there's no GMP data (or no key).
export default function GmpBadge({ symbol, priceRange }) {
  const { data } = useGetIpoGmpQuery(symbol, { skip: !symbol });
  if (!data?.available) return null;

  const gain = impliedGainPercent(data.latest, priceRange);
  const tone = data.latest > 0 ? "positive" : data.latest < 0 ? "negative" : "muted";
  return (
    <span className={`gmp-badge gmp-badge--${tone}`} title="Grey market premium — an unofficial, unregulated indicator">
      GMP ₹{formatNumber(data.latest)}
      {gain != null ? ` · ${gain >= 0 ? "+" : ""}${formatNumber(gain, 1)}%` : ""}
    </span>
  );
}
