import type { MeResponse } from "./types";

const BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "http://localhost:3000";

export type OnUnauthorized = () => void;

export type LastRequest = { path: string; init?: RequestInit };

let onUnauthorized: OnUnauthorized | undefined;
let lastRequest: LastRequest | undefined;
let sessionToken: string | null = null;

export function setOnUnauthorized(cb: OnUnauthorized | undefined): void {
  onUnauthorized = cb;
}

export function setSessionToken(token: string | null): void {
  sessionToken = token;
}

export function getLastRequest(): LastRequest | undefined {
  return lastRequest;
}

export async function replayLastRequest(token: string): Promise<Response | undefined> {
  if (!lastRequest || lastRequest.path === "/auth/logout") return undefined;
  const headers = new Headers(lastRequest.init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return apiFetch(lastRequest.path, { ...lastRequest.init, headers });
}

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  lastRequest = { path, init };
  const headers = new Headers(init?.headers);
  if (sessionToken) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    onUnauthorized?.();
  }
  return res;
}

export async function redeemTicket(
  ticket: string,
  hostname: string,
): Promise<{ token: string }> {
  const res = await fetch(`${BASE}/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket, hostname }),
  });
  if (!res.ok) {
    throw new ApiError(res.status, `redeemTicket failed: ${res.status}`);
  }
  return (await res.json()) as { token: string };
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `fetchMe failed: ${res.status}`);
  }
  return (await res.json()) as MeResponse;
}

export async function logoutSession(
  token: string,
): Promise<{ endSessionUrl: string }> {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`logoutSession failed: ${res.status}`);
  }
  lastRequest = undefined;
  return (await res.json()) as { endSessionUrl: string };
}
