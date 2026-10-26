import { IconWarning } from "../../../shared/ui/icons.jsx";

// Pieces shared by the full guide and the per-term glossary pages.

export function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <header className="guide-head">
      <span className="guide-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}

export function GuideDisclaimer() {
  return (
    <aside className="guide-disclaimer">
      <IconWarning width={22} height={22} />
      <div>
        <strong>A research tool, not investment advice</strong>
        <p>
          Scores, ratings, sentiment and GMP are automated readings of public data to help you research — not
          recommendations to buy, hold or sell. Always verify important figures with NSE, BSE, the SEC or your broker
          before acting.
        </p>
      </div>
    </aside>
  );
}
