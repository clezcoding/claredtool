import { describe, expect, it } from "vitest";
import i18n from "../i18n";

function fallbackList(): string[] {
  const fallback = i18n.options.fallbackLng;
  if (fallback == null || fallback === false) return [];
  if (Array.isArray(fallback)) return fallback.map(String);
  if (typeof fallback === "object") return Object.values(fallback).flat().map(String);
  return [String(fallback)];
}

describe("i18n", () => {
  it("language resolves to de and fallbackLng includes de", async () => {
    await i18n.changeLanguage("de");
    expect(i18n.language).toMatch(/^de/);
    expect(fallbackList()).toEqual(expect.arrayContaining(["de"]));
  });

  it("t('nav.rechnung') returns the German Rechnung label", () => {
    expect(i18n.t("nav.rechnung")).toBe("Rechnung");
  });
});
