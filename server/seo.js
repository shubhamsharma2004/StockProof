// Search and link-preview support, host-independent like router.js:
//   - /sitemap.xml and /robots.txt, built from live IPO lists + the glossary
//   - index.html with a page's own <title> and preview tags filled in, for
//     crawlers that don't run JavaScript (WhatsApp, X, LinkedIn previews).
// Paths and copy come from the same modules the app uses, so they match.
import { GLOSSARY } from "../src/features/guide/lib/guideContent.js";
import { DEFAULT_DESCRIPTION, ipoMeta, PAGE_META, stockMeta, termMeta } from "../src/features/ui/lib/pageMeta.js";
import { ipoPath, ipoSlug, pathFor, pathForPage, routeFromPath, stockPath, termPath, termSlug } from "../src/features/ui/lib/routes.js";
import { PAGES, PUBLIC_PAGES } from "../src/features/ui/model/pages.js";
import { MARKETS } from "../src/shared/config/markets.js";
import { getIpoList } from "./nse.js";

const IPO_STATUSES = ["open", "upcoming", "closed", "listed"];

// A slow upstream must never hold up a page load — past this, the page goes
// out with the default tags instead.
const META_TIMEOUT_MS = 2500;

async function allIpos() {
  const lists = await Promise.allSettled(IPO_STATUSES.map(getIpoList));
  return lists.flatMap((r) => (r.status === "fulfilled" ? r.value.ipos : []));
}

export function originFromHeaders(headers) {
  const host = headers["x-forwarded-host"] || headers.host || "localhost";
  const proto = headers["x-forwarded-proto"] || (host.startsWith("localhost") ? "http" : "https");
  return `${String(proto).split(",")[0]}://${String(host).split(",")[0]}`;
}

const escapeXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function renderSitemap(origin) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    ...[...PUBLIC_PAGES].map((page) => ({ path: pathForPage(page), changefreq: page === PAGES.IPO ? "daily" : "weekly" })),
    ...(await allIpos()).map((ipo) => ({ path: ipoPath(ipo), changefreq: "daily", lastmod: today })),
    ...[...MARKETS.IN.popular, ...MARKETS.US.popular].map((s) => ({ path: stockPath(s), changefreq: "daily" })),
    ...GLOSSARY.map((t) => ({ path: termPath(t.term), changefreq: "monthly" })),
  ];
  const seen = new Set();
  const urls = entries
    .filter((e) => !seen.has(e.path) && seen.add(e.path))
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(origin + e.path)}</loc>\n${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ""}    <changefreq>${e.changefreq}</changefreq>\n  </url>`
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function renderRobots(origin) {
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
}

async function findMeta(pathname) {
  const route = routeFromPath(pathname);
  if (!route) return null;
  if (route.security) return { ...stockMeta(route.security), path: stockPath(route.security) };
  if (route.page === PAGES.IPO && route.params.slug) {
    const ipo = (await allIpos()).find((i) => ipoSlug(i) === route.params.slug);
    if (ipo) return { ...ipoMeta(ipo), path: ipoPath(ipo) };
  }
  if (route.page === PAGES.GUIDE && route.params.term) {
    const term = GLOSSARY.find((t) => termSlug(t.term) === route.params.term);
    if (term) return { ...termMeta(term), path: termPath(term.term) };
  }
  const page = PAGE_META[route.page];
  return { title: page.title, description: page.description || DEFAULT_DESCRIPTION, path: pathFor(route.page) };
}

// { title, description, path } for a known path, else null (unknown path,
// or the lookup was too slow).
export function metaForPath(pathname) {
  return Promise.race([
    findMeta(pathname).catch(() => null),
    new Promise((resolve) => setTimeout(() => resolve(null), META_TIMEOUT_MS)),
  ]);
}

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMetaContent(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  return html.replace(re, (_m, open, close) => open + escapeAttr(value) + close);
}

// index.html ships without canonical / og:url — its origin isn't known at
// build time — so they're added here (and by usePageMeta in the browser).
export function injectMeta(html, { title, description, path }, origin) {
  const url = origin + path;
  let out = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttr(title)}</title>`);
  out = setMetaContent(out, "name", "description", description);
  out = setMetaContent(out, "property", "og:title", title);
  out = setMetaContent(out, "property", "og:description", description);
  out = setMetaContent(out, "property", "og:image", `${origin}/og-image.png`);
  out = setMetaContent(out, "name", "twitter:title", title);
  out = setMetaContent(out, "name", "twitter:description", description);
  out = setMetaContent(out, "name", "twitter:image", `${origin}/og-image.png`);
  return out.replace(
    "</head>",
    () => `  <link rel="canonical" href="${escapeAttr(url)}" />\n    <meta property="og:url" content="${escapeAttr(url)}" />\n  </head>`
  );
}
