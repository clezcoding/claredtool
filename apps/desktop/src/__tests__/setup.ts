import { beforeEach, vi } from "vitest";
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
