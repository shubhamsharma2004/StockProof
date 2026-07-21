import DataNotAvailable from "../DataNotAvailable.jsx";

export default function ShareholdingTab() {
  return (
    <div className="tab-panel">
      <DataNotAvailable
        title="Shareholding Pattern — Data not available"
        description="Promoter, FII, DII and public shareholding figures are NSE/BSE regulatory disclosures that aren't part of this app's data feed yet. Rather than estimate them, this section stays empty until a real source is wired in."
      />
    </div>
  );
}
