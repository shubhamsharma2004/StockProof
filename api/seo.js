// Vercel function behind the rewrites in vercel.json: /sitemap.xml,
// /robots.txt, and the shareable detail pages (/ipo/…, /stock/…, /guide/…),
// which get index.html with that page's title and preview tags filled in.
// The dev/preview server does the same through server/vitePlugin.js.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { injectMeta, metaForPath, originFromHeaders, renderRobots, renderSitemap } from "../server/seo.js";

let indexHtml = null;

async function loadIndexHtml(origin) {
  if (indexHtml) return indexHtml;
  try {
    // Bundled with the function via `includeFiles` in vercel.json.
    indexHtml = await readFile(join(process.cwd(), "dist", "index.html"), "utf8");
  } catch {
    // Otherwise fetch the deployed static copy (served directly, not rewritten).
    const r = await fetch(`${origin}/index.html`);
    if (!r.ok) throw new Error(`index.html responded ${r.status}`);
    indexHtml = await r.text();
  }
  return indexHtml;
}

function send(res, contentType, body, cacheControl) {
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", cacheControl);
  res.end(body);
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const origin = originFromHeaders(req.headers);
  const kind = url.searchParams.get("kind");

  try {
    if (kind === "sitemap") return send(res, "application/xml; charset=utf-8", await renderSitemap(origin), "public, max-age=0, s-maxage=3600");
    if (kind === "robots") return send(res, "text/plain; charset=utf-8", renderRobots(origin), "public, max-age=0, s-maxage=86400");

    const html = await loadIndexHtml(origin);
    const meta = await metaForPath(url.searchParams.get("path") || "/");
    // Browsers always revalidate the HTML; Vercel's CDN keeps it for 5 minutes.
    return send(res, "text/html; charset=utf-8", meta ? injectMeta(html, meta, origin) : html, "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Page unavailable: ${err?.message || "unknown error"}`);
  }
}
