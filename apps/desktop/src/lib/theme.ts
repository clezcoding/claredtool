export const THEME_KEY = "clared-theme";
export type ThemePref = "light" | "dark" | "system";

/** D-02 first-paint canvas — keep in sync with apps/desktop/index.html boot IIFE. */
export const PAINT_LIGHT = "#F7F7F5";
export const PAINT_DARK = "#0F0F0F";

const PREFS = new Set<string>(["light", "dark", "system"]);

export function resolveDark(pref: ThemePref): boolean {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return pref === "dark";
}

function paintDocument(dark: boolean): void {
  const background = dark ? PAINT_DARK : PAINT_LIGHT;
  const colorScheme = dark ? "dark" : "light";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.background = background;
  root.style.colorScheme = colorScheme;
  document.body.style.background = background;
  document.body.style.colorScheme = colorScheme;
}

export function applyTheme(pref: ThemePref): void {
  paintDocument(resolveDark(pref));
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    // persist is best-effort; class already applied
  }
}

export function syncSystemAppearance(): void {
  if (currentPref() !== "system") {
    return;
  }
  applyTheme("system");
}

export function currentPref(): ThemePref {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && PREFS.has(stored) ? (stored as ThemePref) : "system";
  } catch {
    return "system";
  }
}
