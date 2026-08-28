import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@clared/ui";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  dismissUpdate,
  downloadUpdate,
  relaunchApp,
  subscribeUpdater,
  subscribeUpdateProgress,
  type UpdateProgress,
  type UpdateState,
} from "../lib/updater";

const NOTIFICATION_HINT_KEY = "clared-update-notification-hint-shown";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return remainder > 0 ? `${minutes} min ${remainder} s` : `${minutes} min`;
}

function useDownloadEta(progress: UpdateProgress | null): string | null {
  const startedAt = useRef<number | null>(null);
  const lastBytes = useRef(0);
  const [eta, setEta] = useState<string | null>(null);

  useEffect(() => {
    if (!progress || progress.phase !== "download") {
      startedAt.current = null;
      lastBytes.current = 0;
      setEta(null);
      return;
    }

    if (startedAt.current === null) startedAt.current = Date.now();
    if (progress.downloadedBytes < lastBytes.current) {
      startedAt.current = Date.now();
    }
    lastBytes.current = progress.downloadedBytes;

    if (!progress.totalBytes || progress.downloadedBytes <= 0) {
      setEta(null);
      return;
    }

    const elapsedSec = (Date.now() - startedAt.current) / 1000;
    if (elapsedSec < 1) {
      setEta(null);
      return;
    }

    const bytesPerSec = progress.downloadedBytes / elapsedSec;
    if (bytesPerSec <= 0) {
      setEta(null);
      return;
    }

    const remaining =
      (progress.totalBytes - progress.downloadedBytes) / bytesPerSec;
    setEta(formatEta(remaining));
  }, [progress?.downloadedBytes, progress?.phase, progress?.totalBytes]);

  return eta;
}

async function notifyUpdateReady(
  title: string,
  body: string,
  hint: string,
  setHint: (value: string | null) => void,
): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === "granted";
    }
    if (granted) {
      await sendNotification({ title, body });
      return;
    }
    const hintShown = localStorage.getItem(NOTIFICATION_HINT_KEY);
    if (!hintShown) {
      localStorage.setItem(NOTIFICATION_HINT_KEY, "1");
      setHint(hint);
    }
  } catch {
    // D-22: in-app dialog remains primary when notification fails
  }
}

function UpdateProgressPanel({
  progress,
  eta,
}: {
  progress: UpdateProgress;
  eta: string | null;
}) {
  const { t } = useTranslation();
  const percent =
    progress.totalBytes && progress.totalBytes > 0
      ? Math.min(100, Math.round((progress.downloadedBytes / progress.totalBytes) * 100))
      : null;

  const phaseLabel =
    progress.phase === "install"
      ? t("update.installPhase")
      : t("update.downloadPhase");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{phaseLabel}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {percent !== null ? <span>{percent}%</span> : null}
          {eta && progress.phase === "download" ? (
            <span>{t("update.eta", { time: eta })}</span>
          ) : null}
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        aria-label={phaseLabel}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full bg-primary transition-[width] duration-300 ${
            percent === null ? "w-1/3 animate-pulse" : ""
          }`}
          style={percent !== null ? { width: `${percent}%` } : undefined}
        />
      </div>
    </div>
  );
}

export function UpdateDialog() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState>("idle");
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [permissionHint, setPermissionHint] = useState<string | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const eta = useDownloadEta(progress);

  useEffect(() => {
    return subscribeUpdater((nextState, info) => {
      setState(nextState);
      if (info) {
        setVersion(info.version);
        setNotes(info.notes);
      }
      if (nextState !== "downloading") {
        setProgress(null);
      }
    });
  }, []);

  useEffect(() => {
    return subscribeUpdateProgress((nextProgress) => {
      setProgress(nextProgress);
    });
  }, []);

  useEffect(() => {
    if (state !== "ready") return;
    void notifyUpdateReady(
      t("update.notificationTitle"),
      t("update.notificationBody", { version }),
      t("update.permissionHint"),
      setPermissionHint,
    );
  }, [state, t, version]);

  const open =
    state === "available" ||
    state === "downloading" ||
    state === "ready" ||
    state === "error";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && (state === "available" || state === "error")) {
      dismissUpdate();
    }
  };

  const title =
    state === "ready"
      ? t("update.readyTitle", { version })
      : state === "downloading"
        ? t("update.downloadingTitle", { version })
        : t("update.title", { version });

  const description =
    state === "ready"
      ? t("update.readyDescription", { version })
      : state === "downloading"
        ? t("update.downloadingDescription")
        : t("update.description");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={state !== "downloading"}
        onEscapeKeyDown={(event) => {
          if (state === "downloading") event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (state === "downloading") event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {state !== "ready" ? (
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-surface-container-low px-3 py-2 text-sm text-foreground dark:bg-surface-elevated-dark">
            {notes}
          </div>
        ) : null}

        {state === "downloading" && progress ? (
          <UpdateProgressPanel progress={progress} eta={eta} />
        ) : null}

        {permissionHint ? (
          <p className="text-xs text-muted-foreground">{permissionHint}</p>
        ) : null}

        {state === "error" ? (
          <p className="text-sm text-destructive">{t("update.downloadFail")}</p>
        ) : null}

        <DialogFooter>
          {state === "available" || state === "error" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => dismissUpdate()}
              >
                {t("update.later")}
              </Button>
              <Button
                type="button"
                onClick={() => void downloadUpdate()}
              >
                {t("update.install")}
              </Button>
            </>
          ) : null}

          {state === "downloading" ? (
            <Button type="button" disabled className="w-full sm:w-auto">
              {progress?.phase === "install"
                ? t("update.installPhase")
                : t("update.downloading")}
            </Button>
          ) : null}

          {state === "ready" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => dismissUpdate()}
              >
                {t("update.relaunchLater")}
              </Button>
              <Button type="button" onClick={() => void relaunchApp()}>
                {t("update.relaunchNow")}
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
