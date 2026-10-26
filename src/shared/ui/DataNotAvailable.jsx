export default function DataNotAvailable({ title, description, icon, children }) {
  return (
    <section className="panel-card data-unavailable-card">
      <span className="data-unavailable-icon" aria-hidden="true">
        {icon || (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 8l8 8M16 8l-8 8" />
          </svg>
        )}
      </span>
      <h2 className="panel-title">{title}</h2>
      <p className="panel-subtitle">{description}</p>
      {children}
    </section>
  );
}
