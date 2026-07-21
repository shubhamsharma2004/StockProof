import { useState } from "react";

// Sign in / create account / Google — the account form shown from inside
// the dashboard (via AuthModal) when a visitor deliberately chooses to sign
// in. No guest option here: Dashboard/Stock Research never needs it, and
// this popup is only reached by an intentional "Sign In" click.
export default function AuthCardContent({ auth }) {
  return <AuthForm auth={auth} />;
}

function AuthForm({ auth }) {
  const isSignup = auth.authMode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    auth.submitAuth(email, password);
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
        {auth.authError ? (
          <p className="field-error" role="alert">
            {auth.authError}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary btn-full" disabled={auth.authSubmitting}>
          {auth.authSubmitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>
      <button type="button" className="link-btn" onClick={auth.toggleAuthMode}>
        {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>

      <div className="auth-divider" role="separator">
        <span>or</span>
      </div>
      <button type="button" className="btn btn-google" onClick={auth.googleSignIn}>
        <span aria-hidden="true">G</span> Continue with Google
      </button>
    </>
  );
}
