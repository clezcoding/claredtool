import "@fontsource-variable/inter";
import "@fontsource/instrument-serif";
import "@fontsource-variable/material-symbols-outlined/full.css";
import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  getThemePref,
  migrateThemeToStore,
} from "./lib/desktop-store";
import { installThemeMenu } from "./lib/theme-menu";
import { applyTheme, syncSystemAppearance } from "./lib/theme";
import "./styles/globals.css";

void (async () => {
  await migrateThemeToStore();
  applyTheme(await getThemePref());
  void installThemeMenu();
})();
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    syncSystemAppearance();
  });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
