import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { signOut } from "../features/auth/index.js";
import { useClickOutside } from "../shared/hooks/useClickOutside.js";
import { IconChevronDown, IconLogout } from "../shared/ui/icons.jsx";

function displayNameFor(user) {
  if (user.displayName) return user.displayName;
  return (user.email || "Account").split("@")[0];
}

export default function UserMenu({ user }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(menuRef, close, open);

  const name = displayNameFor(user);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="user-menu" ref={menuRef}>
      <button type="button" className="user-menu-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        {user.photoURL ? (
          <img className="avatar" src={user.photoURL} alt="" width={40} height={40} referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar avatar--initial">{initial}</span>
        )}
        <span className="user-menu-name">{name}</span>
        <IconChevronDown width={18} height={18} className={`user-menu-chevron ${open ? "is-open" : ""}`} />
      </button>
      {open ? (
        <div className="user-menu-panel" role="menu">
          <p className="user-menu-email" title={user.email}>
            {user.email}
          </p>
          <button
            type="button"
            role="menuitem"
            className="btn btn-ghost btn-sm btn-full"
            onClick={() => {
              close();
              dispatch(signOut());
            }}
          >
            <IconLogout width={16} height={16} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
