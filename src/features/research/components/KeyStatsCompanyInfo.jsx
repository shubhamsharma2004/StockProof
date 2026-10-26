import { formatVolume, formatVolumeIntl, formatNumber } from "../../../shared/lib/format.js";
import { IconExternalLink } from "../../../shared/ui/icons.jsx";

const NOT_AVAILABLE = "Data not available";

function Row({ label, value }) {
  return (
    <div className="kv-row">
      <span className="kv-label">{label}</span>
      <span className={`kv-value ${value == null ? "is-muted" : ""}`}>{value ?? NOT_AVAILABLE}</span>
    </div>
  );
}

export default function KeyStatsCompanyInfo({ fd, selected, money, isIndian }) {
  const volume = isIndian ? formatVolume : formatVolumeIntl;
  return (
    <div className="two-col-panels">
      <section className="panel-card">
        <h2 className="panel-title">Key Statistics</h2>
        <div className="kv-list">
          <Row label="Open" value={fd.day_open != null ? money.price(fd.day_open) : null} />
          <Row label="High" value={fd.day_high != null ? money.price(fd.day_high) : null} />
          <Row label="Low" value={fd.day_low != null ? money.price(fd.day_low) : null} />
          <Row label="Prev. Close" value={fd.prev_close != null ? money.price(fd.prev_close) : null} />
          <Row label="Volume" value={fd.volume != null ? volume(fd.volume) : null} />
          <Row label="Avg. Volume" value={fd.avg_volume != null ? volume(fd.avg_volume) : null} />
          <Row label="P/E Ratio (TTM)" value={fd.pe_ratio != null ? formatNumber(fd.pe_ratio) : null} />
          <Row label="Beta (5Y)" value={fd.beta != null ? formatNumber(fd.beta) : null} />
        </div>
      </section>

      <section className="panel-card">
        <h2 className="panel-title">Company Info</h2>
        <div className="kv-list">
          <Row label="CEO" value={fd.ceo} />
          <Row
            label="Website"
            value={
              fd.website ? (
                <a href={fd.website} target="_blank" rel="noreferrer noopener" className="kv-link">
                  {fd.website.replace(/^https?:\/\//, "")} <IconExternalLink width={12} height={12} />
                </a>
              ) : null
            }
          />
          <Row label="Employees" value={fd.employees != null ? formatNumber(fd.employees, 0) : null} />
          <Row label="Headquarters" value={fd.headquarters} />
          <Row label="Exchange" value={selected?.exchange === "US" ? "NYSE / Nasdaq" : selected?.exchange} />
        </div>
      </section>
    </div>
  );
}
