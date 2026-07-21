export default function TabsNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="tabs-row" role="tablist" aria-label="Research sections">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={activeTab === t.key}
          className={`tab-btn ${activeTab === t.key ? "is-active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
