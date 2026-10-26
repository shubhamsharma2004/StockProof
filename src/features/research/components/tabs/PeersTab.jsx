import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { useQuotes } from "../../../market-data/index.js";
import { useGetUsPeersQuery } from "../../api/researchApi.js";
import { findPeerSymbols } from "../../lib/peerMap.js";
import { selectFetchedData, selectIsIndian, selectMoney, selectSelected } from "../../model/selectors.js";
import { buildSymbol } from "../../../../shared/lib/symbols.js";
import { formatNumber } from "../../../../shared/lib/format.js";
import DataNotAvailable from "../../../../shared/ui/DataNotAvailable.jsx";

const NOT_AVAILABLE = "—";
const MAX_PEERS = 5;

// Peer candidates: Indian stocks use the curated industry map (Yahoo's
// industry tag); US stocks use Finnhub's same-industry peer list.
function usePeerCandidates(selected, industry, isIndian) {
  const ownSymbol = selected?.symbol || "";
  const usPeers = useGetUsPeersQuery(!isIndian && ownSymbol ? ownSymbol : skipToken);
  const usList = usPeers.data;

  const candidates = useMemo(() => {
    if (isIndian) {
      return industry ? findPeerSymbols(industry, ownSymbol, MAX_PEERS + 1).map((s) => ({ bare: s, full: buildSymbol(s, "NSE") })) : [];
    }
    return (usList || []).slice(0, MAX_PEERS + 1).map((s) => ({ bare: s, full: s }));
  }, [isIndian, industry, ownSymbol, usList]);

  return { candidates, listLoading: !isIndian && usPeers.isFetching };
}

export default function PeersTab() {
  const selected = useSelector(selectSelected);
  const fetchedData = useSelector(selectFetchedData);
  const isIndian = useSelector(selectIsIndian);
  const money = useSelector(selectMoney);
  const industry = fetchedData?.industry || null;
  const ownSymbol = selected?.symbol || "";

  // A few extra candidates are fetched because some won't have ratios.
  const { candidates, listLoading } = usePeerCandidates(selected, industry, isIndian);
  const quotes = useQuotes(candidates.map((c) => c.full));
  const loading = listLoading || candidates.some((c) => quotes[c.full]?.isLoading);
  const peers = candidates
    .map((c) => {
      const d = quotes[c.full]?.data;
      return d && (d.pe_ratio != null || d.pb_ratio != null) ? { ...d, symbol: c.bare } : null;
    })
    .filter(Boolean)
    .slice(0, MAX_PEERS);
  const groupLabel = industry || "the same industry";

  if (isIndian && !industry) {
    return (
      <div className="tab-panel">
        <DataNotAvailable
          title="Peer Comparison — Data not available"
          description="This stock's industry isn't in the live data feed, so peers can't be matched."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tab-panel">
        <section className="panel-card">
          <h2 className="panel-title">Peer Comparison</h2>
          <p className="panel-subtitle">Loading peers in {groupLabel}…</p>
        </section>
      </div>
    );
  }

  if (peers.length < 2) {
    return (
      <div className="tab-panel">
        <DataNotAvailable
          title="Peer Comparison — Not enough data"
          description={`Fewer than two other companies in ${groupLabel} have enough live data to compare right now, so this section stays empty rather than show an incomplete comparison.`}
        />
      </div>
    );
  }

  const rows = [{ ...fetchedData, symbol: ownSymbol, name: selected.name, isSelf: true }, ...peers];

  return (
    <div className="tab-panel">
      <section className="panel-card">
        <h2 className="panel-title">Peer Comparison</h2>
        <p className="panel-subtitle">
          {isIndian ? `Other companies tagged "${industry}" by the live data feed` : "Same-industry US companies (Finnhub)"}, with the
          same ratios shown for this stock. Real, current figures only — no industry averages are estimated.
        </p>
        <div className="peers-table-wrap">
          <table className="peers-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Price</th>
                <th>P/E</th>
                <th>P/B</th>
                <th>ROE</th>
                <th>Net Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.symbol} className={r.isSelf ? "peers-row--self" : ""}>
                  <td>
                    <strong>{r.symbol}</strong>
                    {r.isSelf ? <span className="tag tag--sm">This stock</span> : null}
                  </td>
                  <td>{r.last_price != null ? money.price(r.last_price) : NOT_AVAILABLE}</td>
                  <td>{r.pe_ratio != null ? formatNumber(r.pe_ratio) : NOT_AVAILABLE}</td>
                  <td>{r.pb_ratio != null ? formatNumber(r.pb_ratio) : NOT_AVAILABLE}</td>
                  <td>{r.return_on_equity != null ? `${formatNumber(r.return_on_equity)}%` : NOT_AVAILABLE}</td>
                  <td>{r.profit_margin != null ? `${formatNumber(r.profit_margin)}%` : NOT_AVAILABLE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
