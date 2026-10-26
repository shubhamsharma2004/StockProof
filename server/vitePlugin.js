import { handleApi } from "./router.js";

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

// Serves the market-data API from the Vite server itself, on the same
// origin as the app — `npm run dev` and `npm run preview` need nothing else
// running and no paid backend.
export function stockproofApi() {
  return {
    name: "stockproof-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
