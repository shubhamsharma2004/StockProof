import { useCallback, useEffect, useState } from "react";
import { saveEvaluation, fetchEvaluations } from "../firebase.js";
import { readSessionJSON, writeSessionJSON, generateId, showToast } from "../utils.js";
import { computeScore } from "../checklistData.js";

const GUEST_HISTORY_KEY = "stockproof.guestHistory";

export function useHistory({ user, isGuest }) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyNotice, setHistoryNotice] = useState(null);

  const loadGuestHistory = useCallback(() => {
    setHistory(readSessionJSON(GUEST_HISTORY_KEY, []));
    setHistoryNotice(null);
  }, []);

  const loadUserHistory = useCallback(async (uid) => {
    setHistoryLoading(true);
    const res = await fetchEvaluations(uid);
    setHistoryLoading(false);
    if (res.ok) {
      setHistory(res.evaluations);
      setHistoryNotice(null);
    } else {
      setHistory(readSessionJSON(GUEST_HISTORY_KEY, []));
      setHistoryNotice("Couldn't reach your saved history — showing evaluations stored on this device instead.");
    }
  }, []);

  useEffect(() => {
    if (user) loadUserHistory(user.uid);
    else if (isGuest) loadGuestHistory();
    else setHistory([]);
  }, [user, isGuest, loadUserHistory, loadGuestHistory]);

  const saveCurrentEvaluation = useCallback(
    async ({ selected, mode, fetchedData, checkedItems }) => {
      const score = computeScore(checkedItems, mode);
      const evaluation = {
        ticker: selected.symbol,
        name: selected.name,
        exchange: selected.exchange,
        isETF: mode === "etf",
        fetchedData,
        checkedItems,
        score: score.percent,
      };

      if (user) {
        const res = await saveEvaluation(user.uid, evaluation);
        if (res.ok) {
          showToast("Evaluation saved.", "success");
          loadUserHistory(user.uid);
          return;
        }
        showToast("Couldn't save to your account — saved locally instead.", "warn");
      } else {
        showToast("Evaluation saved to this device.", "success");
      }

      const local = readSessionJSON(GUEST_HISTORY_KEY, []);
      local.unshift({ ...evaluation, id: generateId(), createdAt: new Date().toISOString() });
      writeSessionJSON(GUEST_HISTORY_KEY, local.slice(0, 50));
      setHistory(local.slice(0, 50));
    },
    [user, loadUserHistory]
  );

  return { history, historyLoading, historyNotice, saveCurrentEvaluation };
}
