// Promise-based wrapper around the sentiment Web Worker. The worker is a
// live object, so it lives here (one per tab), never in the Redux store.
let worker = null;
let nextId = 1;
const pending = new Map();
let progressListener = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("../worker/sentiment.worker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") {
        progressListener?.(data.progress);
        return;
      }
      const request = pending.get(data.id);
      if (!request) return;
      pending.delete(data.id);
      if (data.type === "error") request.reject(new Error(data.message));
      else request.resolve(data.results);
    };
  }
  return worker;
}

function send(message) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ ...message, id });
  });
}

export function loadModel(onProgress) {
  progressListener = onProgress;
  return send({ type: "load" });
}

// texts: string[] → [{ label, confidence, positive, negative, neutral }]
export function classify(texts) {
  return send({ type: "classify", texts });
}
