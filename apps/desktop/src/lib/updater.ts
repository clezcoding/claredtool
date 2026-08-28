import * as Sentry from "@sentry/browser";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { desktopLog } from "./log";

export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const UPDATE_CHECK_ON_STARTUP = true;

const SILENT_FAIL_SENTRY_THRESHOLD = 3;

export type UpdateState =
  | "idle"
  | "available"
  | "downloading"
  | "ready"
  | "error";

/** @deprecated alias for UpdateState — kept for tests and gradual migration */
export type UpdateDialogState = UpdateState;

export type UpdateToastKey =
  | "update.current"
  | "update.manualFail"
  | "update.downloadFail";

export interface UpdateInfo {
  version: string;
  notes: string;
  date?: string;
}

type StateListener = (state: UpdateState, info: UpdateInfo | null) => void;
type ToastListener = (key: UpdateToastKey) => void;

let state: UpdateState = "idle";
let info: UpdateInfo | null = null;
let pluginUpdate: Update | null = null;
let silentFailCount = 0;
let schedulerTimer: ReturnType<typeof setInterval> | undefined;
let schedulerStarted = false;

const stateListeners = new Set<StateListener>();
const toastListeners = new Set<ToastListener>();

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function parseManual(
  manualOrOptions?: boolean | { manual?: boolean },
): boolean {
  if (typeof manualOrOptions === "boolean") return manualOrOptions;
  return Boolean(manualOrOptions?.manual);
}

function formatNotes(body: string | undefined | null, version: string): string {
  const trimmed = body?.trim();
  return trimmed ? trimmed : version;
}

function setState(next: UpdateState, nextInfo: UpdateInfo | null = info): void {
  state = next;
  info = nextInfo;
  for (const listener of stateListeners) listener(state, info);
}

function emitToast(key: UpdateToastKey): void {
  for (const listener of toastListeners) listener(key);
}

function handleSilentFailure(err: unknown): void {
  silentFailCount += 1;
  desktopLog.error(
    `Update-Prüfung fehlgeschlagen (Hintergrund): ${String(err)}`,
  );
  if (silentFailCount >= SILENT_FAIL_SENTRY_THRESHOLD) {
    Sentry.captureMessage(
      "Wiederholte fehlgeschlagene Hintergrund-Update-Prüfung",
      "warning",
    );
    silentFailCount = 0;
  }
}

export function subscribeUpdater(listener: StateListener): () => void {
  stateListeners.add(listener);
  listener(state, info);
  return () => stateListeners.delete(listener);
}

export function subscribeUpdateToasts(listener: ToastListener): () => void {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
}

export function getUpdateDialogState(): UpdateDialogState {
  return state;
}

export function getUpdateInfo(): UpdateInfo | null {
  return info;
}

/** D-23: silent background check failures must not toast. */
export function shouldToastOnSilentCheckFailure(): boolean {
  return false;
}

export async function checkForUpdates(
  manualOrOptions?: boolean | { manual?: boolean },
): Promise<UpdateInfo | null> {
  const manual = parseManual(manualOrOptions);
  if (!isTauriRuntime()) return null;

  try {
    const update = await check();
    silentFailCount = 0;

    if (!update) {
      if (manual) emitToast("update.current");
      if (state === "available" || state === "error") setState("idle", null);
      return null;
    }

    pluginUpdate = update;
    const updateInfo: UpdateInfo = {
      version: update.version,
      notes: formatNotes(update.body, update.version),
      date: update.date,
    };
    setState("available", updateInfo);
    return updateInfo;
  } catch (err) {
    if (manual) {
      emitToast("update.manualFail");
      desktopLog.error(`Manuelle Update-Prüfung fehlgeschlagen: ${String(err)}`);
    } else {
      handleSilentFailure(err);
    }
    return null;
  }
}

export async function downloadUpdate(): Promise<void> {
  if (!pluginUpdate) return;
  setState("downloading", info);
  try {
    await pluginUpdate.downloadAndInstall();
    setState("ready", info);
  } catch (err) {
    pluginUpdate = null;
    desktopLog.error(`Update-Download fehlgeschlagen: ${String(err)}`);
    emitToast("update.downloadFail");
    setState("error", info);
  }
}

export function dismissUpdate(): void {
  setState("idle", null);
}

/** D-19: relaunch only when user explicitly requests — never auto after download. */
export async function relaunchApp(): Promise<void> {
  if (!isTauriRuntime()) return;
  await relaunch();
}

export function startUpdateScheduler(): void {
  if (!isTauriRuntime() || schedulerStarted) return;
  schedulerStarted = true;

  if (UPDATE_CHECK_ON_STARTUP) {
    void checkForUpdates(false);
  }

  schedulerTimer = setInterval(() => {
    void checkForUpdates(false);
  }, UPDATE_CHECK_INTERVAL_MS);
}

/** Test-only reset — not part of public app API. */
export function __resetUpdaterForTests(): void {
  state = "idle";
  info = null;
  pluginUpdate = null;
  silentFailCount = 0;
  schedulerStarted = false;
  if (schedulerTimer !== undefined) {
    clearInterval(schedulerTimer);
    schedulerTimer = undefined;
  }
  stateListeners.clear();
  toastListeners.clear();
}
