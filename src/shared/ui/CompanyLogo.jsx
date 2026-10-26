import { useState } from "react";
import { companyLogoUrl } from "../lib/companyLogo.js";

function stringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

// Uses `src` when the data source supplies a logo URL; otherwise tries a
// Brandfetch logo keyed by the company's website domain. If neither exists
// or the image fails to load, it falls back to a generated letter avatar —
// never a broken image.
export default function CompanyLogo({ symbol, website, src, size = 40, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = src || companyLogoUrl(website, { symbol, size: size * 2 });
  const style = { width: size, height: size };

  if (logoUrl && !imgFailed) {
    return (
      <span className={`company-logo company-logo--image ${className}`} style={style}>
        <img src={logoUrl} alt="" width={size} height={size} onError={() => setImgFailed(true)} />
      </span>
    );
  }

  const seed = symbol || "SP";
  const hue = stringToHue(seed);
  const initials = seed.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "SP";
  return (
    <span
      className={`company-logo ${className}`}
      style={{ ...style, fontSize: size * 0.36, background: `hsl(${hue} 70% 94%)`, color: `hsl(${hue} 55% 32%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
