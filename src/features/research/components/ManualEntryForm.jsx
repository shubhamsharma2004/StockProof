import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MANUAL_FIELD_DEFS, TEXT_FIELDS, displayManualValue, manualFieldLabel } from "../lib/manualFields.js";
import { MARKETS } from "../../../shared/config/markets.js";
import { manualFieldsChanged } from "../model/researchSlice.js";
import { selectFetchedData, selectSecurityMarket } from "../model/selectors.js";

// Keeps its own raw string state per field rather than deriving the input
// value from the normalized fetchedData on every keystroke — normalizing
// round-trips through Number(), which would mangle in-progress input like a
// trailing "12." back to "12" before the user finishes typing "12.5".
export default function ManualEntryForm() {
  const dispatch = useDispatch();
  const fetchedData = useSelector(selectFetchedData);
  const currency = MARKETS[useSelector(selectSecurityMarket)].currency;
  const [raw, setRaw] = useState(() => {
    const initial = {};
    MANUAL_FIELD_DEFS.forEach((f) => {
      initial[f.key] = displayManualValue(f.key, fetchedData[f.key], currency);
    });
    return initial;
  });

  const handleChange = (key, value) => {
    const next = { ...raw, [key]: value };
    setRaw(next);
    dispatch(manualFieldsChanged({ values: next, currency }));
  };

  return (
    <section className="manual-entry-card">
      <p className="manual-entry-notice">
        Live data unavailable — enter figures manually below. Everything is optional; leave blank
        what you don't know.
      </p>
      <div className="manual-grid">
        {MANUAL_FIELD_DEFS.map((f) => {
          const isText = TEXT_FIELDS.has(f.key);
          return (
            <div className="manual-field" key={f.key}>
              <label htmlFor={`manual-${f.key}`}>{manualFieldLabel(f, currency)}</label>
              <input
                id={`manual-${f.key}`}
                type={isText ? "text" : "number"}
                step="any"
                inputMode={isText ? "text" : "decimal"}
                value={raw[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
