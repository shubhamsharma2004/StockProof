import { formatNumber } from "../../../utils.js";
import DataNotAvailable from "../DataNotAvailable.jsx";

export default function ShareholdingTab({ nse }) {
  if (nse?.loading) {
    return (
      <div className="tab-panel">
        <section className="panel-card">
          <h2 className="panel-title">Shareholding Pattern</h2>
          <p className="panel-subtitle">Loading from NSE's latest regulatory filing…</p>
        </section>
      </div>
    );
  }

  const sh = nse?.shareholding;
  if (!sh) {
    return (
      <div className="tab-panel">
        <DataNotAvailable
          title="Shareholding Pattern — Data not available"
          description="This company's latest quarterly shareholding disclosure isn't in NSE's feed yet, or couldn't be matched to this symbol."
        />
      </div>
    );
  }

  const history = sh.history || [];

  return (
    <div className="tab-panel">
      <section className="panel-card">
        <h2 className="panel-title">Shareholding Pattern</h2>
        <p className="panel-subtitle">
          Promoter vs Public split from NSE's quarterly regulatory filing, quarter ended {sh.quarterEnd}. A further
          FII/DII breakdown within "Public" isn't available from this feed — only each company's full XBRL filing has
          that, which isn't parsed here.
        </p>

        <div className="snapshot-grid">
          <div className="snapshot-tile">
            <span className="snapshot-tile-label">Promoter Holding</span>
            <span className="snapshot-tile-value">{sh.promoterPct != null ? `${formatNumber(sh.promoterPct)}%` : "Data not available"}</span>
            <span className="snapshot-tile-source">NSE</span>
          </div>
          <div className="snapshot-tile">
            <span className="snapshot-tile-label">Public Holding</span>
            <span className="snapshot-tile-value">{sh.publicPct != null ? `${formatNumber(sh.publicPct)}%` : "Data not available"}</span>
            <span className="snapshot-tile-source">NSE</span>
          </div>
        </div>

        {history.length >= 2 ? (
          <>
            <h3 className="panel-subtitle" style={{ marginTop: 20, fontWeight: 700 }}>
              Quarter-over-quarter change
            </h3>
            <div className="ratios-table">
              <div className="ratios-table-head">
                <span>Quarter Ended</span>
                <span>Promoter %</span>
                <span>Public %</span>
              </div>
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <div className="ratios-table-row" key={h.quarter_end}>
                    <span>{h.quarter_end}</span>
                    <span>{h.promoter_pct != null ? `${formatNumber(h.promoter_pct)}%` : "—"}</span>
                    <span>{h.public_pct != null ? `${formatNumber(h.public_pct)}%` : "—"}</span>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="panel-subtitle" style={{ marginTop: 16 }}>
            Quarter-over-quarter change will appear here once a second quarterly filing has been observed — this app
            only tracks its own history forward from when this feature went live, rather than backfill it.
          </p>
        )}
      </section>
    </div>
  );
}
