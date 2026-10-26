// One shared header for every non-Research page (Watchlist, Portfolio,
// Screener, …) so switching between them doesn't feel like landing on a
// different app each time — same breadcrumb, title, and subtitle pattern.
export default function PageHeader({ label, title, subtitle }) {
  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span>Home</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{label}</span>
      </nav>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </>
  );
}
