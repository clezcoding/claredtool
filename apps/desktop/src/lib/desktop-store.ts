import { type ThemePref } from "./theme";

export async function getThemePref(): Promise<ThemePref> {
  return "system";
}

export async function setThemePref(pref: ThemePref): Promise<void> {
  void pref;
}

export async function migrateThemeToStore(): Promise<void> {}
