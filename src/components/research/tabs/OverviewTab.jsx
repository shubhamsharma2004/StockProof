import ScoreCards from "../ScoreCards.jsx";
import SnapshotGrid from "../SnapshotGrid.jsx";
import PriceChart from "../PriceChart.jsx";
import KeyStatsCompanyInfo from "../KeyStatsCompanyInfo.jsx";
import InsightChecklist from "../InsightChecklist.jsx";

export default function OverviewTab({ stockData, categories }) {
  const fd = stockData.fetchedData || {};
  return (
    <div className="tab-panel">
      <ScoreCards categories={categories} fetchedData={fd} />
      <SnapshotGrid fd={fd} />
      {stockData.dataSource === "live" ? <PriceChart stockData={stockData} /> : null}
      <KeyStatsCompanyInfo fd={fd} selected={stockData.selected} />
      <InsightChecklist stockData={stockData} />
    </div>
  );
}
