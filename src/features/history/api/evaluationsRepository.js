import { collection, addDoc, getDocs, query, orderBy, limit as fsLimit } from "firebase/firestore";
import { db, withTimeout, timestampToIso } from "../../../shared/firebase/client.js";

export async function saveEvaluation(uid, evaluation) {
  try {
    const ref = collection(db, "users", uid, "evaluations");
    const docRef = await withTimeout(addDoc(ref, { ...evaluation, createdAt: new Date() }), "Timed out saving to Firestore");
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
    const evaluations = snap.docs.map((d) => {
      const data = d.data();
      return { ...data, id: d.id, createdAt: timestampToIso(data.createdAt) };
    });
    return { ok: true, evaluations };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not load evaluation history" };
  }
}
