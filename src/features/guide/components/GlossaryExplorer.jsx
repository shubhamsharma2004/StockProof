import { useState } from "react";
import { termPath } from "../../ui/index.js";
import { IconSearch } from "../../../shared/ui/icons.jsx";
import Link from "../../../shared/ui/Link.jsx";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "../lib/guideContent.js";

const ALL = "All";

export default function GlossaryExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const q = query.trim().toLowerCase();
  const terms = GLOSSARY.filter(
    (t) =>
      (category === ALL || t.category === category) &&
      (!q || `${t.term} ${t.full || ""} ${t.definition}`.toLowerCase().includes(q))
  );

  return (
    <>
      <div className="glossary-toolbar">
        <label className="search-box glossary-search">
          <IconSearch className="search-box-icon" />
          <span className="visually-hidden">Search the glossary</span>
          <input type="search" placeholder="Search a term, e.g. P/E or GMP" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="glossary-filters" role="group" aria-label="Glossary category">
          {[ALL, ...GLOSSARY_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              className={`range-pill ${category === c ? "is-active" : ""}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {terms.length === 0 ? (
        <p className="glossary-empty">No terms match "{query}". Try a different word, or clear the category filter.</p>
      ) : (
        <dl className="glossary-grid">
          {terms.map((t) => (
            <div className="glossary-card" key={t.term}>
              <dt>
                <Link className="glossary-term" to={termPath(t.term)}>
                  {t.term}
                </Link>
                {t.full ? <span className="glossary-full">{t.full}</span> : null}
              </dt>
              <dd>{t.definition}</dd>
              <span className="glossary-category">{t.category}</span>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}
