import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { hostname } from "@tauri-apps/plugin-os";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchMe, logoutSession, redeemTicket, replayLastRequest, setOnUnauthorized } from "./api";
import type { MeResponse } from "./types";

export type SessionState = "boot" | "unsigned" | "signed" | "boot-error";
export type BannerKind = "unauthorized" | "cancel" | null;

export type SessionContextValue = {
  state: SessionState;
  me: MeResponse | null;
  token: string | null;
  bannerKind: BannerKind;
  banner: ReactNode;
  openingLogin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  retryMe: () => Promise<void>;
  clearBanner: () => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession requires SessionProvider");
  }
  return ctx;
}

function ticketFromUrls(urls: string[] | null | undefined): string | undefined {
  for (const raw of urls ?? []) {
    try {
      const url = new URL(raw);
      if (url.protocol === "clared:") {
        const ticket = url.searchParams.get("ticket");
        if (ticket) return ticket;
      }
    } catch {
      /* ignore malformed deep links */
    }
  }
}

function isUnauthorized(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: number }).status === 401
  );
}

export function SessionProvider({
  children,
  banner,
}: {
  children: ReactNode;
  banner?: ReactNode;
}) {
  const [state, setState] = useState<SessionState>("boot");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bannerKind, setBannerKind] = useState<BannerKind>(null);
  const [openingLogin, setOpeningLogin] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const seenTickets = useRef(new Set<string>());

  const applySession = useCallback((nextToken: string, nextMe: MeResponse) => {
    tokenRef.current = nextToken;
    setToken(nextToken);
    setMe(nextMe);
    setState("signed");
    setBannerKind(null);
  }, []);

  const redeem = useCallback(
    async (ticket: string) => {
      if (seenTickets.current.has(ticket)) return;
      seenTickets.current.add(ticket);
      try {
        const host = (await hostname()) ?? "unknown";
        const { token: nextToken } = await redeemTicket(ticket, host);
        await invoke("keychain_set_session", { token: nextToken });
        const nextMe = await fetchMe(nextToken);
        applySession(nextToken, nextMe);
        await replayLastRequest(nextToken).catch(() => undefined);
      } catch {
        setBannerKind("cancel");
        if (tokenRef.current) return;
        setToken(null);
        setMe(null);
        setState("unsigned");
      }
    },
    [applySession],
  );

  const loadFromKeychain = useCallback(async () => {
    const stored = await invoke<string | null>("keychain_get_session");
    if (!stored) {
      tokenRef.current = null;
      setToken(null);
      setMe(null);
      setState("unsigned");
      return;
    }
    setToken(stored);
    try {
      const nextMe = await fetchMe(stored);
      applySession(stored, nextMe);
    } catch (err) {
      if (isUnauthorized(err)) {
        await invoke("keychain_delete_session").catch(() => undefined);
        tokenRef.current = null;
        setToken(null);
        setMe(null);
        setState("unsigned");
        return;
      }
      setState("boot-error");
    }
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    const unlisteners: Array<() => void> = [];

    async function boot() {
      try {
        const unlistenTicket = await listen<string>("ticket-received", (event) => {
          void redeem(event.payload);
        });
        unlisteners.push(unlistenTicket);

        const unlistenUrls = await onOpenUrl((urls) => {
          const ticket = ticketFromUrls(urls);
          if (ticket) void redeem(ticket);
        });
        unlisteners.push(unlistenUrls);

        if (cancelled) return;

        const launchTicket = ticketFromUrls(await getCurrent());
        if (launchTicket) {
          await redeem(launchTicket);
          return;
        }
        await loadFromKeychain();
      } catch {
        if (!cancelled) setState("unsigned");
      }
    }

    void boot();
    return () => {
      cancelled = true;
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [loadFromKeychain, redeem]);

  useEffect(() => {
    if (state !== "signed") {
      setOnUnauthorized(undefined);
      return;
    }
    setOnUnauthorized(() => {
      setBannerKind("unauthorized");
      void invoke("open_login_window");
    });
    return () => setOnUnauthorized(undefined);
  }, [state]);

  const login = useCallback(async () => {
    setOpeningLogin(true);
    try {
      await invoke("open_login_window");
    } finally {
      setOpeningLogin(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const current = token;
    try {
      if (current) {
        const { endSessionUrl } = await logoutSession(current);
        await invoke("keychain_delete_session");
        tokenRef.current = null;
        setToken(null);
        setMe(null);
        setState("unsigned");
        setBannerKind(null);
        await invoke("open_login_window", { url: endSessionUrl });
        return;
      }
    } catch {
      /* drop local session even if the API call fails */
    }
    await invoke("keychain_delete_session").catch(() => undefined);
    tokenRef.current = null;
    setToken(null);
    setMe(null);
    setState("unsigned");
    setBannerKind(null);
  }, [token]);

  const retryMe = useCallback(async () => {
    setState("boot");
    await loadFromKeychain();
  }, [loadFromKeychain]);

  const value = useMemo<SessionContextValue>(
    () => ({
      state,
      me,
      token,
      bannerKind,
      banner: banner ?? null,
      openingLogin,
      login,
      logout,
      retryMe,
      clearBanner: () => setBannerKind(null),
    }),
    [state, me, token, bannerKind, banner, openingLogin, login, logout, retryMe],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
