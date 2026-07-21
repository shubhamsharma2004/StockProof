import { useEffect } from "react";
import { IconClose } from "../icons.jsx";
import AuthCardContent from "./AuthCardContent.jsx";

// Optional, dismissible — used inside the app once a guest wants to
// upgrade to a full account (e.g. "Sign in to sync" in the account menu).
// The mandatory first-run gate is AuthGate, not this.
export default function AuthModal({ auth, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" role="dialog" aria-modal="true" aria-label="Sign in" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
          <IconClose width={16} height={16} />
        </button>

        <div className="auth-modal-brand">
          <img src="/favicon.svg" alt="" width={30} height={30} />
          <span>Stockproof</span>
        </div>

        <AuthCardContent auth={auth} />
      </div>
    </div>
  );
}
