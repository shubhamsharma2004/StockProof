import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { classify, loadModel } from "../lib/sentimentClient.js";
import { articleId } from "../lib/summarize.js";

// Opt-in is remembered per browser: the model is a one-time ~110 MB
// download, so it's never fetched until the user asks for it.
const ENABLED_KEY = "stockproof.sentimentEnabled";
const BATCH_SIZE = 16;

function readEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function writeEnabled(value) {
  try {
    localStorage.setItem(ENABLED_KEY, String(value));
  } catch {
    // Non-fatal: the user will just be asked again next visit.
  }
}

export const loadSentimentModel = createAsyncThunk(
  "sentiment/loadModel",
  async (_, { dispatch }) => {
    await loadModel((progress) => dispatch(progressUpdated(progress)));
  },
  { condition: (_, { getState }) => !["loading", "ready"].includes(getState().sentiment.status) }
);

export const enableSentiment = () => (dispatch) => {
  writeEnabled(true);
  dispatch(enabledChanged(true));
  dispatch(loadSentimentModel());
};

export const disableSentiment = () => (dispatch) => {
  writeEnabled(false);
  dispatch(enabledChanged(false));
};

// Classifies only headlines not already scored or in flight.
export const analyzeHeadlines = createAsyncThunk(
  "sentiment/analyze",
  async (articles) => {
    const out = {};
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);
      const results = await classify(batch.map((a) => a.title));
      batch.forEach((a, k) => {
        out[articleId(a)] = results[k];
      });
    }
    return out;
  },
  {
    condition: (articles, { getState }) => getState().sentiment.status === "ready" && articles.length > 0,
  }
);

const sentimentSlice = createSlice({
  name: "sentiment",
  initialState: () => ({
    enabled: readEnabled(),
    status: "off", // off | loading | ready | error
    progress: 0,
    error: null,
    results: {}, // articleId → { label, confidence, positive, negative, neutral }
    inFlight: {}, // articleId → true
  }),
  reducers: {
    enabledChanged(state, action) {
      state.enabled = action.payload;
    },
    progressUpdated(state, action) {
      state.progress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSentimentModel.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadSentimentModel.fulfilled, (state) => {
        state.status = "ready";
        state.progress = 100;
      })
      .addCase(loadSentimentModel.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message || "The model couldn't be loaded.";
      })
      .addCase(analyzeHeadlines.pending, (state, action) => {
        for (const a of action.meta.arg) state.inFlight[articleId(a)] = true;
      })
      .addCase(analyzeHeadlines.fulfilled, (state, action) => {
        Object.assign(state.results, action.payload);
        for (const a of action.meta.arg) delete state.inFlight[articleId(a)];
      })
      .addCase(analyzeHeadlines.rejected, (state, action) => {
        for (const a of action.meta.arg) delete state.inFlight[articleId(a)];
      });
  },
});

const { enabledChanged, progressUpdated } = sentimentSlice.actions;
export default sentimentSlice.reducer;

export const selectSentiment = (state) => state.sentiment;
