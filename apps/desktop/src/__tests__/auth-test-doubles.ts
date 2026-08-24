import { vi } from "vitest";
import { signedInOwner } from "./auth-signed-in";

export const tauriInvoke = vi.fn(async (cmd: string): Promise<string | null | undefined> => {
  if (cmd === "keychain_get_session") return "test-token";
  return undefined;
});

export const fetchMock = vi.fn(
  async (input: RequestInfo | URL, _init?: RequestInit) => {
  const url = String(input);
  if (url.includes("/me")) {
    return new Response(JSON.stringify(signedInOwner), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (url.includes("/api/entities")) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (url.endsWith("/api/invoices")) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("not found", { status: 404 });
});

export const listenMock = vi.fn(async () => () => undefined);
export const getCurrentMock = vi.fn(async (): Promise<string[] | null> => null);
export const onOpenUrlMock = vi.fn(async () => () => undefined);
export const hostnameMock = vi.fn(async () => "test-host");

export function resetAuthMocks(): void {
  tauriInvoke.mockReset();
  tauriInvoke.mockImplementation(async (cmd: string): Promise<string | null | undefined> => {
    if (cmd === "keychain_get_session") return "test-token";
    return undefined;
  });
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/me")) {
      return new Response(JSON.stringify(signedInOwner), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/entities")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/api/invoices")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("not found", { status: 404 });
  });
  listenMock.mockReset();
  listenMock.mockImplementation(async () => () => undefined);
  getCurrentMock.mockReset();
  getCurrentMock.mockResolvedValue(null);
  onOpenUrlMock.mockReset();
  onOpenUrlMock.mockImplementation(async () => () => undefined);
  hostnameMock.mockReset();
  hostnameMock.mockResolvedValue("test-host");
}
