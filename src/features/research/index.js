import "./research.css";

export { default as researchReducer } from "./model/researchSlice.js";
export { openSecurity, manualEntryStarted, selectionCleared, historyEntryLoaded } from "./model/researchSlice.js";
export { selectSelected, selectFetchedData } from "./model/selectors.js";
export { computeCategoryScores, computeOverallRecommendation } from "./lib/insights.js";
export { default as ResearchPage } from "./components/ResearchPage.jsx";
