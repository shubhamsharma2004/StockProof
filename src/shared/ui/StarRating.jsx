import { IconStarFull, IconStarHalf, IconStarEmpty } from "./icons.jsx";

export default function StarRating({ value, size = 16 }) {
  if (value == null) {
    return (
      <span className="star-rating star-rating--empty">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStarEmpty key={i} width={size} height={size} />
        ))}
      </span>
    );
  }
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="star-rating" style={{ color: "var(--gold)" }}>
      {Array.from({ length: full }).map((_, i) => (
        <IconStarFull key={`f${i}`} width={size} height={size} />
      ))}
      {half ? <IconStarHalf width={size} height={size} /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <IconStarEmpty key={`e${i}`} width={size} height={size} />
      ))}
    </span>
  );
}
