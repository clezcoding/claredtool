import { load, type Store } from "@tauri-apps/plugin-store";
import { THEME_KEY, type ThemePref } from "./theme";

export const STORE_FILE = "clared-desktop.json";

const PREFS = new Set<string>(["light", "dark", "system"]);

let migrationDone = false;

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function parseThemePref(value: unknown): ThemePref | null {
  return typeof value === "string" && PREFS.has(value) ? (value as ThemePref) : null;
}

function readLocalThemePref(): ThemePref {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && PREFS.has(stored) ? (stored as ThemePref) : "system";
  } catch {
    return "system";
  }
}

function dualWriteLocalTheme(pref: ThemePref): void {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    // boot IIFE mirror is best-effort
  }
}

async function desktopStore(): Promise<Store> {
  return load(STORE_FILE, { autoSave: true });
}

export async function getThemePref(): Promise<ThemePref> {
  if (!isTauriRuntime()) {
    return readLocalThemePref();
  }

  const store = await desktopStore();
  const stored = parseThemePref(await store.get(THEME_KEY));
  if (stored) {
    dualWriteLocalTheme(stored);
    return stored;
  }
  return readLocalThemePref();
}

export async function setThemePref(pref: ThemePref): Promise<void> {
  dualWriteLocalTheme(pref);

  if (!isTauriRuntime()) {
    return;
  }

  const store = await desktopStore();
  await store.set(THEME_KEY, pref);
}

export async function migrateThemeToStore(): Promise<void> {
  if (!isTauriRuntime() || migrationDone) {
    return;
  }
  migrationDone = true;

  const localPref = readLocalThemePref();
  const store = await desktopStore();
  const existing = parseThemePref(await store.get(THEME_KEY));
  if (!existing) {
    await store.set(THEME_KEY, localPref);
  }
  dualWriteLocalTheme(existing ?? localPref);
}
