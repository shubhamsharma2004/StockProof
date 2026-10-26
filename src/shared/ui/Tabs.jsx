// Underlined tab row used by research sections and the screener / IPO /
// market pages. `tabs` is [{ key, label }].
export default function Tabs({ tabs, activeTab, onChange, label = "Sections", className = "" }) {
  return (
    <nav className={`tabs-row ${className}`} role="tablist" aria-label={label}>
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
