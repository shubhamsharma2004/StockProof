import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ipoMeta, ipoPath, navigateTo, PAGES, selectRegion, selectRouteParams, usePageMeta } from "../../ui/index.js";
import { MARKET_KEYS } from "../../../shared/config/markets.js";
import { formatDateTime } from "../../../shared/lib/format.js";
import { showToast } from "../../../shared/lib/toast.js";
import DataNotAvailable from "../../../shared/ui/DataNotAvailable.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import RangePills from "../../../shared/ui/RangePills.jsx";
import Tabs from "../../../shared/ui/Tabs.jsx";
import { IconResearch } from "../../../shared/ui/icons.jsx";
import { useGetIposQuery } from "../api/ipoApi.js";
import { useIpoBySlug } from "../hooks/useIpoBySlug.js";
import IpoCard from "./IpoCard.jsx";
import IpoDetailModal from "./IpoDetailModal.jsx";
import UsIpoCalendar from "./UsIpoCalendar.jsx";

const TABS = [
  { key: "open", label: "Open Now" },
  { key: "upcoming", label: "Upcoming" },
  { key: "closed", label: "Awaiting Listing" },
  { key: "listed", label: "Just Listed" },
];

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "EQ", label: "Mainboard" },
  { key: "SME", label: "SME" },
];

const EMPTY_LABELS = {
  open: "No IPOs are open for subscription right now.",
  upcoming: "No upcoming IPOs have been scheduled yet.",
  closed: "No IPOs are waiting to list right now.",
  listed: "No recently listed IPOs found.",
};

export default function IpoPage() {
  const region = useSelector(selectRegion);
  return region === MARKET_KEYS.US ? <UsIpoPage /> : <IndiaIpoPage />;
}

function UsIpoPage() {
  usePageMeta(PAGES.IPO);
  return (
    <div className="page-shell">
      <PageHeader
        label="IPO Analysis"
        title="IPO Analysis"
        subtitle="US IPOs from Finnhub — pricings from the past week and listings expected over the next 30 days."
      />
      <UsIpoCalendar />
    </div>
  );
}

function IndiaIpoPage() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("open");
  const [typeFilter, setTypeFilter] = useState("all");
  const { currentData, isFetching, isError } = useGetIposQuery(status);

  // The open IPO lives in the URL (/ipo/<slug>), so it can be shared and indexed.
  const { slug } = useSelector(selectRouteParams);
  const { ipo: selected, notFound } = useIpoBySlug(slug);
  usePageMeta(PAGES.IPO, selected ? { ...ipoMeta(selected), path: ipoPath(selected) } : undefined);

  // A link to one IPO opens on the tab it belongs to.
  const selectedStatus = selected?.status;
  useEffect(() => {
    if (selectedStatus) setStatus(selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    if (!notFound) return;
    showToast("That IPO is no longer in NSE's current lists.", "info");
    dispatch(navigateTo(PAGES.IPO));
  }, [notFound, dispatch]);

  const ipos = (currentData?.ipos || []).filter((i) => typeFilter === "all" || i.type === typeFilter);

  return (
    <div className="page-shell">
      <PageHeader
        label="IPO Analysis"
        title="IPO Analysis"
        subtitle="Every NSE mainboard and SME IPO, with live subscription and grey-market premium. Open any issue for its lot size, timeline, strengths and risks. Subscription and GMP show demand, not value; once a company lists, it gets the same fundamentals rating as any other stock."
      />

      <div className="panel-card">
        <div className="ipo-toolbar">
          <Tabs tabs={TABS} activeTab={status} onChange={setStatus} label="IPO stage" className="screener-tabs ipo-tabs" />
          <RangePills options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} label="Issue type" />
        </div>

        {currentData?.asOf ? <p className="screener-asof">As of {formatDateTime(currentData.asOf)}</p> : null}

        {isFetching && !currentData ? (
          <div className="ipo-card-grid">
            {[0, 1, 2].map((i) => (
              <div className="ipo-card ipo-card--skeleton" key={i}>
                <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                <div className="skeleton skeleton-line" style={{ width: "90%" }} />
                <div className="skeleton skeleton-line" style={{ width: "75%" }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <DataNotAvailable
            icon={<IconResearch width={30} height={30} />}
            title="IPO data unavailable right now"
            description="The IPO feed couldn't be reached. Try again shortly."
          />
        ) : ipos.length === 0 ? (
          <p className="panel-subtitle" style={{ padding: "16px 0" }}>
            {typeFilter === "all" ? EMPTY_LABELS[status] : `No ${typeFilter === "EQ" ? "mainboard" : "SME"} IPOs in this list.`}
          </p>
        ) : (
          <div className="ipo-card-grid">
            {ipos.map((ipo) => (
              <IpoCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}
      </div>

      {selected ? <IpoDetailModal ipo={selected} onClose={() => dispatch(navigateTo(PAGES.IPO))} /> : null}
    </div>
  );
}
