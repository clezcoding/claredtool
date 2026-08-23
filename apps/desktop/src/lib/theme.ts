export const THEME_KEY = "clared-theme";
export type ThemePref = "light" | "dark" | "system";

const PREFS = new Set<string>(["light", "dark", "system"]);

export function resolveDark(pref: ThemePref): boolean {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return pref === "dark";
}

export function applyTheme(pref: ThemePref): void {
  document.documentElement.classList.toggle("dark", resolveDark(pref));
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    // persist is best-effort; class already applied
  }
}

export function currentPref(): ThemePref {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && PREFS.has(stored) ? (stored as ThemePref) : "system";
  } catch {
    return "system";
  }
}
