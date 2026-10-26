import "./shared/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Analytics } from "@vercel/analytics/react";
import { store } from "./app/store.js";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
    {/* Vercel Web Analytics — only reports on Vercel deployments; a no-op locally. */}
    <Analytics />
  </StrictMode>
);
