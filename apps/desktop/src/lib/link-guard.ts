import { openUrl } from "@tauri-apps/plugin-opener";

export type LinkAction = "opener" | "in-app" | "block";

const DEV_HTTP_HOSTS = new Set(["localhost", "127.0.0.1", "clared.local"]);

function isDevHttpHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (DEV_HTTP_HOSTS.has(host)) return true;
  return host.endsWith(".local");
}

/** D-34 scheme policy for main WebView anchor / window.open navigation. */
export function decideLinkAction(href: string): LinkAction {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return "block";
  }

  const scheme = url.protocol.replace(/:$/, "").toLowerCase();

  if (scheme === "https") return "opener";

  if (scheme === "http") {
    return isDevHttpHost(url.hostname) ? "in-app" : "block";
  }

  if (scheme === "clared") return "in-app";

  return "block";
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function logBlocked(href: string): void {
  console.warn(`[link-guard] Navigation blockiert: ${href}`);
}

function hrefFromAnchor(anchor: HTMLAnchorElement): string | null {
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#")) return null;
  try {
    return new URL(raw, window.location.href).href;
  } catch {
    return null;
  }
}

function handleLink(href: string, event: Event): void {
  const action = decideLinkAction(href);
  if (action === "in-app") return;

  event.preventDefault();
  event.stopPropagation();

  if (action === "opener") {
    void openUrl(href).catch(() => {
      logBlocked(href);
    });
    return;
  }

  logBlocked(href);
}

let installed = false;

/** Installs click/auxclick guards on the main WebView document (D-34). */
export function installLinkGuard(): void {
  if (!isTauriRuntime() || installed) return;
  installed = true;

  const onPointer = (event: MouseEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const href = hrefFromAnchor(anchor);
    if (!href) return;
    handleLink(href, event);
  };

  document.addEventListener("click", onPointer, true);
  document.addEventListener("auxclick", onPointer, true);

  const nativeOpen = window.open.bind(window);
  window.open = (
    url?: string | URL,
    target?: string,
    features?: string,
  ): Window | null => {
    if (url == null || url === "") {
      return nativeOpen(url, target, features);
    }
    const href = typeof url === "string" ? url : url.href;
    const action = decideLinkAction(href);
    if (action === "in-app") {
      return nativeOpen(url, target, features);
    }
    if (action === "opener") {
      void openUrl(href).catch(() => logBlocked(href));
      return null;
    }
    logBlocked(href);
    return null;
  };
}
