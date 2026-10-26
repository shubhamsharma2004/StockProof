import { useSelector } from "react-redux";
import { selectAuthResolved, useAuthSubscription } from "../features/auth/index.js";
import { usePreferencesSync } from "../features/ui/index.js";
import AppShell from "../layout/AppShell.jsx";
import { markUrl } from "../shared/ui/BrandLogo.jsx";

export default function App() {
  useAuthSubscription();
  usePreferencesSync();
  const authResolved = useSelector(selectAuthResolved);

  if (!authResolved) {
    return (
      <div className="boot-splash" aria-hidden="true">
        <img src={markUrl} alt="" width="44" height="44" />
      </div>
    );
  }

  // The dashboard is the first thing shown, no gate — private pages are
  // individually locked behind sign-in (see features/ui navigateTo).
  return <AppShell />;
}
