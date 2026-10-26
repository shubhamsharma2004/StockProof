import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { modeToggled, selectAuthForm, signInWithGoogleAccount, submitCredentials } from "../model/authSlice.js";

// Sign in / create account / Google — the account form shown inside
// AuthModal when a visitor deliberately chooses to sign in.
export default function AuthForm() {
  const dispatch = useDispatch();
  const { mode, error, submitting } = useSelector(selectAuthForm);
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitCredentials({ email, password }));
  };

  return (
    <>
      <h2 className="auth-modal-heading">{isSignup ? "Create your account" : "Sign in to Stockproof"}</h2>
      <p className="auth-modal-subtitle">Sync your watchlist, portfolio scenarios, and research history across devices.</p>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>
      <button type="button" className="link-btn" onClick={() => dispatch(modeToggled())}>
        {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>

      <div className="auth-divider" role="separator">
        <span>or</span>
      </div>
      <button type="button" className="btn btn-google" onClick={() => dispatch(signInWithGoogleAccount())} disabled={submitting}>
        <span aria-hidden="true">G</span> {submitting ? "Please wait…" : "Continue with Google"}
      </button>
    </>
  );
}
