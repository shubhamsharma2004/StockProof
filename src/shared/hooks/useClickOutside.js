import { useEffect } from "react";

// Click-outside-to-close, not onMouseLeave — popovers sit below their
// trigger with a small gap, so any wobble in the mouse path was dismissing
// them before the click landed.
export function useClickOutside(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [ref, onOutside, active]);
}
