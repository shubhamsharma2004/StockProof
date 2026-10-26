export const MIN_HEADLINES_FOR_MOOD = 3;

export function articleId(article) {
  return article.uuid || article.link;
}

// Net tone of one headline in [-1, 1]: positive probability minus negative.
export function netTone(result) {
  return result.positive - result.negative;
}

// Aggregate tone across a set of headlines. The mood label is a plain
// description of the headlines' tone — not a view on the stock itself.
export function summarize(articles, resultsById) {
  const results = (articles || []).map((a) => resultsById[articleId(a)]).filter(Boolean);
  const counts = { positive: 0, negative: 0, neutral: 0 };
  for (const r of results) counts[r.label] += 1;
  const net = results.length ? results.reduce((sum, r) => sum + netTone(r), 0) / results.length : 0;

  let mood;
  if (results.length < MIN_HEADLINES_FOR_MOOD) mood = { label: "Too few headlines", tone: "muted" };
  else if (net >= 0.25) mood = { label: "Mostly positive", tone: "positive" };
  else if (net >= 0.08) mood = { label: "Leaning positive", tone: "positive" };
  else if (net <= -0.25) mood = { label: "Mostly negative", tone: "negative" };
  else if (net <= -0.08) mood = { label: "Leaning negative", tone: "negative" };
  else mood = { label: "Mixed / neutral", tone: "neutral" };

  return { analyzed: results.length, total: (articles || []).length, counts, net, mood };
}
