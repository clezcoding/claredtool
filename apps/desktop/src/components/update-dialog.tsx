import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@clared/ui";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  dismissUpdate,
  downloadUpdate,
  relaunchApp,
  subscribeUpdater,
  type UpdateState,
} from "../lib/updater";

const NOTIFICATION_HINT_KEY = "clared-update-notification-hint-shown";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
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

export function UpdateDialog() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState>("idle");
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  useEffect(() => {
    return subscribeUpdater((nextState, info) => {
      setState(nextState);
      if (info) {
        setVersion(info.version);
        setNotes(info.notes);
      }
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("update.title", { version })}</DialogTitle>
          <DialogDescription>{t("update.description")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-surface-container-low px-3 py-2 text-sm text-foreground dark:bg-surface-elevated-dark">
          {notes}
        </div>

        {permissionHint ? (
          <p className="text-xs text-muted-foreground">{permissionHint}</p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
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
            <Button type="button" disabled>
              {t("update.downloading")}
            </Button>
          ) : null}

          {state === "ready" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => dismissUpdate()}
              >
                {t("update.later")}
              </Button>
              <Button type="button" onClick={() => void relaunchApp()}>
                {t("update.relaunch")}
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
