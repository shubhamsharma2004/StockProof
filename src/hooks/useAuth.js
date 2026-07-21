import { useCallback, useEffect, useRef, useState } from "react";
import {
  watchAuthState,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
} from "../firebase.js";
import { fetchGuestCount, incrementGuestCount } from "../api.js";

const GUEST_MODE_KEY = "stockproof.guestMode";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setGuestCount] = useState(null);
  const [authScreenExpanded, setAuthScreenExpanded] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // 'signin' | 'signup'
  const [authError, setAuthError] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    unsubRef.current = watchAuthState((u) => {
      setUser(u);
      setAuthResolved(true);
      if (u) {
        setIsGuest(false);
      } else {
        setIsGuest(sessionStorage.getItem(GUEST_MODE_KEY) === "true");
      }
    });
    return () => unsubRef.current?.();
  }, []);

  useEffect(() => {
    fetchGuestCount().then((res) => {
      if (res.ok) setGuestCount(res.count);
    });
  }, []);

  const continueAsGuest = useCallback(() => {
    sessionStorage.setItem(GUEST_MODE_KEY, "true");
    setIsGuest(true);
    incrementGuestCount().catch(() => {});
  }, []);

  const expandAuth = useCallback(() => setAuthScreenExpanded(true), []);
  const collapseAuth = useCallback(() => {
    setAuthScreenExpanded(false);
    setAuthError(null);
  }, []);
  const toggleAuthMode = useCallback(() => {
    setAuthMode((m) => (m === "signup" ? "signin" : "signup"));
    setAuthError(null);
  }, []);

  const submitAuth = useCallback(
    async (email, password) => {
      setAuthSubmitting(true);
      setAuthError(null);
      const action = authMode === "signup" ? signUpWithEmail : signInWithEmail;
      const res = await action(email, password);
      setAuthSubmitting(false);
      if (!res.ok) setAuthError(res.error);
    },
    [authMode]
  );

  const googleSignIn = useCallback(async () => {
    setAuthError(null);
    const res = await signInWithGoogle();
    if (!res.ok) setAuthError(res.error);
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    sessionStorage.removeItem(GUEST_MODE_KEY);
    setUser(null);
    setIsGuest(false);
  }, []);

  return {
    user,
    authResolved,
    isGuest,
    guestCount,
    authScreenExpanded,
    authMode,
    authError,
    authSubmitting,
    continueAsGuest,
    expandAuth,
    collapseAuth,
    toggleAuthMode,
    submitAuth,
    googleSignIn,
    signOut,
  };
}
