import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

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

describe("debug-panel offline section (D-33)", () => {
  it("renders debug-section-offline when open in DEV", async () => {
    const { DebugPanel, DEBUG_PANEL_ENABLED } = await import(
      "../components/debug-panel"
    );
    expect(DEBUG_PANEL_ENABLED).toBe(true);
    renderPanel(DebugPanel);
    expect(screen.getByTestId("debug-section-offline")).toBeDefined();
  });
});
