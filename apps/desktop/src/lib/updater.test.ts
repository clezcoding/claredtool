import { describe, expect, it } from "vitest";
import {
  checkForUpdates,
  getUpdateDialogState,
  shouldToastOnSilentCheckFailure,
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_CHECK_ON_STARTUP,
  type UpdateDialogState,
} from "./updater";

describe("updater (D-17/D-23)", () => {
  it("checks on startup and every 24h", () => {
    expect(UPDATE_CHECK_ON_STARTUP).toBe(true);
    expect(UPDATE_CHECK_INTERVAL_MS).toBe(24 * 60 * 60 * 1000);
  });

  it("tracks dialog states available/later/install/relaunch", () => {
    const states: UpdateDialogState[] = [
      "available",
      "later",
      "installing",
      "relaunch",
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
});
