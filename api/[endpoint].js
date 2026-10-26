// Vercel serverless adapter for the market-data proxy: /api/<endpoint>?…
// runs the same host-independent router the Vite dev server uses
// (server/vitePlugin.js), so local and deployed behaviour match.
import { handleApi } from "../server/router.js";

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const endpoint = url.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
  const { status, body, maxAge } = await handleApi(endpoint, url.searchParams);

  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // Vercel's CDN honours s-maxage, so repeat requests skip the function.
  if (status === 200 && maxAge) res.setHeader("Cache-Control", `public, max-age=${maxAge}, s-maxage=${maxAge}`);
  res.end(JSON.stringify(body));
}
