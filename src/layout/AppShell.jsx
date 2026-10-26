import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthModal } from "../features/auth/index.js";
import { navClosed, selectNavOpen, selectPage } from "../features/ui/index.js";
import { TickerTape } from "../features/ticker/index.js";
import { PAGE_COMPONENTS } from "./pageRegistry.js";
import Sidebar from "./Sidebar.jsx";
import SiteFooter from "./SiteFooter.jsx";
import Topbar from "./Topbar.jsx";
import "./layout.css";

export default function AppShell() {
  const dispatch = useDispatch();
  const page = useSelector(selectPage);
  const navOpen = useSelector(selectNavOpen);
  const Page = PAGE_COMPONENTS[page] || PAGE_COMPONENTS.dashboard;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div className="app-frame">
      <div className="app-shell">
        <Sidebar />
        <div className="shell-main">
          <TickerTape />
          <Topbar />
          <main className="shell-content">
            <Page />
          </main>
        </div>
      </div>
      {/* Full width, below both columns: the sticky sidebar scrolls away with
          the page here instead of sitting beside the footer. */}
      <SiteFooter />
      {navOpen ? <div className="nav-scrim" onClick={() => dispatch(navClosed())} /> : null}
      <AuthModal />
    </div>
  );
}
