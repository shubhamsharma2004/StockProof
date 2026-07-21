import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit as fsLimit,
} from "firebase/firestore";
// --- Core Firebase setup -----------------------------------------------
// Everything downstream degrades gracefully if any of this is misconfigured —
// auth/Firestore calls fail into localStorage, and the AI panel hides itself.

const firebaseConfig = {
  apiKey: "AIzaSyBw7YqSEbB0I5GCGv508qk5ui6I8g2K6tw",
  authDomain: "vetly-5351b.firebaseapp.com",
  projectId: "vetly-5351b",
  storageBucket: "vetly-5351b.firebasestorage.app",
  messagingSenderId: "83213604433",
  appId: "1:83213604433:web:a0e83a678e9165ead2ca70",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Auth ---------------------------------------------------------------

export function watchAuthState(callback) {
  try {
    return onAuthStateChanged(auth, callback, (err) => {
      console.warn("Auth state listener error:", err);
      callback(null);
    });
  } catch (err) {
    console.warn("Could not attach auth listener:", err);
    callback(null);
    return () => {};
  }
}

export async function signUpWithEmail(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { ok: true, user: cred.user };
  } catch (err) {
    return { ok: false, error: friendlyAuthError(err) };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: cred.user };
  } catch (err) {
    return { ok: false, error: friendlyAuthError(err) };
  }
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return { ok: true, user: cred.user };
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

// --- Firestore: evaluations ----------------------------------------------

const FIRESTORE_TIMEOUT_MS = 8000;

// Firestore's SDK can get stuck retrying (e.g. a misconfigured App Check
// provider repeatedly failing token exchange) without ever rejecting its own
// promise. A hard timeout here guarantees callers always fall back instead
// of leaving the UI in "loading" forever.
function withTimeout(promise, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), FIRESTORE_TIMEOUT_MS)),
  ]);
}

export async function saveEvaluation(uid, evaluation) {
  try {
    const ref = collection(db, "users", uid, "evaluations");
    const docRef = await withTimeout(
      addDoc(ref, { ...evaluation, createdAt: new Date() }),
      "Timed out saving to Firestore"
    );
    return { ok: true, id: docRef.id };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not save to Firestore" };
  }
}

export async function fetchEvaluations(uid) {
  try {
    const ref = collection(db, "users", uid, "evaluations");
    const q = query(ref, orderBy("createdAt", "desc"), fsLimit(50));
    const snap = await withTimeout(getDocs(q), "Timed out loading evaluation history");
    return { ok: true, evaluations: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not load evaluation history" };
  }
}

// --- Firestore: watchlist -------------------------------------------------

export async function addToWatchlist(uid, item) {
  try {
    const ref = collection(db, "users", uid, "watchlist");
    const docRef = await withTimeout(addDoc(ref, { ...item, addedAt: new Date() }), "Timed out saving to watchlist");
    return { ok: true, id: docRef.id };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not save to watchlist" };
  }
}

export async function removeFromWatchlist(uid, docId) {
  try {
    await withTimeout(deleteDoc(doc(db, "users", uid, "watchlist", docId)), "Timed out removing from watchlist");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not remove from watchlist" };
  }
}

export async function fetchWatchlist(uid) {
  try {
    const ref = collection(db, "users", uid, "watchlist");
    const q = query(ref, orderBy("addedAt", "desc"), fsLimit(100));
    const snap = await withTimeout(getDocs(q), "Timed out loading watchlist");
    return { ok: true, items: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not load watchlist" };
  }
}
