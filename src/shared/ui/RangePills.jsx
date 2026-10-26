// Pill-shaped segmented picker (the "1 Day · 1 Week · …" row on charts).
// `options` is [{ key, label }].
export default function RangePills({ options, value, onChange, label = "Chart range" }) {
  return (
    <div className="range-pills" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`range-pill ${value === o.key ? "is-active" : ""}`}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
