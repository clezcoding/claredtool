import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@clared/ui";
import { appLogDir } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { load } from "@tauri-apps/plugin-store";
import { filename as windowStateFilename } from "@tauri-apps/plugin-window-state";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "../auth/session-provider";
import { roleLabel } from "./session-chip";
import { copyText } from "../lib/clipboard";
import { STORE_FILE } from "../lib/desktop-store";
import { decideLinkAction } from "../lib/link-guard";
import { desktopLog, logLevelForEnvironment } from "../lib/log";
import {
  captureSentryTestEvent,
  sentryDsn,
  sentryEnvironment,
} from "../lib/sentry";
import { applyTheme } from "../lib/theme";
import { getThemePref, setThemePref } from "../lib/desktop-store";
import {
  checkForUpdates,
  getUpdateDialogState,
  getUpdateInfo,
} from "../lib/updater";

/** D-46: panel module is DEV-only — release builds must not mount this component. */
export const DEBUG_PANEL_ENABLED = import.meta.env.DEV;

const UPDATER_ENDPOINT =
  "https://updates-staging.puzzlessdev.online/checkVersion?app_name=clared&version={{current_version}}&platform={{target}}&arch={{arch}}&channel=stable&updater=tauri&owner=admin";

const CLIPBOARD_TEST_VALUE = "Clared Debug-Zwischenablage-Test";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Masks updater host for display (D-47 / T-04.2-16). */
export function maskUpdaterEndpoint(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.hostname.split(".");
    if (segments.length >= 2) {
      parsed.hostname = [
        segments[0].slice(0, 2) + "***",
        "***",
        segments[segments.length - 1] ?? "***",
      ]
        .filter(Boolean)
        .join(".");
    } else {
      parsed.hostname = "***";
    }
    return parsed.toString();
  } catch {
    return "[ungültig]";
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-all text-right font-mono text-xs text-foreground">
        {value}
      </span>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-testid={id}
      className="space-y-2 rounded-md border border-border bg-surface-container-low p-3 dark:bg-surface-elevated-dark"
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export function DebugPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, me } = useSession();
  const [themePref, setThemePrefState] = useState<string>("—");
  const [storeKeys, setStoreKeys] = useState<string>("—");
  const [windowStateFile, setWindowStateFile] = useState<string>("—");
  const [logDir, setLogDir] = useState<string>("—");
  const [lastCheck, setLastCheck] = useState<string>("—");
  const [clipboardStatus, setClipboardStatus] = useState<string>("—");
  const [notificationStatus, setNotificationStatus] = useState<string>("—");

  const refreshMeta = useCallback(async () => {
    try {
      const pref = await getThemePref();
      setThemePrefState(pref);
    } catch {
      setThemePrefState("—");
    }

    if (!isTauriRuntime()) {
      setStoreKeys("Web");
      setWindowStateFile("n/a");
      setLogDir("n/a");
      return;
    }

    try {
      const store = await load(STORE_FILE, { autoSave: true });
      const keys = await store.keys();
      setStoreKeys(keys.length ? keys.join(", ") : "(leer)");
    } catch {
      setStoreKeys("Fehler");
    }

    try {
      setWindowStateFile(await windowStateFilename());
    } catch {
      setWindowStateFile("Fehler");
    }

    try {
      setLogDir(await appLogDir());
    } catch {
      setLogDir("Fehler");
    }
  }, []);

  useEffect(() => {
    if (!open || !DEBUG_PANEL_ENABLED) return;
    void refreshMeta();
  }, [open, refreshMeta]);

  if (!DEBUG_PANEL_ENABLED) {
    return null;
  }

  const buildTime =
    (import.meta.env.VITE_BUILD_TIME as string | undefined) ??
    (import.meta.env.DEV ? "Entwicklung" : "—");
  const version =
    (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "0.1.0";
  const logLevel = logLevelForEnvironment(import.meta.env.MODE);
  const updateState = getUpdateDialogState();
  const updateInfo = getUpdateInfo();
  const loggedIn = state === "signed" && me !== null;
  const authLabel = loggedIn && me ? `${me.name} (${roleLabel(me.primaryRole)})` : "—";

  const handleResetTheme = () => {
    void (async () => {
      await setThemePref("system");
      applyTheme("system");
      setThemePrefState("system");
    })();
  };

  const handleCheckUpdates = () => {
    void (async () => {
      await checkForUpdates({ manual: true });
      setLastCheck(new Date().toISOString());
    })();
  };

  const handleOpenLogDir = () => {
    void (async () => {
      if (!isTauriRuntime()) return;
      try {
        const dir = await appLogDir();
        await revealItemInDir(dir);
      } catch (err) {
        desktopLog.error(`Log-Ordner öffnen fehlgeschlagen: ${String(err)}`);
      }
    })();
  };

  const handleClipboardTest = () => {
    void (async () => {
      const ok = await copyText(CLIPBOARD_TEST_VALUE);
      setClipboardStatus(ok ? "Kopiert" : "Fehlgeschlagen");
    })();
  };

  const handleNotificationTest = () => {
    void (async () => {
      if (!isTauriRuntime()) {
        setNotificationStatus("Nur Desktop");
        return;
      }
      try {
        let granted = await isPermissionGranted();
        if (!granted) {
          const permission = await requestPermission();
          granted = permission === "granted";
        }
        if (!granted) {
          setNotificationStatus("Abgelehnt");
          return;
        }
        await sendNotification({
          title: "Clared Debug",
          body: "Test-Benachrichtigung (intern)",
        });
        setNotificationStatus("Gesendet");
      } catch {
        setNotificationStatus("Fehlgeschlagen");
      }
    })();
  };

  const handleSentryTest = () => {
    captureSentryTestEvent();
  };

  const pluginChecks = [
    { name: "Tauri-Laufzeit", ok: isTauriRuntime() },
    { name: "Store", ok: isTauriRuntime() },
    { name: "Updater", ok: isTauriRuntime() },
    { name: "Log", ok: isTauriRuntime() },
    { name: "Benachrichtigung", ok: isTauriRuntime() },
    { name: "Zwischenablage", ok: isTauriRuntime() },
    { name: "Sentry DSN", ok: Boolean(sentryDsn()) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-x-hidden overflow-y-auto pr-10 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Debug-Panel</DialogTitle>
          <DialogDescription>
            Nur Entwicklungsbuild (Cmd/Ctrl+D). Keine Sitzungsgeheimnisse.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Section id="debug-section-env" title="Umgebung">
            <Row label="MODE" value={import.meta.env.MODE} />
            <Row label="DEV" value={String(import.meta.env.DEV)} />
            <Row label="Sentry-Umgebung" value={sentryEnvironment()} />
          </Section>

          <Section id="debug-section-version" title="Version">
            <Row label="Version" value={version} />
            <Row label="Build-Zeit" value={buildTime} />
          </Section>

          <Section id="debug-section-auth" title="Auth">
            <Row label="Angemeldet" value={loggedIn ? "ja" : "nein"} />
            <Row label="/me" value={authLabel} />
          </Section>

          <Section id="debug-section-theme" title="Theme & Store">
            <Row label="Theme" value={themePref} />
            <Row label="Store-Schlüssel" value={storeKeys} />
            <Button type="button" size="sm" variant="outline" onClick={handleResetTheme}>
              Theme auf System zurücksetzen
            </Button>
          </Section>

          <Section id="debug-section-window-state" title="Fensterzustand">
            <Row label="State-Datei" value={windowStateFile} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void getCurrentWindow().isMaximized().then((max) => {
                setWindowStateFile((prev) => `${prev} · max=${max}`);
              })}
            >
              Maximiert prüfen
            </Button>
          </Section>

          <Section id="debug-section-updater" title="Updater">
            <Row label="Status" value={updateState} />
            <Row
              label="Verfügbar"
              value={updateInfo ? updateInfo.version : "—"}
            />
            <Row label="Letzte Prüfung" value={lastCheck} />
            <Row
              label="Endpunkt"
              value={maskUpdaterEndpoint(UPDATER_ENDPOINT)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={updateState === "downloading" || updateState === "ready"}
              onClick={handleCheckUpdates}
            >
              Jetzt prüfen
            </Button>
          </Section>

          <Section id="debug-section-log" title="Log">
            <Row label="Level" value={logLevel} />
            <Row label="Log-Verzeichnis" value={logDir} />
            <Button type="button" size="sm" variant="outline" onClick={handleOpenLogDir}>
              Log-Ordner öffnen
            </Button>
          </Section>

          <Section id="debug-section-sentry" title="Sentry">
            <Row label="DSN gesetzt" value={sentryDsn() ? "ja" : "nein"} />
            <Button type="button" size="sm" variant="outline" onClick={handleSentryTest}>
              Testereignis senden
            </Button>
          </Section>

          <Section id="debug-section-clipboard" title="Zwischenablage">
            <Row label="Letzter Test" value={clipboardStatus} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="debug-clipboard-test"
              onClick={handleClipboardTest}
            >
              Test kopieren
            </Button>
          </Section>

          <Section id="debug-section-notification" title="Benachrichtigung">
            <Row label="Letzter Test" value={notificationStatus} />
            <Button type="button" size="sm" variant="outline" onClick={handleNotificationTest}>
              Test-Ping senden
            </Button>
          </Section>

          <Section id="debug-section-link-guard" title="Link-Guard & Prevent-Default">
            <Row
              label="https → opener"
              value={decideLinkAction("https://example.com")}
            />
            <Row
              label="http localhost → in-app"
              value={decideLinkAction("http://localhost:5174")}
            />
            <Row
              label="file → block"
              value={decideLinkAction("file:///etc/passwd")}
            />
            <Row
              label="Prevent-Default (Debug)"
              value={import.meta.env.DEV ? "DevTools+Reload erlaubt" : "Vollblock"}
            />
            <Row
              label="DevTools (D-50)"
              value={import.meta.env.DEV ? "erlaubt" : "gesperrt"}
            />
          </Section>

          <Section id="debug-section-plugins" title="Plugin-Gesundheit">
            <ul className="space-y-1 text-sm">
              {pluginChecks.map(({ name, ok }) => (
                <li key={name} className="flex justify-between gap-2">
                  <span>{name}</span>
                  <span className={ok ? "text-green-600" : "text-muted-foreground"}>
                    {ok ? "OK" : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
