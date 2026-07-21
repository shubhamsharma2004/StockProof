import { useState } from "react";
import { MANUAL_FIELD_DEFS } from "../../api.js";

// Keeps its own raw string state per field rather than deriving the input
// value from the normalized fetchedData on every keystroke — normalizing
// round-trips through Number(), which would mangle in-progress input like a
// trailing "12." back to "12" before the user finishes typing "12.5".
export default function ManualEntryForm({ stockData }) {
  const [raw, setRaw] = useState(() => {
    const initial = {};
    MANUAL_FIELD_DEFS.forEach((f) => {
      initial[f.key] = stockData.fetchedData[f.key] ?? "";
    });
    return initial;
  });

  const handleChange = (key, value) => {
    const next = { ...raw, [key]: value };
    setRaw(next);
    stockData.setManualField(next);
  };

  return (
    <section className="manual-entry-card">
      <p className="manual-entry-notice">
        Live data unavailable — enter figures manually below. Everything is optional; leave blank
        what you don't know.
      </p>
      <div className="manual-grid">
        {MANUAL_FIELD_DEFS.map((f) => (
          <div className="manual-field" key={f.key}>
            <label htmlFor={`manual-${f.key}`}>{f.label}</label>
            <input
              id={`manual-${f.key}`}
              type={f.key === "sector" || f.key === "industry" ? "text" : "number"}
              step="any"
              inputMode={f.key === "sector" || f.key === "industry" ? "text" : "decimal"}
              value={raw[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
