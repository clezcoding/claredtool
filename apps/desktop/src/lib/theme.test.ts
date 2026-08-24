import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  currentPref,
  PAINT_DARK,
  PAINT_LIGHT,
  resolveDark,
  syncSystemAppearance,
  THEME_KEY,
} from "./theme";

const here = dirname(fileURLToPath(import.meta.url));

function readRepo(...parts: string[]): string {
  return readFileSync(join(here, ...parts), "utf8");
}

function cssBackground(css: string, selector: ":root" | ".dark"): string {
  const escaped = selector.replace(".", "\\.");
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1];
  const hex = block?.match(/--background:\s*(#[0-9A-Fa-f]{6})/)?.[1];
  if (!hex) {
    throw new Error(`missing --background in ${selector}`);
  }
  return hex.toUpperCase();
}

function stubLocalStorage() {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: storage,
  });
}

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

/** jsdom may serialize hex background as rgb(). */
function paintedBackground(el: HTMLElement): string {
  return (el.style.background || el.style.backgroundColor).replace(/\s+/g, "");
}

beforeEach(() => {
  stubLocalStorage();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.background = "";
  document.documentElement.style.colorScheme = "";
  document.body.style.background = "";
  document.body.style.colorScheme = "";
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

  it('applyTheme("dark") paints html and body #0F0F0F with color-scheme dark', () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(paintedBackground(document.documentElement)).toMatch(/#0F0F0F|rgb\(15,15,15\)/i);
    expect(paintedBackground(document.body)).toMatch(/#0F0F0F|rgb\(15,15,15\)/i);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.body.style.colorScheme).toBe("dark");
  });

  it('applyTheme("light") paints html and body #F7F7F5 with color-scheme light', () => {
    document.documentElement.classList.add("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(paintedBackground(document.documentElement)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
    expect(paintedBackground(document.body)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.body.style.colorScheme).toBe("light");
  });

  it('applyTheme("system") follows mocked matchMedia for html+body paint', () => {
    stubMatchMedia(true);
    applyTheme("system");
    expect(paintedBackground(document.documentElement)).toMatch(/#0F0F0F|rgb\(15,15,15\)/i);
    expect(paintedBackground(document.body)).toMatch(/#0F0F0F|rgb\(15,15,15\)/i);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.body.style.colorScheme).toBe("dark");
    stubMatchMedia(false);
    applyTheme("system");
    expect(paintedBackground(document.documentElement)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
    expect(paintedBackground(document.body)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.body.style.colorScheme).toBe("light");
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

  it("syncSystemAppearance paints oatmeal and drops dark when pref is system and OS is light", () => {
    stubMatchMedia(true);
    applyTheme("system");
    stubMatchMedia(false);
    syncSystemAppearance();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(paintedBackground(document.documentElement)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
    expect(paintedBackground(document.body)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
  });

  it("syncSystemAppearance leaves charcoal when pref is dark even if OS is light", () => {
    applyTheme("dark");
    stubMatchMedia(false);
    syncSystemAppearance();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(paintedBackground(document.documentElement)).toMatch(/#0F0F0F|rgb\(15,15,15\)/i);
    expect(paintedBackground(document.body)).toMatch(/#0F0F0F|rgb\(15,15,15\)/i);
  });

  it("syncSystemAppearance leaves oatmeal when pref is light even if OS is dark", () => {
    applyTheme("light");
    stubMatchMedia(true);
    syncSystemAppearance();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(paintedBackground(document.documentElement)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
    expect(paintedBackground(document.body)).toMatch(/#F7F7F5|rgb\(247,247,245\)/i);
  });

  it("PAINT_* match boot IIFE and both globals.css --background tokens", () => {
    const html = readRepo("../../index.html");
    const themeSrc = readRepo("./theme.ts");
    const desktopCss = readRepo("../styles/globals.css");
    const uiCss = readRepo("../../../../packages/ui/src/styles/globals.css");
    const light = html.match(/var light = "(#[0-9A-Fa-f]{6})"/)?.[1];
    const darkBg = html.match(/var darkBg = "(#[0-9A-Fa-f]{6})"/)?.[1];
    expect(light?.toUpperCase()).toBe(PAINT_LIGHT.toUpperCase());
    expect(darkBg?.toUpperCase()).toBe(PAINT_DARK.toUpperCase());
    expect(themeSrc).toMatch(/export const PAINT_LIGHT/);
    expect(themeSrc).toMatch(/export const PAINT_DARK/);
    expect(PAINT_LIGHT.toUpperCase()).toBe("#F7F7F5");
    expect(PAINT_DARK.toUpperCase()).toBe("#0F0F0F");
    expect(cssBackground(desktopCss, ":root")).toBe(PAINT_LIGHT.toUpperCase());
    expect(cssBackground(desktopCss, ".dark")).toBe(PAINT_DARK.toUpperCase());
    expect(cssBackground(uiCss, ":root")).toBe(PAINT_LIGHT.toUpperCase());
    expect(cssBackground(uiCss, ".dark")).toBe(PAINT_DARK.toUpperCase());
  });
});
