import { beforeEach, vi } from "vitest";
import "../i18n";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";

const NativeRequest = globalThis.Request;

globalThis.Request = class Request extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init?.signal) {
      const { signal: _signal, ...rest } = init;
      super(input, rest);
    } else {
      super(input, init);
    }
  }
} as typeof Request;

vi.mock("@tauri-apps/api/core", async () => {
  const { tauriInvoke } = await import("./auth-test-doubles");
  return { invoke: tauriInvoke };
});

vi.mock("@tauri-apps/api/event", async () => {
  const { listenMock } = await import("./auth-test-doubles");
  return { listen: listenMock };
});

vi.mock("@tauri-apps/plugin-deep-link", async () => {
  const { getCurrentMock, onOpenUrlMock } = await import("./auth-test-doubles");
  return { getCurrent: getCurrentMock, onOpenUrl: onOpenUrlMock };
});

vi.mock("@tauri-apps/plugin-os", async () => {
  const { hostnameMock } = await import("./auth-test-doubles");
  return { hostname: hostnameMock };
});

vi.mock("@tauri-apps/plugin-store", () => {
  const memory = new Map<string, unknown>();
  return {
    load: vi.fn(async () => ({
      get: vi.fn(async <T>(key: string) => memory.get(key) as T | undefined),
      set: vi.fn(async (key: string, value: unknown) => {
        memory.set(key, value);
      }),
      save: vi.fn(async () => undefined),
      delete: vi.fn(async (key: string) => {
        memory.delete(key);
      }),
    })),
  };
});

vi.mock("@sentry/browser", () => ({
  captureMessage: vi.fn(),
  init: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-log", () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: vi.fn(async () => null),
}));

vi.mock("@tauri-apps/plugin-process", () => ({
  relaunch: vi.fn(async () => undefined),
}));

vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
  writeText: vi.fn(async () => undefined),
}));

vi.mock("@tauri-apps/plugin-notification", () => ({
  isPermissionGranted: vi.fn(async () => true),
  requestPermission: vi.fn(async () => "granted" as const),
  sendNotification: vi.fn(async () => undefined),
}));

vi.mock("@tauri-apps/plugin-window-state", () => ({
  StateFlags: {
    SIZE: 1,
    POSITION: 2,
    MAXIMIZED: 4,
    VISIBLE: 8,
    DECORATIONS: 16,
    FULLSCREEN: 32,
  },
}));

vi.mock("@tauri-apps/plugin-sql", () => {
  const load = vi.fn(async () => ({
    execute: vi.fn(async () => ({ rowsAffected: 0 })),
    select: vi.fn(async () => []),
    close: vi.fn(async () => undefined),
  }));
  return { default: { load }, load };
});

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(async () => null),
  save: vi.fn(async () => null),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(async () => ""),
  writeTextFile: vi.fn(async () => undefined),
  exists: vi.fn(async () => false),
  BaseDirectory: { AppData: 8, Temp: 12 },
}));

vi.mock("@choochmeque/tauri-plugin-sharekit-api", () => ({
  share: vi.fn(async () => undefined),
  shareText: vi.fn(async () => undefined),
}));

globalThis.fetch = fetchMock as typeof fetch;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

for (const proto of [Element.prototype, HTMLElement.prototype]) {
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => undefined;
  proto.releasePointerCapture = () => undefined;
  proto.scrollIntoView = () => undefined;
}

beforeEach(() => {
  resetAuthMocks();
});
