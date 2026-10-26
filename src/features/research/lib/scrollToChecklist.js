export const CHECKLIST_ANCHOR_ID = "insight-checklist";

export function scrollToChecklist() {
  document.getElementById(CHECKLIST_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
