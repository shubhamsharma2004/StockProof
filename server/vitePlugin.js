import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { handleApi } from "./router.js";
import { injectMeta, metaForPath, originFromHeaders, renderRobots, renderSitemap } from "./seo.js";

const PREFIX = "/api/";

function middleware(req, res, next) {
  if (!req.url?.startsWith(PREFIX)) return next();
  const url = new URL(req.url, "http://localhost");
  const endpoint = url.pathname.slice(PREFIX.length).replace(/\/+$/, "");

  handleApi(endpoint, url.searchParams).then(({ status, body, maxAge }) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (status === 200 && maxAge) res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    res.end(JSON.stringify(body));
  }, next);
}

// /sitemap.xml and /robots.txt — on Vercel these are rewrites to api/seo.js.
function seoFilesMiddleware(req, res, next) {
  const path = req.url?.split("?")[0];
  if (path !== "/sitemap.xml" && path !== "/robots.txt") return next();
  const origin = originFromHeaders(req.headers);
  Promise.resolve(path === "/sitemap.xml" ? renderSitemap(origin) : renderRobots(origin)).then((body) => {
    res.setHeader("Content-Type", path === "/sitemap.xml" ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8");
    res.end(body);
  }, next);
}

// Preview serves the built index.html as-is, so fill in each page's tags here.
function previewPageMiddleware(outDir) {
  return (req, res, next) => {
    if (req.method !== "GET" || !req.headers.accept?.includes("text/html")) return next();
    const path = req.url.split("?")[0];
    metaForPath(path).then(async (meta) => {
      if (!meta) return next();
      const html = await readFile(resolve(outDir, "index.html"), "utf8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(injectMeta(html, meta, originFromHeaders(req.headers)));
    }, next);
  };
}

// Serves the market-data API from the Vite server itself, on the same
// origin as the app — `npm run dev` and `npm run preview` need nothing else
// running and no paid backend.
export function stockproofApi() {
  return {
    name: "stockproof-api",
    configureServer(server) {
      server.middlewares.use(middleware);
      server.middlewares.use(seoFilesMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
      server.middlewares.use(seoFilesMiddleware);
      server.middlewares.use(previewPageMiddleware(resolve(server.config.root, server.config.build.outDir)));
    },
    // Dev: the same per-page title and preview tags the deployed site serves.
    transformIndexHtml: {
      order: "post",
      async handler(html, ctx) {
        if (!ctx.server || !ctx.originalUrl) return html;
        const meta = await metaForPath(ctx.originalUrl.split("?")[0]);
        const origin = ctx.server.resolvedUrls?.local?.[0]?.replace(/\/$/, "") || "http://localhost:5173";
        return meta ? injectMeta(html, meta, origin) : html;
      },
    },
  };
}
