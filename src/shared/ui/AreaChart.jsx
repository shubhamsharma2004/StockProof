import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatNumber } from "../lib/format.js";

const PAD = { top: 16, right: 12, bottom: 34, left: 56 };

// Round axis values (…, 100, 150, 200, …) that bracket the data.
function niceTicks(min, max, count = 6) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const rawStep = (max - min) / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10) * magnitude;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return { ticks, step };
}

// Responsive line+area chart with gridlines, axes, and a hover crosshair.
// It measures its own width instead of stretching a fixed viewBox, so text
// and stroke widths never distort. `points` is [{ t: epochMs, c: close }].
export default function AreaChart({ points, height = 300, formatValue, formatTick, formatTooltipTime, ariaLabel }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const gradientId = useId();

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    if (!width || !points || points.length < 2) return null;
    const closes = points.map((p) => p.c);
    const { ticks, step } = niceTicks(Math.min(...closes), Math.max(...closes));
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const innerW = Math.max(1, width - PAD.left - PAD.right);
    const innerH = height - PAD.top - PAD.bottom;
    const xAt = (i) => PAD.left + (i / (points.length - 1)) * innerW;
    const yAt = (v) => PAD.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;

    const coords = points.map((p, i) => ({ x: xAt(i), y: yAt(p.c), t: p.t, c: p.c }));
    const line = "M" + coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" L");
    const baseline = PAD.top + innerH;
    const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${baseline} L${coords[0].x.toFixed(1)},${baseline} Z`;

    // Never more ticks than points — a 4-point series would otherwise round
    // several ticks onto the same index.
    const xTickCount = Math.max(2, Math.min(8, points.length, Math.floor(innerW / 96)));
    const tickIndices = [
      ...new Set(Array.from({ length: xTickCount }, (_, k) => Math.round((k / (xTickCount - 1)) * (points.length - 1)))),
    ];
    const xTicks = tickIndices.map((i) => ({ i, x: xAt(i), t: points[i].t }));
    const axisDigits = step < 1 ? 2 : 0;

    return {
      coords,
      line,
      area,
      baseline,
      innerW,
      yTicks: ticks.map((v) => ({ v, y: yAt(v), label: formatNumber(v, axisDigits) })),
      xTicks,
    };
  }, [points, width, height]);

  const handlePointer = (e) => {
    if (!geometry) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - PAD.left;
    const ratio = Math.min(1, Math.max(0, relX / geometry.innerW));
    setHoverIndex(Math.round(ratio * (geometry.coords.length - 1)));
  };

  const hovered = geometry && hoverIndex != null ? geometry.coords[hoverIndex] : null;
  const tooltipOnLeft = hovered && hovered.x > width / 2;

  return (
    <div className="area-chart" ref={wrapRef} style={{ height }}>
      {geometry ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <g className="area-chart-grid">
            {geometry.yTicks.map((tick) => (
              <line key={`y${tick.v}`} x1={PAD.left} x2={width - PAD.right} y1={tick.y} y2={tick.y} />
            ))}
            {geometry.xTicks.map((tick) => (
              <line key={`x${tick.i}`} x1={tick.x} x2={tick.x} y1={PAD.top} y2={geometry.baseline} />
            ))}
          </g>

          <g className="area-chart-axis">
            {geometry.yTicks.map((tick) => (
              <text key={`yl${tick.v}`} x={PAD.left - 12} y={tick.y} textAnchor="end" dominantBaseline="middle">
                {tick.label}
              </text>
            ))}
            {geometry.xTicks.map((tick, k) => (
              <text
                key={`xl${tick.i}`}
                x={tick.x}
                y={geometry.baseline + 22}
                textAnchor={k === 0 ? "start" : k === geometry.xTicks.length - 1 ? "end" : "middle"}
              >
                {formatTick ? formatTick(tick.t) : ""}
              </text>
            ))}
          </g>

          <path d={geometry.area} fill={`url(#${gradientId})`} stroke="none" />
          <path className="area-chart-line" d={geometry.line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {hovered ? (
            <g className="area-chart-hover">
              <line x1={hovered.x} x2={hovered.x} y1={PAD.top} y2={geometry.baseline} />
              <circle cx={hovered.x} cy={hovered.y} r="5" />
            </g>
          ) : null}
        </svg>
      ) : null}

      {hovered ? (
        <div
          className={`area-chart-tooltip ${tooltipOnLeft ? "is-left" : ""}`}
          style={{ left: hovered.x, top: hovered.y }}
        >
          <span>{formatTooltipTime ? formatTooltipTime(hovered.t) : ""}</span>
          <strong>{formatValue ? formatValue(hovered.c) : hovered.c}</strong>
        </div>
      ) : null}
    </div>
  );
}
