import { beforeEach, describe, expect, it, vi } from "vitest";
import { load } from "@tauri-apps/plugin-store";
import { THEME_KEY } from "./theme";
import {
  getThemePref,
  migrateThemeToStore,
  setThemePref,
} from "./desktop-store";

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

function withTauriInternals(enabled: boolean) {
  if (enabled) {
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });
  } else {
    Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
  }
}

beforeEach(() => {
  stubLocalStorage();
  withTauriInternals(false);
  vi.mocked(load).mockClear();
});

describe("desktop-store (D-14/D-15)", () => {
  it("uses localStorage fallback outside Tauri", async () => {
    localStorage.setItem(THEME_KEY, "dark");
    await expect(getThemePref()).resolves.toBe("dark");
    expect(load).not.toHaveBeenCalled();
  });

  it("uses plugin-store inside Tauri", async () => {
    withTauriInternals(true);
    const store = {
      get: vi.fn(async () => "light"),
      set: vi.fn(async () => undefined),
      save: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
    };
    vi.mocked(load).mockResolvedValueOnce(store);

    await expect(getThemePref()).resolves.toBe("light");
    expect(load).toHaveBeenCalled();
  });

  it("persists theme via store in Tauri", async () => {
    withTauriInternals(true);
    const store = {
      get: vi.fn(async () => undefined),
      set: vi.fn(async () => undefined),
      save: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
    };
    vi.mocked(load).mockResolvedValueOnce(store);

    await setThemePref("dark");
    expect(store.set).toHaveBeenCalledWith(THEME_KEY, "dark");
  });

  it("migrates clared-theme from localStorage once", async () => {
    withTauriInternals(true);
    localStorage.setItem(THEME_KEY, "light");
    const store = {
      get: vi.fn(async () => undefined),
      set: vi.fn(async () => undefined),
      save: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
    };
    vi.mocked(load).mockResolvedValueOnce(store);

    await migrateThemeToStore();
    expect(store.set).toHaveBeenCalledWith(THEME_KEY, "light");
  });
});
