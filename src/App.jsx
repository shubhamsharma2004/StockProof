import { useEffect, useState } from "react";
import { useTheme } from "./hooks/useTheme.js";
import { useAuth } from "./hooks/useAuth.js";
import { useStockData } from "./hooks/useStockData.js";
import GuideScreen from "./components/guide/GuideScreen.jsx";
import Shell from "./components/shell/Shell.jsx";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();
  const stockData = useStockData();
  const [view, setView] = useState("evaluate"); // 'evaluate' | 'guide'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("topbar-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isAuthed = Boolean(auth.user || auth.isGuest);

  if (!auth.authResolved) {
    return (
      <div className="boot-splash" aria-hidden="true">
        <img src="/favicon.svg" alt="" width="40" height="40" />
      </div>
    );
  }

  if (view === "guide") {
    return <GuideScreen onBack={() => setView("evaluate")} theme={theme} onToggleTheme={toggleTheme} isAuthed={isAuthed} />;
  }

  // Dashboard (Stock Research) is the first thing shown, no gate — other
  // pages inside Shell (Watchlist, Portfolio, etc.) are individually locked
  // behind sign-in/guest, handled per-page inside Shell itself.
  return (
    <Shell auth={auth} stockData={stockData} theme={theme} onToggleTheme={toggleTheme} onOpenGuide={() => setView("guide")} />
  );
}
