import { useState } from "react";
import { IconExternalLink } from "./icons.jsx";

function timeAgo(ms) {
  if (!ms) return null;
  const diffMin = Math.round((Date.now() - ms) / 60000);
  if (diffMin < 60) return `${Math.max(diffMin, 1)}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

// Thumbnails come from third-party sites; a broken one is simply hidden.
function Thumbnail({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img className="news-item-thumb" src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

// Articles may carry an optional `image` and `summary` (Finnhub does; Yahoo
// and Google News don't). `renderExtra(article)` lets a caller attach
// something to each row (e.g. a sentiment badge) without this list knowing.
export default function NewsArticleList({ articles, emptyLabel, renderExtra }) {
  if (!articles || articles.length === 0) {
    return <p className="panel-subtitle" style={{ padding: "16px 0" }}>{emptyLabel || "No articles available right now."}</p>;
  }

  return (
    <ul className="news-list">
      {articles.map((a) => (
        <li key={a.uuid || a.link}>
          <a className="news-item" href={a.link} target="_blank" rel="noreferrer noopener">
            <span className="news-item-body">
              <span className="news-item-title">{a.title}</span>
              {a.summary ? <span className="news-item-summary">{a.summary}</span> : null}
              <span className="news-item-meta">
                {renderExtra ? renderExtra(a) : null}
                {a.publisher ? <span>{a.publisher}</span> : null}
                {a.publishedAt ? <span>{timeAgo(a.publishedAt)}</span> : null}
                <IconExternalLink width={12} height={12} />
              </span>
            </span>
            <Thumbnail src={a.image} />
          </a>
        </li>
      ))}
    </ul>
  );
}
