import { useEffect } from "react";
import { IconClose } from "../icons.jsx";
import AuthCardContent from "./AuthCardContent.jsx";

// The centered "sign in to unlock" popup — opened from the topbar Login
// button or from clicking a gated nav item while signed out. Closes itself
// automatically the moment sign-in actually succeeds, in addition to the
// explicit close button/backdrop/Escape.
export default function AuthModal({ auth, onClose }) {
  useEffect(() => {
    if (auth.user) onClose();
  }, [auth.user, onClose]);

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
