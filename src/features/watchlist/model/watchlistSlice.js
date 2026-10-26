import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from "../api/watchlistRepository.js";
import { selectUser } from "../../auth/index.js";
import { readSessionJSON, writeSessionJSON, generateId } from "../../../shared/lib/storage.js";
import { showToast } from "../../../shared/lib/toast.js";

// Signed-out visitors get a per-tab watchlist in sessionStorage; signing
// in switches to the Firestore-backed one.
const DEVICE_WATCHLIST_KEY = "stockproof.guestWatchlist";

export const loadWatchlist = createAsyncThunk("watchlist/load", async (_, { getState }) => {
  const user = selectUser(getState());
  if (!user) return readSessionJSON(DEVICE_WATCHLIST_KEY, []);
  const res = await fetchWatchlist(user.uid);
  if (res.ok) return res.items;
  showToast("Couldn't reach your watchlist — showing this device's list instead.", "warn");
  return readSessionJSON(DEVICE_WATCHLIST_KEY, []);
});

export const toggleWatchlist = createAsyncThunk(
  "watchlist/toggle",
  async (security, { getState, rejectWithValue }) => {
    const user = selectUser(getState());
    const items = getState().watchlist.items;
    const existing = items.find((i) => i.symbol === security.symbol);

    if (existing) {
      if (user) {
        const res = await removeFromWatchlist(user.uid, existing.id);
        if (!res.ok) {
          showToast("Couldn't remove from watchlist — try again.", "warn");
          return rejectWithValue(res.error);
        }
      } else {
        writeSessionJSON(DEVICE_WATCHLIST_KEY, items.filter((i) => i.id !== existing.id));
      }
      showToast("Removed from watchlist.", "info");
      return { removedId: existing.id };
    }

    const entry = { symbol: security.symbol, name: security.name, exchange: security.exchange };
    let added;
    if (user) {
      const res = await addToWatchlist(user.uid, entry);
      if (!res.ok) {
        showToast("Couldn't save to watchlist — try again.", "warn");
        return rejectWithValue(res.error);
      }
      added = { ...entry, id: res.id, addedAt: new Date().toISOString() };
    } else {
      added = { ...entry, id: generateId(), addedAt: new Date().toISOString() };
      writeSessionJSON(DEVICE_WATCHLIST_KEY, [added, ...items]);
    }
    showToast("Added to watchlist.", "success");
    return { added };
  }
);

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWatchlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(toggleWatchlist.fulfilled, (state, action) => {
        const { removedId, added } = action.payload;
        if (removedId) state.items = state.items.filter((i) => i.id !== removedId);
        if (added) state.items.unshift(added);
      });
  },
});

export default watchlistSlice.reducer;

export const selectWatchlistItems = (state) => state.watchlist.items;
export const selectWatchlistLoading = (state) => state.watchlist.loading;
export const selectIsWatchlisted = (state, symbol) => state.watchlist.items.some((i) => i.symbol === symbol);
