import { IconExternalLink } from "../icons.jsx";

function timeAgo(ms) {
  if (!ms) return null;
  const diffMin = Math.round((Date.now() - ms) / 60000);
  if (diffMin < 60) return `${Math.max(diffMin, 1)}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function NewsArticleList({ articles, emptyLabel }) {
  if (!articles || articles.length === 0) {
    return <p className="panel-subtitle" style={{ padding: "16px 0" }}>{emptyLabel || "No articles available right now."}</p>;
  }

  return (
    <ul className="news-list">
      {articles.map((a) => (
        <li key={a.uuid || a.link}>
          <a className="news-item" href={a.link} target="_blank" rel="noreferrer noopener">
            <span className="news-item-title">{a.title}</span>
            <span className="news-item-meta">
              {a.publisher ? <span>{a.publisher}</span> : null}
              {a.publishedAt ? <span>{timeAgo(a.publishedAt)}</span> : null}
              <IconExternalLink width={12} height={12} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
