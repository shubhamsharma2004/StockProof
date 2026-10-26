import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { saveEvaluation as persistEvaluation, fetchEvaluations } from "../api/evaluationsRepository.js";
import { selectUser } from "../../auth/index.js";
import { readSessionJSON, writeSessionJSON, generateId } from "../../../shared/lib/storage.js";
import { showToast } from "../../../shared/lib/toast.js";

const DEVICE_HISTORY_KEY = "stockproof.guestHistory";
const MAX_DEVICE_ENTRIES = 50;

export const loadHistory = createAsyncThunk("history/load", async (_, { getState }) => {
  const user = selectUser(getState());
  if (!user) return { items: readSessionJSON(DEVICE_HISTORY_KEY, []), notice: null };
  const res = await fetchEvaluations(user.uid);
  if (res.ok) return { items: res.evaluations, notice: null };
  return {
    items: readSessionJSON(DEVICE_HISTORY_KEY, []),
    notice: "Couldn't reach your saved history — showing evaluations stored on this device instead.",
  };
});

// `evaluation` is built by the caller (the research feature owns what an
// evaluation contains); this feature only owns where it's stored.
export const saveEvaluation = createAsyncThunk("history/save", async (evaluation, { getState, dispatch }) => {
  const user = selectUser(getState());
  if (user) {
    const res = await persistEvaluation(user.uid, evaluation);
    if (res.ok) {
      showToast("Evaluation saved.", "success");
      dispatch(loadHistory());
      return null;
    }
    showToast("Couldn't save to your account — saved locally instead.", "warn");
  } else {
    showToast("Evaluation saved to this device.", "success");
  }

  const local = readSessionJSON(DEVICE_HISTORY_KEY, []);
  local.unshift({ ...evaluation, id: generateId(), createdAt: new Date().toISOString() });
  const trimmed = local.slice(0, MAX_DEVICE_ENTRIES);
  writeSessionJSON(DEVICE_HISTORY_KEY, trimmed);
  return trimmed;
});

const historySlice = createSlice({
  name: "history",
  initialState: { items: [], loading: false, notice: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.notice = action.payload.notice;
      })
      .addCase(saveEvaluation.fulfilled, (state, action) => {
        if (action.payload) state.items = action.payload;
      });
  },
});

export default historySlice.reducer;

export const selectHistory = (state) => state.history;
export const selectHistoryItems = (state) => state.history.items;
