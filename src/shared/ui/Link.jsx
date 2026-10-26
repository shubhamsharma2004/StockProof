import { useDispatch } from "react-redux";
import { pathRequested } from "../model/events.js";

// An in-app link: a real <a href>, so it can be crawled, copied and opened in
// a new tab, that navigates in place on a plain click.
export default function Link({ to, onClick, children, ...rest }) {
  const dispatch = useDispatch();
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        dispatch(pathRequested(to));
      }}
    >
      {children}
    </a>
  );
}
