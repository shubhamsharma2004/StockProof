import { useMemo, useRef, useState } from "react";
import { formatCurrency } from "../../utils.js";

const RANGES = [
  { key: "1d", label: "1D" },
  { key: "5d", label: "5D" },
  { key: "1mo", label: "1M" },
  { key: "6mo", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "5y", label: "5Y" },
  { key: "max", label: "Max" },
];

const WIDTH = 640;
const HEIGHT = 220;
const PAD_X = 8;
const PAD_Y = 14;

export default function PriceChart({ stockData }) {
  const { chart, changeChartRange } = stockData;
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const geometry = useMemo(() => {
    if (!chart.points || chart.points.length < 2) return null;
    const closes = chart.points.map((p) => p.c);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const innerW = WIDTH - PAD_X * 2;
    const innerH = HEIGHT - PAD_Y * 2;
    const coords = chart.points.map((p, i) => {
      const x = PAD_X + (i / (chart.points.length - 1)) * innerW;
      const y = PAD_Y + innerH - ((p.c - min) / range) * innerH;
      return { x, y, ...p };
    });
    return { coords, min, max };
  }, [chart.points]);

  const rising = geometry ? geometry.coords[geometry.coords.length - 1].c >= geometry.coords[0].c : true;
  const tone = rising ? "positive" : "negative";

  const handleMove = (e) => {
    if (!geometry || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    geometry.coords.forEach((c, i) => {
      const d = Math.abs(c.x - relX);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = geometry && hoverIndex != null ? geometry.coords[hoverIndex] : null;
  const linePath = geometry ? "M" + geometry.coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" L") : "";
  const areaPath = geometry
    ? `${linePath} L${geometry.coords[geometry.coords.length - 1].x.toFixed(1)},${HEIGHT - PAD_Y} L${geometry.coords[0].x.toFixed(1)},${HEIGHT - PAD_Y} Z`
    : "";

  return (
    <section className="panel-card price-chart-card">
      <div className="panel-card-head">
        <h2 className="panel-title">Price Chart</h2>
        <div className="range-picker">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`range-btn ${chart.range === r.key ? "is-active" : ""}`}
              onClick={() => changeChartRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {chart.loading ? (
        <div className="chart-placeholder">
          <div className="skeleton skeleton-chart" />
        </div>
      ) : !geometry ? (
        <div className="chart-placeholder">
          <p>{chart.error ? "Price chart unavailable right now." : "Not enough price history for this range."}</p>
        </div>
      ) : (
        <div className="chart-wrap">
          <svg
            ref={svgRef}
            className={`price-chart price-chart--${tone}`}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="price-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#price-chart-fill)" stroke="none" />
            <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {hovered ? (
              <g>
                <line x1={hovered.x} x2={hovered.x} y1={PAD_Y} y2={HEIGHT - PAD_Y} className="chart-hover-line" />
                <circle cx={hovered.x} cy={hovered.y} r="4" fill="currentColor" />
              </g>
            ) : null}
          </svg>
          {hovered ? (
            <div
              className="chart-tooltip"
              style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
            >
              <strong>{formatCurrency(hovered.c)}</strong>
              <span>{new Date(hovered.t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
