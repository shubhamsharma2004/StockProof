import { formatNumber } from "../lib/format.js";
import { IconArrowDownSmall, IconArrowUpSmall } from "./icons.jsx";

// "+0,85 ↑" / "-1,10% ↓" in green/red. `variant="badge"` renders the filled
// pill used next to the dashboard chart's price.
export default function ChangeText({ value, suffix = "%", variant = "text", showArrow = true }) {
  if (value == null || Number.isNaN(value)) return <span className="change-text is-muted">—</span>;
  const up = value >= 0;
  const Arrow = up ? IconArrowUpSmall : IconArrowDownSmall;
  return (
    <span className={`change-${variant} ${up ? "is-positive" : "is-negative"}`}>
      {up ? "+" : "−"}
      {formatNumber(Math.abs(value))}
      {suffix}
      {showArrow ? <Arrow width={variant === "badge" ? 11 : 14} height={variant === "badge" ? 11 : 14} /> : null}
    </span>
  );
}
