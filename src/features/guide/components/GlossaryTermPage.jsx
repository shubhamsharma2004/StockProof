import { useEffect } from "react";
import { PAGES, pathForPage, termMeta, termPath, usePageMeta } from "../../ui/index.js";
import Link from "../../../shared/ui/Link.jsx";
import { GLOSSARY } from "../lib/guideContent.js";
import { GuideDisclaimer, SectionHead } from "./GuideParts.jsx";

// One glossary term on its own URL (/guide/what-is-pe-ratio) — the page a
// search for "what is P/E ratio" lands on.
export default function GlossaryTermPage({ term }) {
  usePageMeta(PAGES.GUIDE, { ...termMeta(term), path: termPath(term.term) });
  const related = GLOSSARY.filter((t) => t.category === term.category && t !== term);
  const isIpoTerm = term.category === "IPOs";

  // Moving between terms stays on the Guide page, so the shell doesn't scroll.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [term]);

  return (
    <div className="page-shell guide-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to={pathForPage(PAGES.GUIDE)}>Guide</Link>
        <span className="breadcrumb-sep">/</span>
        <span>Glossary</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{term.term}</span>
      </nav>

      <article className="guide-block glossary-article">
        <span className="guide-eyebrow">{term.category}</span>
        <h1>What is {term.term}?</h1>
        {term.full ? (
          <p className="glossary-article-full">
            {term.term} stands for <strong>{term.full}</strong>.
          </p>
        ) : null}
        <p className="glossary-article-definition">{term.definition}</p>

        <div className="glossary-article-cta">
          <p>
            {isIpoTerm
              ? "See it live for every NSE mainboard and SME IPO — price band, lot size, subscription and GMP in one place."
              : `See ${term.term} for any NSE, BSE or US stock — Stockproof pulls it from live data and folds it into the stock's scores.`}
          </p>
          <Link className="btn btn-primary btn-sm" to={pathForPage(isIpoTerm ? PAGES.IPO : PAGES.RESEARCH)}>
            {isIpoTerm ? "Browse IPOs" : "Research a stock"}
          </Link>
        </div>
      </article>

      {related.length ? (
        <section className="guide-block">
          <SectionHead eyebrow="Keep learning" title={`More ${term.category.toLowerCase()} terms`} />
          <ul className="glossary-related">
            {related.map((t) => (
              <li key={t.term}>
                <Link to={termPath(t.term)}>What is {t.term}?</Link>
              </li>
            ))}
          </ul>
          <p className="glossary-related-all">
            <Link to={pathForPage(PAGES.GUIDE)}>See the full guide and glossary</Link>
          </p>
        </section>
      ) : null}

      <GuideDisclaimer />
    </div>
  );
}
