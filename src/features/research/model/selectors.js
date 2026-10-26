import { createSelector } from "@reduxjs/toolkit";
import { buildSymbol } from "../../../shared/lib/symbols.js";
import { MARKET_KEYS, MARKETS, marketOf } from "../../../shared/config/markets.js";
import { moneyFor } from "../../../shared/lib/money.js";
import { computeScore } from "../lib/checklist.js";
import {
  applyResearchProgressToConfidence,
  computeCategoryScores,
  computeOverallRecommendation,
  computeStrengthsAndWatch,
} from "../lib/insights.js";

export const selectResearch = (state) => state.research;
export const selectSelected = (state) => state.research.selected;
export const selectDataSource = (state) => state.research.dataSource;
export const selectFetchedData = (state) => state.research.fetchedData;
export const selectMode = (state) => state.research.mode;
export const selectCheckedItems = (state) => state.research.checkedItems;
export const selectChartRange = (state) => state.research.chartRange;
export const selectActiveTab = (state) => state.research.activeTab;

// Suffixed symbol for live lookups, or null when there's no live quote to
// enrich (nothing selected, manual entry, or a loaded history snapshot).
export const selectLiveSymbol = createSelector([selectSelected, selectDataSource], (selected, dataSource) =>
  selected && dataSource === "live" ? buildSymbol(selected.symbol, selected.exchange) : null
);

// Market of the open security ("IN" | "US") and its currency formatters.
export const selectSecurityMarket = createSelector([selectSelected], (selected) => marketOf(selected));
export const selectIsIndian = createSelector([selectSecurityMarket], (market) => market === MARKET_KEYS.INDIA);
export const selectMoney = createSelector([selectSecurityMarket, selectFetchedData], (market, fd) =>
  moneyFor(fd?.currency || MARKETS[market].currency)
);

// NSE-only enrichment (shareholding, reported EPS) needs a live Indian quote.
export const selectNseSymbol = createSelector([selectLiveSymbol, selectIsIndian], (symbol, isIndian) =>
  isIndian ? symbol : null
);

// The scoring engine is pure; memoizing here means every card that shows a
// score reads the same computed object instead of re-running it per render.
export const selectCategories = createSelector([selectFetchedData], (fd) => computeCategoryScores(fd || {}));

export const selectProgress = createSelector([selectCheckedItems, selectMode], (checkedItems, mode) =>
  computeScore(checkedItems, mode)
);

export const selectOverall = createSelector([selectCategories, selectProgress], (categories, progress) =>
  applyResearchProgressToConfidence(computeOverallRecommendation(categories), progress.percent)
);

export const selectStrengthsAndWatch = createSelector([selectFetchedData], (fd) => computeStrengthsAndWatch(fd || {}));

// What gets persisted when the user saves an evaluation.
export const selectEvaluationSnapshot = createSelector(
  [selectSelected, selectMode, selectFetchedData, selectCheckedItems, selectProgress],
  (selected, mode, fetchedData, checkedItems, progress) =>
    selected
      ? {
          ticker: selected.symbol,
          name: selected.name,
          exchange: selected.exchange,
          isETF: mode === "etf",
          fetchedData,
          checkedItems,
          score: progress.percent,
        }
      : null
);
