import { useSelector } from "react-redux";
import { selectCategories, selectDataSource, selectFetchedData, selectIsIndian, selectMoney, selectSelected } from "../../model/selectors.js";
import { useNseEnrichment } from "../../hooks/useNseEnrichment.js";
import ScoreCards from "../ScoreCards.jsx";
import SnapshotGrid from "../SnapshotGrid.jsx";
import PriceChart from "../PriceChart.jsx";
import KeyStatsCompanyInfo from "../KeyStatsCompanyInfo.jsx";
import InsightChecklist from "../InsightChecklist.jsx";
import StockNewsCard from "../StockNewsCard.jsx";

export default function OverviewTab() {
  const fd = useSelector(selectFetchedData) || {};
  const categories = useSelector(selectCategories);
  const dataSource = useSelector(selectDataSource);
  const selected = useSelector(selectSelected);
  const nse = useNseEnrichment();
  const money = useSelector(selectMoney);
  const isIndian = useSelector(selectIsIndian);

  return (
    <div className="tab-panel">
      <ScoreCards categories={categories} fetchedData={fd} />
      <SnapshotGrid fd={fd} nse={nse} money={money} isIndian={isIndian} />
      {dataSource === "live" ? <PriceChart /> : null}
      <KeyStatsCompanyInfo fd={fd} selected={selected} money={money} isIndian={isIndian} />
      {dataSource === "live" ? <StockNewsCard /> : null}
      <InsightChecklist />
    </div>
  );
}
