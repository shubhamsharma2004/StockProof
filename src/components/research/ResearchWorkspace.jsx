import { useState } from "react";
import { useHistory } from "../../hooks/useHistory.js";
import { computeCategoryScores } from "../../insights.js";
import EmptyState from "./EmptyState.jsx";
import Hero from "./Hero.jsx";
import ManualEntryForm from "./ManualEntryForm.jsx";
import TabsNav from "./TabsNav.jsx";
import OverviewTab from "./tabs/OverviewTab.jsx";
import FinancialsTab from "./tabs/FinancialsTab.jsx";
import RatiosTab from "./tabs/RatiosTab.jsx";
import ShareholdingTab from "./tabs/ShareholdingTab.jsx";
import PeersTab from "./tabs/PeersTab.jsx";
import Sidebar from "../sidebar/Sidebar.jsx";
import MobileCta from "./MobileCta.jsx";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "financials", label: "Financials" },
  { key: "ratios", label: "Ratios" },
  { key: "shareholding", label: "Shareholding" },
  { key: "peers", label: "Peers" },
];

export default function ResearchWorkspace({ auth, stockData, watchlist }) {
  const [activeTab, setActiveTab] = useState("overview");
  const history = useHistory({ user: auth.user, isGuest: auth.isGuest });
  const { selected, fetchedData } = stockData;

  if (!selected) {
    return <EmptyState guestCount={auth.guestCount} isGuest={auth.isGuest} stockData={stockData} />;
  }

  const categories = computeCategoryScores(fetchedData || {});

  return (
    <div className="research-view">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span>Home</span>
        <span className="breadcrumb-sep">/</span>
        <span>Stock Research</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{selected.symbol}</span>
        <button
          type="button"
          className="breadcrumb-clear"
          onClick={stockData.clearSelection}
          aria-label="Clear selection and search again"
        >
          ×
        </button>
      </nav>

      <Hero stockData={stockData} categories={categories} watchlist={watchlist} />

      {stockData.dataSource === "manual" ? <ManualEntryForm stockData={stockData} /> : null}

      <TabsNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="research-grid">
        <div className="research-main">
          {activeTab === "overview" ? <OverviewTab stockData={stockData} categories={categories} /> : null}
          {activeTab === "financials" ? <FinancialsTab stockData={stockData} /> : null}
          {activeTab === "ratios" ? <RatiosTab stockData={stockData} /> : null}
          {activeTab === "shareholding" ? <ShareholdingTab /> : null}
          {activeTab === "peers" ? <PeersTab /> : null}
        </div>
        <Sidebar stockData={stockData} categories={categories} history={history} auth={auth} />
      </div>

      <MobileCta stockData={stockData} categories={categories} onSave={() => history.saveCurrentEvaluation(stockData)} />
    </div>
  );
}
