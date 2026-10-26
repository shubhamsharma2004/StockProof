// Runs FinBERT (a BERT model fine-tuned on financial text) in a Web Worker
// so loading and inference never block the UI thread. Model weights come
// from the Hugging Face Hub on first use and are cached by the browser.
import { env, pipeline } from "@huggingface/transformers";

const MODEL_ID = "Xenova/finbert";
env.allowLocalModels = false;

let classifierPromise = null;

function loadClassifier() {
  if (!classifierPromise) {
    // Several files download in parallel; report one combined percentage.
    const files = new Map();
    let lastSent = -1;
    classifierPromise = pipeline("text-classification", MODEL_ID, {
      dtype: "q8",
      progress_callback: (p) => {
        if (p.status !== "progress" || !p.file || !p.total) return;
        files.set(p.file, { loaded: p.loaded, total: p.total });
        let loaded = 0;
        let total = 0;
        for (const f of files.values()) {
          loaded += f.loaded;
          total += f.total;
        }
        const percent = Math.floor((loaded / total) * 100);
        if (percent !== lastSent) {
          lastSent = percent;
          self.postMessage({ type: "progress", progress: percent });
        }
      },
    }).catch((err) => {
      classifierPromise = null; // allow a retry after a failed download
      throw err;
    });
  }
  return classifierPromise;
}

// FinBERT labels are positive / negative / neutral. Keep all three scores
// so the UI can show a net tone, not just the winning label.
function toResult(scores) {
  const byLabel = Object.fromEntries(scores.map((s) => [s.label.toLowerCase(), s.score]));
  const top = scores.reduce((a, b) => (b.score > a.score ? b : a));
  return {
    label: top.label.toLowerCase(),
    confidence: top.score,
    positive: byLabel.positive ?? 0,
    negative: byLabel.negative ?? 0,
    neutral: byLabel.neutral ?? 0,
  };
}

self.onmessage = async ({ data }) => {
  const { id, type } = data;
  try {
    const classifier = await loadClassifier();
    if (type === "load") {
      self.postMessage({ type: "done", id });
      return;
    }
    if (type === "classify") {
      const output = await classifier(data.texts, { top_k: 3 });
      // A single input comes back as a flat list of scores, a batch as a list of lists.
      const perText = data.texts.length === 1 && !Array.isArray(output[0]) ? [output] : output;
      self.postMessage({ type: "done", id, results: perText.map(toResult) });
    }
  } catch (err) {
    self.postMessage({ type: "error", id, message: err?.message || String(err) });
  }
};
