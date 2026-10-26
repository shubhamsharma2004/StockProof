import { useDispatch } from "react-redux";
import { navigateTo, PAGES } from "../features/ui/index.js";
import BrandLogo from "../shared/ui/BrandLogo.jsx";
import { IconArrowUpSmall, IconFeedback } from "../shared/ui/icons.jsx";
import { FEEDBACK_URL } from "./navConfig.js";
import "./footer.css";

// Links navigate inside the app (gated pages open the sign-in popup, same as
// the sidebar). `anchor` jumps to a section of the target page.
const COLUMNS = [
  {
    title: "Research",
    links: [
      { label: "Dashboard", page: PAGES.DASHBOARD },
      { label: "Stock Research", page: PAGES.RESEARCH },
      { label: "Watchlist", page: PAGES.WATCHLIST },
      { label: "Portfolio", page: PAGES.PORTFOLIO },
    ],
  },
  {
    title: "Markets",
    links: [
      { label: "IPO Analysis", page: PAGES.IPO },
      { label: "Screener", page: PAGES.SCREENER },
      { label: "Market Overview", page: PAGES.MARKETS },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Guide", page: PAGES.GUIDE },
      { label: "How scores work", page: PAGES.GUIDE, anchor: "guide-scores" },
      { label: "Glossary", page: PAGES.GUIDE, anchor: "guide-glossary" },
      { label: "Data sources", page: PAGES.GUIDE, anchor: "guide-sources" },
    ],
  },
];

// One footer, reused on every page of the shell instead of each screen
// rolling its own.
export default function SiteFooter() {
  const dispatch = useDispatch();

  const go = ({ page, anchor }) => {
    dispatch(navigateTo(page));
    // The shell scrolls to the top on page change; jump to the section after that.
    if (anchor) setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" aria-hidden="true" />
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <BrandLogo size={34} />
            <p>Research Indian and US stocks with live data, a structured checklist and AI headline sentiment — before you invest.</p>
            <div className="site-footer-markets" aria-label="Markets covered">
              <span>🇮🇳 NSE · BSE</span>
              <span>🇺🇸 NYSE · Nasdaq</span>
            </div>
            <a className="site-footer-feedback" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
              <IconFeedback width={16} height={16} /> Share feedback
            </a>
          </div>

          <div className="site-footer-links">
            {COLUMNS.map((col) => (
              <nav key={col.title} className="site-footer-col" aria-label={col.title}>
                <h2>{col.title}</h2>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button type="button" onClick={() => go(link)}>
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Stockproof. All rights reserved.</p>
          <button type="button" className="site-footer-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top <IconArrowUpSmall width={14} height={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
