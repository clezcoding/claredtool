import type { MeResponse } from "./types";

const BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "http://localhost:3000";

export type OnUnauthorized = () => void;

let onUnauthorized: OnUnauthorized | undefined;

export function setOnUnauthorized(cb: OnUnauthorized | undefined): void {
  onUnauthorized = cb;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, init);
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
    throw new Error(`redeemTicket failed: ${res.status}`);
  }
  return (await res.json()) as { token: string };
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await apiFetch("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`fetchMe failed: ${res.status}`);
  }
  return (await res.json()) as MeResponse;
}

export async function logoutSession(
  token: string,
): Promise<{ endSessionUrl: string }> {
  const res = await apiFetch("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`logoutSession failed: ${res.status}`);
  }
  return (await res.json()) as { endSessionUrl: string };
}
