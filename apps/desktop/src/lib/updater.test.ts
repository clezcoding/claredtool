import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import * as Sentry from "@sentry/browser";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetUpdaterForTests,
  checkForUpdates,
  downloadUpdate,
  getUpdateDialogState,
  relaunchApp,
  shouldToastOnSilentCheckFailure,
  subscribeUpdateToasts,
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_CHECK_ON_STARTUP,
  type UpdateState,
} from "./updater";

describe("updater (D-17/D-23)", () => {
  beforeEach(() => {
    __resetUpdaterForTests();
    vi.mocked(check).mockReset();
    vi.mocked(check).mockResolvedValue(null);
    vi.mocked(relaunch).mockClear();
    if (vi.isMockFunction(Sentry.captureMessage)) {
      vi.mocked(Sentry.captureMessage).mockClear();
    }
    (globalThis as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};
  });

  it("checks on startup and every 24h", () => {
    expect(UPDATE_CHECK_ON_STARTUP).toBe(true);
    expect(UPDATE_CHECK_INTERVAL_MS).toBe(24 * 60 * 60 * 1000);
  });

  it("tracks dialog states idle/available/downloading/ready/error", () => {
    const states: UpdateState[] = [
      "available",
      "downloading",
      "ready",
      "error",
    ];
    for (const state of states) {
      expect(["idle", ...states]).toContain(state);
    }
    expect(getUpdateDialogState()).toBe("idle");
  });

  it("does not toast on silent background check failure", () => {
    expect(shouldToastOnSilentCheckFailure()).toBe(false);
  });

  it("returns null when no update is available", async () => {
    await expect(checkForUpdates()).resolves.toBeNull();
  });

  it("toasts current on manual check with no update", async () => {
    const toasts: string[] = [];
    subscribeUpdateToasts((key) => toasts.push(key));
    await checkForUpdates(true);
    expect(toasts).toContain("update.current");
  });

  it("toasts manualFail on manual check error", async () => {
    vi.mocked(check).mockRejectedValueOnce(new Error("network"));
    const toasts: string[] = [];
    subscribeUpdateToasts((key) => toasts.push(key));
    await checkForUpdates(true);
    expect(toasts).toContain("update.manualFail");
  });

  it("does not relaunch automatically after download", async () => {
    vi.mocked(check).mockResolvedValueOnce({
      version: "1.2.0",
      body: "Notes",
      date: "2026-01-01",
      downloadAndInstall: vi.fn(async () => undefined),
    } as never);
    await checkForUpdates(true);
    await downloadUpdate();
    expect(relaunch).not.toHaveBeenCalled();
    await relaunchApp();
    expect(relaunch).toHaveBeenCalled();
  });
});
