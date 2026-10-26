import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconClose } from "../../../shared/ui/icons.jsx";
import { modalClosed, selectAuthModalOpen } from "../model/authSlice.js";
import AuthForm from "./AuthForm.jsx";
import BrandLogo from "../../../shared/ui/BrandLogo.jsx";

// The centered "sign in to unlock" popup — opened from the topbar Login
// button or from clicking a gated nav item while signed out. It closes on
// successful sign-in (handled in authSlice), the close button, the
// backdrop, or Escape.
export default function AuthModal() {
  const dispatch = useDispatch();
  const open = useSelector(selectAuthModalOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") dispatch(modalClosed());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dispatch]);

  if (!open) return null;
  const close = () => dispatch(modalClosed());

  return (
    <div className="auth-modal-backdrop" onClick={close}>
      <div className="auth-modal-card" role="dialog" aria-modal="true" aria-label="Sign in" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close" onClick={close} aria-label="Close">
          <IconClose width={16} height={16} />
        </button>

        <div className="auth-modal-brand">
          <BrandLogo size={32} />
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
