import AuthCardContent from "./AuthCardContent.jsx";
import SiteFooter from "../SiteFooter.jsx";

// The mandatory first-run screen — nothing else in the app renders until
// the visitor picks Sign In, Create Account, Google, or Continue as Guest.
// No close button, no backdrop dismiss: unlike AuthModal, this one is not
// optional.
export default function AuthGate({ auth, theme, onToggleTheme, onOpenGuide }) {
  return (
    <div className="pre-auth-shell">
      <header className="pre-auth-header">
        <div className="pre-auth-header-inner">
          <span className="brand" aria-label="Stockproof">
            <img src="/favicon.svg" alt="" width="30" height="30" className="brand-mark" />
            <span className="brand-name">Stockproof</span>
          </span>
          <div className="pre-auth-header-actions">
            <button type="button" className="link-btn" onClick={onOpenGuide}>
              Guide
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
          </div>
        </div>
      </header>

      <div className="auth-gate-body">
        <div className="auth-modal-card auth-gate-card" role="dialog" aria-label="Sign in">
          <div className="auth-modal-brand">
            <img src="/favicon.svg" alt="" width={30} height={30} />
            <span>Stockproof</span>
          </div>
          <AuthCardContent auth={auth} />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
