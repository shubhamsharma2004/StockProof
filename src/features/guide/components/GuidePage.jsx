import { markUrl } from "../../../shared/ui/BrandLogo.jsx";
import {
  IconBook,
  IconGrowth,
  IconHealth,
  IconLayers,
  IconSearch,
  IconShield,
  IconSparkle,
  IconStarFull,
  IconValuation,
  IconWarning,
} from "../../../shared/ui/icons.jsx";
import { GLOSSARY, RATING_RULES, SCORES, SOURCES, STEPS } from "../lib/guideContent.js";
import GlossaryExplorer from "./GlossaryExplorer.jsx";

const SECTIONS = [
  { id: "guide-how", label: "How it works" },
  { id: "guide-scores", label: "The scores" },
  { id: "guide-glossary", label: "Glossary" },
  { id: "guide-sources", label: "Data sources" },
];

const SCORE_ICONS = { health: IconHealth, valuation: IconValuation, growth: IconGrowth, risk: IconShield };
const STEP_ICONS = [IconSearch, IconLayers, IconBook, IconStarFull];

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <header className="guide-head">
      <span className="guide-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}

export default function GuidePage() {
  return (
    <div className="page-shell guide-page">
      <section className="guide-hero">
        <img className="guide-hero-mark" src={markUrl} alt="" aria-hidden="true" />
        <span className="guide-hero-kicker">Stockproof Guide</span>
        <h1>Understand every number before you invest</h1>
        <p>
          What the figures mean, how the four scores and the overall rating are calculated, and where every piece of data
          comes from. Plain English, no jargon left unexplained.
        </p>
        <nav className="guide-jump" aria-label="Guide sections">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
        <dl className="guide-hero-facts">
          <div>
            <dt>4</dt>
            <dd>automated scores</dd>
          </div>
          <div>
            <dt>{GLOSSARY.length}</dt>
            <dd>terms explained</dd>
          </div>
          <div>
            <dt>{SOURCES.length}</dt>
            <dd>live data sources</dd>
          </div>
        </dl>
      </section>

      <section id="guide-how" className="guide-block">
        <SectionHead eyebrow="Step by step" title="How Stockproof works" />
        <ol className="guide-steps">
          {STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li key={step.title} className="guide-step">
                <span className="guide-step-top">
                  <span className="guide-step-num">{i + 1}</span>
                  <Icon width={20} height={20} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="guide-scores" className="guide-block">
        <SectionHead
          eyebrow="Automated analysis"
          title="The four scores"
          subtitle="Each score is 0–100 and built only from real figures — no AI guesswork. The bars show how much each input can contribute."
        />
        <div className="guide-score-grid">
          {SCORES.map((score) => {
            const Icon = SCORE_ICONS[score.key];
            return (
              <article key={score.key} className={`guide-score guide-score--${score.key}`}>
                <header>
                  <span className="guide-score-icon">
                    <Icon width={20} height={20} />
                  </span>
                  <div>
                    <h3>{score.name}</h3>
                    <p>{score.question}</p>
                  </div>
                </header>
                <ul className="guide-weights">
                  {score.inputs.map((input) => (
                    <li key={input.label}>
                      <span className="guide-weight-label">{input.label}</span>
                      <span className="guide-weight-track" aria-hidden="true">
                        <span style={{ width: `${input.weight}%` }} />
                      </span>
                      <span className="guide-weight-value">{input.weight}</span>
                    </li>
                  ))}
                </ul>
                <div className="guide-scale" aria-label="Score labels, best to worst">
                  {score.scale.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="guide-rating">
          <div className="guide-rating-intro">
            <span className="guide-rating-stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <IconStarFull key={i} width={18} height={18} />
              ))}
            </span>
            <h3>How the overall rating works</h3>
            <p>The four scores roll up into the star rating and Bullish / Neutral / Bearish badge on every stock.</p>
          </div>
          <dl className="guide-rating-rules">
            {RATING_RULES.map((rule) => (
              <div key={rule.title}>
                <dt>{rule.title}</dt>
                <dd>{rule.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="guide-glossary" className="guide-block">
        <SectionHead eyebrow="Glossary" title="Terms, explained simply" subtitle="Search or filter by topic." />
        <GlossaryExplorer />
      </section>

      <section id="guide-sources" className="guide-block">
        <SectionHead
          eyebrow="Transparency"
          title="Where the data comes from"
          subtitle="Live feeds can be delayed, incomplete or occasionally wrong. Anything a source can't provide is shown as unavailable — never estimated."
        />
        <div className="guide-sources">
          {SOURCES.map((source) => (
            <div key={source.name} className="guide-source">
              <h3>
                {source.name === "FinBERT (in-browser AI)" ? <IconSparkle width={16} height={16} /> : null}
                {source.name}
              </h3>
              <div className="guide-source-uses">
                {source.uses.map((u) => (
                  <span key={u}>{u}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
}
