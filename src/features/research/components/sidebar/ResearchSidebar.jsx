import { useDispatch } from "react-redux";
import { HistoryCard } from "../../../history/index.js";
import { loadHistoryEntry } from "../../model/researchSlice.js";
import ProgressCard from "./ProgressCard.jsx";
import RecommendationCard from "./RecommendationCard.jsx";
import FinalRecommendationCard from "./FinalRecommendationCard.jsx";
import InsightsCard from "./InsightsCard.jsx";

export default function ResearchSidebar() {
  const dispatch = useDispatch();
  return (
    <aside className="research-sidebar" aria-label="Research progress">
      <ProgressCard />
      <RecommendationCard />
      <FinalRecommendationCard />
      <HistoryCard onSelect={(entry) => dispatch(loadHistoryEntry(entry))} />
      <InsightsCard />
    </aside>
  );
}
