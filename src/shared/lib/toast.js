// Imperative on purpose: toasts are fire-and-forget UI feedback triggered
// from thunks, and keeping them out of the Redux store means no reducer
// ever has to know about DOM timers.
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
