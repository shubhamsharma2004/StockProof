import { useState } from "react";
import {
  IconResearch,
  IconWatchlist,
  IconPortfolio,
  IconScreener,
  IconMarket,
  IconNews,
  IconFeedback,
  IconBell,
} from "../icons.jsx";
import { showToast } from "../../utils.js";
import { useWatchlist } from "../../hooks/useWatchlist.js";
import StockSearchBox from "../StockSearchBox.jsx";
import SiteFooter from "../SiteFooter.jsx";
import AuthModal from "../auth/AuthModal.jsx";
import ResearchWorkspace from "../research/ResearchWorkspace.jsx";
import WatchlistView from "../watchlist/WatchlistView.jsx";
import PortfolioView from "../portfolio/PortfolioView.jsx";
import ScreenerView from "../screener/ScreenerView.jsx";
import MarketView from "../market/MarketView.jsx";
import NewsInsightsView from "../news/NewsInsightsView.jsx";

const NAV_ITEMS = [
  { key: "research", label: "Stock Research", Icon: IconResearch },
  { key: "watchlist", label: "Watchlist", Icon: IconWatchlist },
  { key: "portfolio", label: "Portfolio", Icon: IconPortfolio },
  { key: "screener", label: "Screener", Icon: IconScreener },
  { key: "market", label: "Market", Icon: IconMarket },
  { key: "news", label: "News & Insights", Icon: IconNews },
];

const LIVE_PAGES = new Set(["research", "watchlist", "portfolio", "screener", "market", "news"]);

function stub(label) {
  showToast(`${label} is coming soon.`, "info");
}

// Shell only ever mounts once App.jsx has confirmed isAuthed (signed in or
// guest) — every page here is reachable without further gating.
export default function Shell({ auth, stockData, theme, onToggleTheme, onOpenGuide }) {
  const [railOpen, setRailOpen] = useState(false);
  const [page, setPage] = useState("research");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const watchlist = useWatchlist({ user: auth.user, isGuest: auth.isGuest });

  const openInResearch = (item) => {
    stockData.selectSecurity(item);
    setPage("research");
  };

  const renderPage = () => {
    if (page === "research") return <ResearchWorkspace auth={auth} stockData={stockData} watchlist={watchlist} />;
    if (page === "watchlist") return <WatchlistView watchlist={watchlist} onOpen={openInResearch} />;
    if (page === "portfolio") return <PortfolioView stockData={stockData} />;
    if (page === "screener") return <ScreenerView onOpen={openInResearch} />;
    if (page === "market") return <MarketView />;
    if (page === "news") return <NewsInsightsView />;
    return null;
  };

  return (
    <div className="app-shell">
      <NavRail railOpen={railOpen} onClose={() => setRailOpen(false)} page={page} onNavigate={setPage} />
      <div className="shell-main">
        <Topbar
          auth={auth}
          stockData={stockData}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenGuide={onOpenGuide}
          onOpenRail={() => setRailOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
        <div className="shell-content">{renderPage()}</div>
        <SiteFooter />
      </div>
      {railOpen ? <div className="rail-scrim" onClick={() => setRailOpen(false)} /> : null}
      {authModalOpen ? <AuthModal auth={auth} onClose={() => setAuthModalOpen(false)} /> : null}
    </div>
  );
}

function NavRail({ railOpen, onClose, page, onNavigate }) {
  return (
    <nav className={`nav-rail ${railOpen ? "is-open" : ""}`} aria-label="Primary">
      <a href="/" className="nav-rail-brand" aria-label="Stockproof home">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>Stockproof</span>
      </a>

      <ul className="nav-rail-list">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = page === key;
          return (
            <li key={key}>
              <button
                type="button"
                className={`nav-rail-item ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  onClose();
                  if (LIVE_PAGES.has(key)) onNavigate(key);
                  else stub(label);
                }}
              >
                <Icon className="nav-icon" />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="nav-rail-footer">
        <button
          type="button"
          className="nav-rail-item nav-rail-item--ghost"
          onClick={() => window.open("https://forms.gle/z3rsKYyhjF4g4Dge7", "_blank", "noopener,noreferrer")}
        >
          <IconFeedback className="nav-icon" />
          <span>Feedback</span>
        </button>
      </div>
    </nav>
  );
}

function Topbar({ auth, stockData, theme, onToggleTheme, onOpenGuide, onOpenRail, onOpenAuthModal }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-btn rail-toggle-btn" aria-label="Open menu" onClick={onOpenRail}>
        <svg viewBox="0 0 24 24" className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <StockSearchBox
        onSelect={stockData.selectSecurity}
        onManualEntry={stockData.enterManualEntry}
        id="topbar-search-input"
        showKbdHint
      />

      <div className="topbar-actions">
        <button type="button" className="link-btn topbar-guide-link" onClick={onOpenGuide}>
          Guide
        </button>
        <button type="button" className="icon-btn" aria-label="Notifications" onClick={() => stub("Notifications")}>
          <IconBell className="nav-icon" />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={theme === "dark"}
          onClick={onToggleTheme}
        >
          <span aria-hidden="true" className="theme-icon">{theme === "dark" ? "◑" : "◐"}</span>
        </button>
        <AuthMenu auth={auth} onOpenAuthModal={onOpenAuthModal} />
      </div>
    </header>
  );
}

function AuthMenu({ auth, onOpenAuthModal }) {
  const [open, setOpen] = useState(false);
  const label = auth.user ? auth.user.email : "Guest";
  const initial = (auth.user?.email || "G").trim().charAt(0).toUpperCase();

  return (
    <div className="auth-menu">
      <button type="button" className="avatar-btn" onClick={() => setOpen((o) => !o)} aria-label="Account menu">
        <span className="avatar-circle">{initial}</span>
      </button>
      {open ? (
        <div className="auth-menu-panel" onMouseLeave={() => setOpen(false)}>
          <p className="auth-menu-label" title={label}>{label}</p>
          {auth.isGuest ? (
            <>
              <p className="auth-menu-hint">Guest mode — data stays on this device.</p>
              <button type="button" className="btn btn-primary btn-sm btn-full" onClick={onOpenAuthModal}>
                Sign in to sync
              </button>
            </>
          ) : null}
          <button type="button" className="btn btn-ghost btn-sm btn-full" onClick={auth.signOut}>
            {auth.user ? "Sign out" : "Exit guest mode"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
