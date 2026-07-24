import { useEffect, useState } from "react";
import { fetchStock, buildSymbol } from "../../../api.js";
import { findPeerSymbols } from "../../../peerMap.js";
import { formatCurrency, formatNumber } from "../../../utils.js";
import DataNotAvailable from "../DataNotAvailable.jsx";

const NOT_AVAILABLE = "—";

export default function PeersTab({ stockData }) {
  const { selected, fetchedData } = stockData;
  const industry = fetchedData?.industry || null;
  const ownSymbol = selected?.symbol || "";

  const [state, setState] = useState({ loading: true, peers: [] });

  useEffect(() => {
    let cancelled = false;
    if (!industry) {
      setState({ loading: false, peers: [] });
      return;
    }
    const candidates = findPeerSymbols(industry, ownSymbol, 6);
    if (candidates.length === 0) {
      setState({ loading: false, peers: [] });
      return;
    }
    setState({ loading: true, peers: [] });
    Promise.all(
      candidates.map(async (sym) => {
        const res = await fetchStock(buildSymbol(sym, "NSE"));
        if (!res.ok) return null;
        const d = res.data;
        if (d.pe_ratio == null && d.pb_ratio == null) return null;
        return { symbol: sym, ...d };
      })
    ).then((results) => {
      if (cancelled) return;
      setState({ loading: false, peers: results.filter(Boolean).slice(0, 5) });
    });
    return () => {
      cancelled = true;
    };
  }, [industry, ownSymbol]);

  if (!industry) {
    return (
      <div className="tab-panel">
        <DataNotAvailable
          title="Peer Comparison — Data not available"
          description="This stock's industry isn't in the live data feed, so peers can't be matched."
        />
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="tab-panel">
        <section className="panel-card">
          <h2 className="panel-title">Peer Comparison</h2>
          <p className="panel-subtitle">Loading peers in {industry}…</p>
        </section>
      </div>
    );
  }

  if (state.peers.length < 2) {
    return (
      <div className="tab-panel">
        <DataNotAvailable
          title="Peer Comparison — Not enough data"
          description={`Fewer than two other companies in "${industry}" have enough live data to compare right now, so this section stays empty rather than show an incomplete comparison.`}
        />
      </div>
    );
  }

  const rows = [
    { symbol: ownSymbol, name: selected.name, ...fetchedData, isSelf: true },
    ...state.peers,
  ];

  return (
    <div className="tab-panel">
      <section className="panel-card">
        <h2 className="panel-title">Peer Comparison</h2>
        <p className="panel-subtitle">
          Other companies tagged "{industry}" by the live data feed, with the same ratios shown for this stock. Real,
          current figures only — no industry averages are estimated.
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
                  <td>{r.last_price != null ? formatCurrency(r.last_price) : NOT_AVAILABLE}</td>
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
