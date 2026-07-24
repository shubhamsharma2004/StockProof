import ProgressCard from "./ProgressCard.jsx";
import RecommendationCard from "./RecommendationCard.jsx";
import FinalRecommendationCard from "./FinalRecommendationCard.jsx";
import HistoryCard from "./HistoryCard.jsx";
import InsightsCard from "./InsightsCard.jsx";

export default function Sidebar({ stockData, categories, history, auth }) {
  return (
    <aside className="research-sidebar" aria-label="Research progress">
      <ProgressCard stockData={stockData} />
      <RecommendationCard stockData={stockData} categories={categories} onSave={() => history.saveCurrentEvaluation(stockData)} />
      <FinalRecommendationCard stockData={stockData} categories={categories} />
      <HistoryCard history={history} onLoadEntry={stockData.loadFromHistoryEntry} />
      <InsightsCard user={auth.user} history={history.history} />
    </aside>
  );
}
