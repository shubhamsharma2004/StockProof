import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../../../shared/firebase/client.js";

// Firebase's User is a live class instance — only these plain fields ever
// reach the Redux store.
function toPlainUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
  };
}

export function watchAuthState(callback) {
  try {
    return onAuthStateChanged(
      auth,
      (user) => callback(toPlainUser(user)),
      (err) => {
        console.warn("Auth state listener error:", err);
        callback(null);
      }
    );
  } catch (err) {
    console.warn("Could not attach auth listener:", err);
    callback(null);
    return () => {};
  }
}

export async function signUpWithEmail(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyAuthError(err) };
  }
}

export async function signInWithEmail(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyAuthError(err) };
  }
}

export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyAuthError(err) };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyAuthError(err) };
  }
}

function friendlyAuthError(err) {
  const code = err?.code || "";
  const known = {
    "auth/email-already-in-use": "That email is already registered — try signing in instead.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/popup-closed-by-user": "Sign-in window was closed before completing.",
    "auth/network-request-failed": "Network error — check your connection and try again.",
  };
  return known[code] || err?.message || "Something went wrong. Please try again.";
}
