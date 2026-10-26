import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit as fsLimit } from "firebase/firestore";
import { db, withTimeout, timestampToIso } from "../../../shared/firebase/client.js";

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
    const items = snap.docs.map((d) => {
      const data = d.data();
      return { ...data, id: d.id, addedAt: timestampToIso(data.addedAt) };
    });
    return { ok: true, items };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not load watchlist" };
  }
}
