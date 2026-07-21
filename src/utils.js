export function debounce(fn, delayMs) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

export function readLocalJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// sessionStorage clears when the browser/tab closes — used for guest-mode
// state so a guest session doesn't quietly persist forever like signed-in
// data would.
export function readSessionJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeSessionJSON(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `₹${formatNumber(value)}`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}%`;
}

export function formatVolume(value) {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${formatNumber(value / 1e7, 2)}Cr`;
  if (abs >= 1e5) return `${formatNumber(value / 1e5, 2)}L`;
  if (abs >= 1e3) return `${formatNumber(value / 1e3, 1)}K`;
  return formatNumber(value, 0);
}

export function formatMarketCap(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `₹${formatNumber(value, 0)} Cr`;
}

let toastTimer = null;
export function showToast(message, tone = "info") {
  const region = document.getElementById("toast-region");
  if (!region) return;
  region.textContent = "";
  const el = document.createElement("div");
  el.className = `toast toast--${tone}`;
  el.textContent = message;
  region.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add("toast--leaving");
    setTimeout(() => el.remove(), 250);
  }, 4200);
}

export function formatDateTime(date) {
  if (!date) return null;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

