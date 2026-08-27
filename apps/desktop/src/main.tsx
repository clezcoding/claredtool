import "@fontsource-variable/inter";
import "@fontsource/instrument-serif";
import "@fontsource-variable/material-symbols-outlined";
import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installThemeMenu } from "./lib/theme-menu";
import { applyTheme, currentPref, syncSystemAppearance } from "./lib/theme";
import "./styles/globals.css";

applyTheme(currentPref());
void installThemeMenu();
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
