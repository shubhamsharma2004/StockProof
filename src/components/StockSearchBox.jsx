import { IconSearch } from "./icons.jsx";
import { useStockSearch } from "../hooks/useStockSearch.js";

// The one search-box implementation, shared by the topbar and any page
// (e.g. Portfolio) that needs to let the user pick a stock directly rather
// than relying on whatever is already selected elsewhere. Each instance
// owns its own query/results/open state (via useStockSearch) — multiple
// boxes can be mounted at once without one's dropdown leaking into another's.
export default function StockSearchBox({
  onSelect,
  onManualEntry,
  id = "stock-search-box",
  placeholder = "Search company, ticker or fund…",
  autoFocus = false,
  showKbdHint = false,
  className = "",
}) {
  const search = useStockSearch({ onSelect, onManualEntry });

  return (
    <form className={`topbar-search ${className}`} role="search" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <IconSearch className="topbar-search-icon" />
      <label htmlFor={id} className="visually-hidden">
        Search company, ticker or fund
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        value={search.query}
        onChange={(e) => search.onQueryChange(e.target.value)}
        onFocus={() => search.query.trim().length >= 2 && search.setSearchOpen(true)}
      />
      {showKbdHint ? <kbd className="topbar-search-kbd">/</kbd> : null}
      <SearchResults search={search} />
    </form>
  );
}

function SearchResults({ search }) {
  if (!search.searchOpen) return null;

  let body;
  if (search.searchLoading) {
    body = <li className="search-status">Searching…</li>;
  } else if (search.searchError) {
    body = <li className="search-status">Live search unavailable right now. Try manual entry below.</li>;
  } else if (search.results.length === 0) {
    body = <li className="search-status">No matches yet — keep typing, or enter figures manually.</li>;
  } else {
    body = search.results.map((r, i) => (
      <li role="option" key={`${r.symbol}-${i}`}>
        <button type="button" className="search-result-btn" onClick={() => search.selectSecurity(r)}>
          <span className="result-name">{r.name}</span>
          <span className="result-meta">
            {r.symbol} · {r.exchange}
          </span>
        </button>
      </li>
    ));
  }

  return (
    <ul className="search-results" role="listbox" aria-label="Matching companies and funds">
      {body}
      <li className="search-manual-row">
        <button type="button" className="link-btn" onClick={() => search.enterManualEntry()}>
          Skip search — enter figures manually instead
        </button>
      </li>
    </ul>
  );
}
