import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOutUser } from "../api/authService.js";
import { showToast } from "../../../shared/lib/toast.js";

const initialState = {
  user: null, // { uid, email, displayName, photoURL } — plain, serializable
  resolved: false, // false until Firebase reports the first auth state
  mode: "signin", // 'signin' | 'signup'
  error: null,
  submitting: false,
  modalOpen: false,
};

export const submitCredentials = createAsyncThunk(
  "auth/submitCredentials",
  async ({ email, password }, { getState, rejectWithValue }) => {
    const isSignup = getState().auth.mode === "signup";
    const res = await (isSignup ? signUpWithEmail : signInWithEmail)(email, password);
    if (!res.ok) return rejectWithValue(res.error);
    showToast(isSignup ? "Account created — you're signed in." : "Signed in successfully.", "success");
  }
);

export const signInWithGoogleAccount = createAsyncThunk(
  "auth/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    const res = await signInWithGoogle();
    if (!res.ok) return rejectWithValue(res.error);
    showToast("Signed in successfully.", "success");
  },
  {
    // A second signInWithPopup while the first is still open makes Firebase
    // cancel the earlier one with a "cancelled-popup-request" error that
    // looks like a real auth failure but is really two overlapping popups.
    condition: (_, { getState }) => !getState().auth.submitting,
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await signOutUser();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userChanged(state, action) {
      state.user = action.payload;
      state.resolved = true;
      // The modal closes itself the moment sign-in actually succeeds.
      if (action.payload) state.modalOpen = false;
    },
    modeToggled(state) {
      state.mode = state.mode === "signup" ? "signin" : "signup";
      state.error = null;
    },
    modalOpened(state) {
      state.modalOpen = true;
    },
    modalClosed(state) {
      state.modalOpen = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [submitCredentials, signInWithGoogleAccount]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.submitting = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.submitting = false;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.submitting = false;
          state.error = action.payload || "Something went wrong. Please try again.";
        });
    }
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
    });
  },
});

export const { userChanged, modeToggled, modalOpened, modalClosed } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state) => state.auth.user;
export const selectAuthResolved = (state) => state.auth.resolved;
export const selectAuthForm = (state) => state.auth;
export const selectAuthModalOpen = (state) => state.auth.modalOpen;
