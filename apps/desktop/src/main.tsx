import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installThemeMenu } from "./lib/theme-menu";
import { applyTheme, currentPref, resolveDark } from "./lib/theme";
import "./styles/globals.css";

applyTheme(currentPref());
void installThemeMenu();
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (currentPref() === "system") {
      document.documentElement.classList.toggle("dark", resolveDark("system"));
    }
  });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
