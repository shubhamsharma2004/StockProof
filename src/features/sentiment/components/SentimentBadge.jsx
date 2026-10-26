const LABELS = { positive: "Positive", negative: "Negative", neutral: "Neutral" };

export default function SentimentBadge({ result }) {
  if (!result) return null;
  const percent = Math.round(result.confidence * 100);
  return (
    <span
      className={`sentiment-badge sentiment-badge--${result.label}`}
      title={`FinBERT: ${Math.round(result.positive * 100)}% positive · ${Math.round(result.neutral * 100)}% neutral · ${Math.round(result.negative * 100)}% negative`}
    >
      {LABELS[result.label]} {percent}%
    </span>
  );
}
