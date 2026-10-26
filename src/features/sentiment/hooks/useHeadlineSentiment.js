import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { analyzeHeadlines, loadSentimentModel, selectSentiment } from "../model/sentimentSlice.js";
import { articleId, summarize } from "../lib/summarize.js";

// Sentiment for a list of headlines: loads the model if the user has opted
// in, scores any headlines not scored yet, and returns per-article results
// plus an aggregate summary.
export function useHeadlineSentiment(articles) {
  const dispatch = useDispatch();
  const { enabled, status, progress, error, results, inFlight } = useSelector(selectSentiment);

  useEffect(() => {
    if (enabled && status === "off") dispatch(loadSentimentModel());
  }, [enabled, status, dispatch]);

  useEffect(() => {
    if (!enabled || status !== "ready" || !articles?.length) return;
    const todo = articles.filter((a) => a.title && !results[articleId(a)] && !inFlight[articleId(a)]);
    if (todo.length) dispatch(analyzeHeadlines(todo));
  }, [enabled, status, articles, results, inFlight, dispatch]);

  const summary = useMemo(() => summarize(articles, results), [articles, results]);

  return { enabled, status, progress, error, resultsById: enabled ? results : {}, summary };
}
