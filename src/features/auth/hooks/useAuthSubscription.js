import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { watchAuthState } from "../api/authService.js";
import { userChanged } from "../model/authSlice.js";

// Bridges Firebase's auth listener into the store. Mounted once, at the root.
export function useAuthSubscription() {
  const dispatch = useDispatch();
  useEffect(() => watchAuthState((user) => dispatch(userChanged(user))), [dispatch]);
}
