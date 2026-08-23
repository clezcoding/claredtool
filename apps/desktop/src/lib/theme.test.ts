import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, currentPref, resolveDark, THEME_KEY } from "./theme";

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

  it('applyTheme("dark") paints html and body #111110 with color-scheme dark', () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.background).toBe("#111110");
    expect(document.body.style.background).toBe("#111110");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.body.style.colorScheme).toBe("dark");
  });

  it('applyTheme("light") paints html and body #F7F7F5 with color-scheme light', () => {
    document.documentElement.classList.add("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.background).toBe("#F7F7F5");
    expect(document.body.style.background).toBe("#F7F7F5");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.body.style.colorScheme).toBe("light");
  });

  it('applyTheme("system") follows mocked matchMedia for html+body paint', () => {
    stubMatchMedia(true);
    applyTheme("system");
    expect(document.documentElement.style.background).toBe("#111110");
    expect(document.body.style.background).toBe("#111110");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.body.style.colorScheme).toBe("dark");
    stubMatchMedia(false);
    applyTheme("system");
    expect(document.documentElement.style.background).toBe("#F7F7F5");
    expect(document.body.style.background).toBe("#F7F7F5");
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
});
