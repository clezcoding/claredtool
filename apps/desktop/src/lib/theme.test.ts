import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, currentPref, resolveDark, THEME_KEY } from "./theme";

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("theme", () => {
  it('resolveDark("dark") is true', () => {
    expect(resolveDark("dark")).toBe(true);
  });

  it('resolveDark("light") is false', () => {
    expect(resolveDark("light")).toBe(false);
  });

  it('resolveDark("system") follows matchMedia prefers-color-scheme', () => {
    stubMatchMedia(true);
    expect(resolveDark("system")).toBe(true);
    stubMatchMedia(false);
    expect(resolveDark("system")).toBe(false);
  });

  it("applyTheme dark adds the dark class and persists the pref", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });

  it("applyTheme light removes the dark class and persists the pref", () => {
    document.documentElement.classList.add("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("currentPref returns the persisted pref", () => {
    localStorage.setItem(THEME_KEY, "light");
    expect(currentPref()).toBe("light");
  });

  it("currentPref defaults to system when localStorage is empty", () => {
    expect(currentPref()).toBe("system");
  });

  it("currentPref defaults to system on an unknown stored value", () => {
    localStorage.setItem(THEME_KEY, "solarized");
    expect(currentPref()).toBe("system");
  });
});
