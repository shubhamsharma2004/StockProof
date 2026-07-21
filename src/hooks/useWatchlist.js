import { useCallback, useEffect, useState } from "react";
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from "../firebase.js";
import { readSessionJSON, writeSessionJSON, generateId, showToast } from "../utils.js";

const GUEST_WATCHLIST_KEY = "stockproof.guestWatchlist";

export function useWatchlist({ user, isGuest }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadGuest = useCallback(() => {
    setItems(readSessionJSON(GUEST_WATCHLIST_KEY, []));
  }, []);

  const loadUser = useCallback(async (uid) => {
    setLoading(true);
    const res = await fetchWatchlist(uid);
    setLoading(false);
    if (res.ok) {
      setItems(res.items);
    } else {
      setItems(readSessionJSON(GUEST_WATCHLIST_KEY, []));
      showToast("Couldn't reach your watchlist — showing this device's list instead.", "warn");
    }
  }, []);

  useEffect(() => {
    if (user) loadUser(user.uid);
    else if (isGuest) loadGuest();
    else setItems([]);
  }, [user, isGuest, loadUser, loadGuest]);

  const isWatchlisted = useCallback((symbol) => items.some((i) => i.symbol === symbol), [items]);

  const toggle = useCallback(
    async (security) => {
      const existing = items.find((i) => i.symbol === security.symbol);

      if (existing) {
        if (user) {
          const res = await removeFromWatchlist(user.uid, existing.id);
          if (!res.ok) {
            showToast("Couldn't remove from watchlist — try again.", "warn");
            return;
          }
        } else {
          writeSessionJSON(GUEST_WATCHLIST_KEY, items.filter((i) => i.id !== existing.id));
        }
        setItems((prev) => prev.filter((i) => i.id !== existing.id));
        showToast("Removed from watchlist.", "info");
        return;
      }

      const entry = { symbol: security.symbol, name: security.name, exchange: security.exchange };
      if (user) {
        const res = await addToWatchlist(user.uid, entry);
        if (!res.ok) {
          showToast("Couldn't save to watchlist — try again.", "warn");
          return;
        }
        setItems((prev) => [{ id: res.id, ...entry, addedAt: new Date().toISOString() }, ...prev]);
      } else {
        const local = { ...entry, id: generateId(), addedAt: new Date().toISOString() };
        writeSessionJSON(GUEST_WATCHLIST_KEY, [local, ...items]);
        setItems((prev) => [local, ...prev]);
      }
      showToast("Added to watchlist.", "success");
    },
    [items, user]
  );

  return { items, loading, isWatchlisted, toggle };
}
