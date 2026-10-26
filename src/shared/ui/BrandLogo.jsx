import markUrl from "../../assets/stockproof-mark.svg";

// The Stockproof logo: the icon from assets/stockproof-logo.svg plus the
// wordmark as live text, so it uses the app font and stays readable in
// dark mode (the SVG's own wordmark is fixed near-black text).
export default function BrandLogo({ size = 34, showWordmark = true, className = "" }) {
  return (
    <span className={`brand-logo ${className}`}>
      <img src={markUrl} alt="" width={size} height={size} />
      {showWordmark ? (
        <span className="brand-wordmark">
          Stock<span className="brand-wordmark-accent">proof</span>
        </span>
      ) : null}
    </span>
  );
}

export { markUrl };
