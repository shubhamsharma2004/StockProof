import { useDispatch, useSelector } from "react-redux";
import Tabs from "../../../shared/ui/Tabs.jsx";
import { selectionCleared, tabChanged } from "../model/researchSlice.js";
import { selectActiveTab, selectDataSource, selectIsIndian, selectSelected } from "../model/selectors.js";
import EmptyState from "./EmptyState.jsx";
import Hero from "./Hero.jsx";
import ManualEntryForm from "./ManualEntryForm.jsx";
import OverviewTab from "./tabs/OverviewTab.jsx";
import FinancialsTab from "./tabs/FinancialsTab.jsx";
import RatiosTab from "./tabs/RatiosTab.jsx";
import ShareholdingTab from "./tabs/ShareholdingTab.jsx";
import PeersTab from "./tabs/PeersTab.jsx";
import ResearchSidebar from "./sidebar/ResearchSidebar.jsx";
import MobileCta from "./MobileCta.jsx";

const TABS = [
  { key: "overview", label: "Overview", Component: OverviewTab },
  { key: "financials", label: "Financials", Component: FinancialsTab },
  { key: "ratios", label: "Ratios", Component: RatiosTab },
  // NSE shareholding filings exist only for Indian listings.
  { key: "shareholding", label: "Shareholding", Component: ShareholdingTab, indiaOnly: true },
  { key: "peers", label: "Peers", Component: PeersTab },
];

export default function ResearchPage() {
  const dispatch = useDispatch();
  const selected = useSelector(selectSelected);
  const dataSource = useSelector(selectDataSource);
  const activeTab = useSelector(selectActiveTab);
  const isIndian = useSelector(selectIsIndian);

  if (!selected) return <EmptyState />;

  const tabs = TABS.filter((t) => isIndian || !t.indiaOnly);
  const ActiveTab = (tabs.find((t) => t.key === activeTab) || tabs[0]).Component;

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
          onClick={() => dispatch(selectionCleared())}
          aria-label="Clear selection and search again"
        >
          ×
        </button>
      </nav>

      <Hero />

      {/* Keyed so the form's raw-input state resets for each new security. */}
      {dataSource === "manual" ? <ManualEntryForm key={selected.symbol} /> : null}

      <Tabs tabs={tabs} activeTab={tabs.some((t) => t.key === activeTab) ? activeTab : tabs[0].key} onChange={(key) => dispatch(tabChanged(key))} label="Research sections" />

      <div className="research-grid">
        <div className="research-main">
          <ActiveTab />
        </div>
        <ResearchSidebar />
      </div>

      <MobileCta />
    </div>
  );
}
