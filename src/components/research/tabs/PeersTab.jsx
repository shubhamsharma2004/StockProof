import DataNotAvailable from "../DataNotAvailable.jsx";

export default function PeersTab() {
  return (
    <div className="tab-panel">
      <DataNotAvailable
        title="Peer Comparison — Data not available"
        description="Comparing this company against its direct peers needs a reliable peer index this app doesn't have wired up yet. Shown here as an empty state rather than guessed figures."
      />
    </div>
  );
}
