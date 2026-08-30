import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyText } from "../lib/clipboard";

const here = dirname(fileURLToPath(import.meta.url));
const panelSourcePath = join(here, "../components/debug-panel.tsx");

vi.mock("../auth/session-provider", () => ({
  useSession: () => ({
    state: "signed",
    me: {
      name: "Test User",
      email: "test@example.com",
      primaryRole: "owner",
    },
  }),
}));

vi.mock("../lib/clipboard", () => ({
  copyText: vi.fn(async () => true),
}));

vi.mock("@tauri-apps/api/path", () => ({
  appLogDir: vi.fn(async () => "/tmp/clared-logs"),
  appDataDir: vi.fn(async () => "/tmp/clared-app-data"),
  join: vi.fn(async (...parts: string[]) => parts.join("/")),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    isMaximized: vi.fn(async () => false),
  })),
}));

vi.mock("@tauri-apps/plugin-window-state", async () => {
  const actual = await vi.importActual<
    typeof import("@tauri-apps/plugin-window-state")
  >("@tauri-apps/plugin-window-state");
  return {
    ...actual,
    filename: vi.fn(async () => ".window-state.json"),
  };
});

function renderPanel(
  Panel: React.ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>,
) {
  return render(
    React.createElement(Panel, { open: true, onOpenChange: () => {} }),
  );
}

describe("debug-panel gate (D-46/D-47)", () => {
  beforeEach(() => {
    vi.mocked(copyText).mockClear();
  });

  it("DEBUG_PANEL_ENABLED is true in vitest DEV", async () => {
    const { DEBUG_PANEL_ENABLED } = await import("../components/debug-panel");
    expect(DEBUG_PANEL_ENABLED).toBe(true);
  });

  it("returns null when DEBUG_PANEL_ENABLED is false", async () => {
    vi.stubEnv("DEV", false);
    vi.resetModules();
    const { DebugPanel } = await import("../components/debug-panel");
    const { container } = renderPanel(DebugPanel);
    expect(container.firstChild).toBeNull();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("renders D-47 sections when open in DEV", async () => {
    const { DebugPanel } = await import("../components/debug-panel");
    renderPanel(DebugPanel);

    const sectionIds = [
      "debug-section-env",
      "debug-section-version",
      "debug-section-auth",
      "debug-section-theme",
      "debug-section-window-state",
      "debug-section-updater",
      "debug-section-log",
      "debug-section-sentry",
      "debug-section-clipboard",
      "debug-section-notification",
      "debug-section-link-guard",
      "debug-section-offline",
      "debug-section-plugins",
    ];

    for (const id of sectionIds) {
      expect(screen.getByTestId(id)).toBeDefined();
    }
  });

  it("clipboard test control calls copyText", async () => {
    const { DebugPanel } = await import("../components/debug-panel");
    renderPanel(DebugPanel);
    fireEvent.click(screen.getByTestId("debug-clipboard-test"));
    expect(copyText).toHaveBeenCalledWith("Clared Debug-Zwischenablage-Test");
  });

  it("component source must not render session tokens or keychain secrets", () => {
    const source = readFileSync(panelSourcePath, "utf8");
    expect(source).not.toMatch(/\btoken\b/i);
    expect(source).not.toMatch(/Bearer/i);
    expect(source).not.toMatch(/keychain_get/i);
    expect(source).not.toMatch(/keychain_set/i);
  });

  it("maskUpdaterEndpoint redacts hostname", async () => {
    const { maskUpdaterEndpoint } = await import("../components/debug-panel");
    const masked = maskUpdaterEndpoint(
      "https://updates.puzzlessdev.online/checkVersion?app_name=clared",
    );
    expect(masked).not.toContain("puzzlessdev");
    expect(masked).toContain("https://");
  });
});
