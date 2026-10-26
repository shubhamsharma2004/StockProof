import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Core Firebase setup -----------------------------------------------
// Everything downstream degrades gracefully if any of this is misconfigured —
// auth/Firestore calls fail into session storage instead of throwing.

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

const FIRESTORE_TIMEOUT_MS = 8000;

// Firestore's SDK can get stuck retrying (e.g. a misconfigured App Check
// provider repeatedly failing token exchange) without ever rejecting its own
// promise. A hard timeout here guarantees callers always fall back instead
// of leaving the UI in "loading" forever.
export function withTimeout(promise, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), FIRESTORE_TIMEOUT_MS)),
  ]);
}

// Firestore Timestamps aren't serializable, so they can't go into Redux —
// every repository converts them to ISO strings on the way out.
export function timestampToIso(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
