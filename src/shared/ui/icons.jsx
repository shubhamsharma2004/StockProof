// A small hand-authored line-icon set (24x24, stroke-based, currentColor) so
// the whole app shares one consistent visual language without pulling in an
// icon library dependency. Kept intentionally geometric/simple.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function IconDashboard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="4.5" rx="1.6" />
      <rect x="13.5" y="10" width="7.5" height="11" rx="1.6" />
      <rect x="3" y="13" width="7.5" height="8" rx="1.6" />
    </svg>
  );
}
export function IconResearch(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2.2" />
      <path d="M7.5 15l3-4 2.5 2.5L17 8" />
    </svg>
  );
}
export function IconWatchlist(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function IconPortfolio(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7.5" width="18" height="13" rx="2" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
    </svg>
  );
}
export function IconScreener(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h18l-6.5 8v6l-5 3v-9L3 4z" />
    </svg>
  );
}
export function IconMarket(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.8-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}
export function IconNews(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4.5" width="15" height="15" rx="1.6" />
      <path d="M18 8.5h2.2A1.3 1.3 0 0 1 21.5 9.8v9A1.7 1.7 0 0 1 19.8 20.5H7" />
      <path d="M6.5 8.5h8M6.5 11.5h8M6.5 14.5h5" />
    </svg>
  );
}
export function IconAlerts(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c-3 0-4.6 2.3-4.6 5.6 0 4.8-1.9 5.9-1.9 6.9 0 .6.5 1 1.1 1h11c.6 0 1.1-.4 1.1-1 0-1-1.9-2.1-1.9-6.9 0-3.3-1.6-5.6-4.6-5.6z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}
export function IconSaved(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.8" />
      <path d="M8.5 3v6l3-2.2L14.5 9V3" />
    </svg>
  );
}
export function IconUpgrade(props) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M4 8l3.2 3L12 5l4.8 6L20 8l-1.6 10H5.6L4 8z" />
    </svg>
  );
}
export function IconFeedback(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16v11H8l-4 4V5z" />
    </svg>
  );
}
export function IconHelp(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.5 2.5 0 1 1 3.6 2.2c-.9.5-1.1.9-1.1 1.8" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
export function IconBell(props) {
  return <IconAlerts {...props} />;
}
export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
export function IconChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
export function IconChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}
export function IconTrendUp(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 16l6-6 4 4 8-9" />
      <path d="M15 5h6v6" />
    </svg>
  );
}
export function IconTrendDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8l6 6 4-4 8 9" />
      <path d="M15 19h6v-6" />
    </svg>
  );
}
export function IconCheckCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </svg>
  );
}
export function IconWarning(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4l9.5 16.5h-19L12 4z" />
      <path d="M12 10.5v4" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}
export function IconExternalLink(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      <path d="M14 4h6v6M20 4l-9 9" />
    </svg>
  );
}
export function IconStarFull(props) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  );
}
export function IconStarHalf(props) {
  return (
    <svg {...base} {...props}>
      <defs>
        <linearGradient id="star-half-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5-4.8-4.6 6.6-.9L12 2.5z"
        fill="url(#star-half-grad)"
      />
    </svg>
  );
}
export function IconStarEmpty(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  );
}
export function IconBuilding(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3" width="14" height="18" rx="1.4" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" strokeWidth="2.4" />
    </svg>
  );
}
export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}
export function IconGrowth(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 16l3-4 3 2.5L19 7" />
    </svg>
  );
}
export function IconValuation(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.5 9.8c0-1 1-1.8 2.5-1.8s2.5.8 2.5 1.7c0 2.4-5 1.4-5 3.8 0 1 1 1.8 2.5 1.8s2.5-.8 2.5-1.8" />
    </svg>
  );
}
export function IconHealth(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.9c0 5.6-7.5 10.2-7.5 10.2z" />
      <path d="M8 12h2l1.2-2.5L12.8 14 14 12h2" />
    </svg>
  );
}
export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
export function IconIpo(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5c2.5 2.2 4 5.6 4 9 0 2-.6 3.7-1.2 5l-2.8 3.5-2.8-3.5c-.6-1.3-1.2-3-1.2-5 0-3.4 1.5-6.8 4-9z" />
      <circle cx="12" cy="10.5" r="1.7" />
      <path d="M8.5 16.5L6 19M15.5 16.5L18 19" />
    </svg>
  );
}
export function IconDownload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12M7.5 10.5L12 15l4.5-4.5" />
      <path d="M4.5 17.5v2A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </svg>
  );
}
export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
export function IconLayers(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}
export function IconBook(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
    </svg>
  );
}
export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  );
}
export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}
export function IconLogout(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </svg>
  );
}
export function IconArrowUpSmall(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
export function IconArrowDownSmall(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}
export function IconSparkle(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />
    </svg>
  );
}
