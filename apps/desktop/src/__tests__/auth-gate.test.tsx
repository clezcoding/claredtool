import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { fetchMock, resetAuthMocks, tauriInvoke } from "./auth-test-doubles";

afterEach(() => {
  cleanup();
  resetAuthMocks();
});

describe("phase02-auth", () => {
  it("unsigned gate shows Clared, body copy, Anmelden, and no navigation", async () => {
    const specifier = ["..", "auth", "login-gate"].join("/");
    const { LoginGate } = await import(specifier);
    render(<LoginGate />);
    expect(screen.getByRole("heading", { name: "Clared" })).toBeTruthy();
    expect(screen.getByText("Anmelden, um Rechnungen zu stellen.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("Anmelden invokes open_login_window and keeps the gate visible", async () => {
    const specifier = ["..", "auth", "login-gate"].join("/");
    const { LoginGate } = await import(specifier);
    render(<LoginGate />);
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));
    await waitFor(() => {
      expect(tauriInvoke).toHaveBeenCalledWith("open_login_window");
    });
    expect(screen.getByRole("heading", { name: "Clared" })).toBeTruthy();
    expect(screen.queryByTestId("spinner")).toBeNull();
  });

  it("Enter on Anmelden opens the login window", async () => {
    const specifier = ["..", "auth", "login-gate"].join("/");
    const { LoginGate } = await import(specifier);
    render(<LoginGate />);
    const button = screen.getByRole("button", { name: "Anmelden" });
    button.focus();
    fireEvent.submit(button.closest("form") ?? button);
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    fireEvent.click(button);
    await waitFor(() => {
      expect(tauriInvoke).toHaveBeenCalledWith("open_login_window");
    });
  });

  it("boot with keychain token shows Wird geladen then the first-run empty invoice", async () => {
    window.location.hash = "#/";
    const { default: App } = await import("../App");
    render(<App />);
    expect(screen.getByText("Wird geladen")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Noch keine Rechnung erstellt" }),
      ).toBeTruthy();
    });
    expect(screen.getByRole("navigation")).toBeTruthy();
  });

  it("boot /me 401 shows the gate without navigation", async () => {
    tauriInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "keychain_get_session") return "dead-token";
      return undefined;
    });
    fetchMock.mockImplementation(
      async () => new Response("unauthorized", { status: 401 }),
    );
    window.location.hash = "#/";
    const { default: App } = await import("../App");
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Clared" })).toBeTruthy();
    });
    expect(screen.getByText("Anmelden, um Rechnungen zu stellen.")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("boot network error shows ErrorState and retry calls /me", async () => {
    tauriInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "keychain_get_session") return "test-token";
      return undefined;
    });
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    window.location.hash = "#/";
    const { default: App } = await import("../App");
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeTruthy();
    });
    expect(
      screen.getByText(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Noch keine Rechnung erstellt" }),
      ).toBeTruthy();
    });
  });
});
