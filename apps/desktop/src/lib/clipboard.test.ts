import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import i18n from "../i18n";
import { copyText } from "./clipboard";

beforeEach(() => {
  vi.mocked(writeText).mockReset();
});

describe("clipboard (D-03/D-04)", () => {
  it("returns true when writeText succeeds", async () => {
    vi.mocked(writeText).mockResolvedValueOnce(undefined);
    await expect(copyText("INV-2026-001")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("INV-2026-001");
  });

  it("returns false when writeText fails", async () => {
    vi.mocked(writeText).mockRejectedValueOnce(new Error("denied"));
    await expect(copyText("rule-42")).resolves.toBe(false);
  });

  it("exposes clipboard.failed i18n key for toast path", () => {
    expect(i18n.t("clipboard.failed")).toBe("Kopieren fehlgeschlagen");
    i18n.changeLanguage("en");
    expect(i18n.t("clipboard.failed")).toBe("Copy failed");
    i18n.changeLanguage("de");
  });
});
