import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ErrorState } from "../components/error-state";

afterEach(() => {
  cleanup();
});

describe("phase02-auth", () => {
  it("401 banner uses session copy with role alert, not ErrorState copy", async () => {
    const specifier = ["..", "components", "session-banner"].join("/");
    const { SessionBanner } = await import(specifier);
    render(<SessionBanner kind="unauthorized" />);
    const banner = screen.getByRole("alert");
    expect(banner.textContent).toContain("Sitzung abgelaufen. Bitte erneut anmelden.");
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeTruthy();
    expect(screen.queryByText(/Ein Fehler ist aufgetreten/)).toBeNull();
  });

  it("cancel banner uses Anmeldung abgebrochen with role status", async () => {
    const specifier = ["..", "components", "session-banner"].join("/");
    const { SessionBanner } = await import(specifier);
    render(<SessionBanner kind="cancel" />);
    const banner = screen.getByRole("status");
    expect(banner.textContent).toContain("Anmeldung abgebrochen");
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeTruthy();
  });

  it("network path still uses ErrorState copy", () => {
    render(<ErrorState onRetry={() => undefined} />);
    expect(
      screen.getByText(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
      ),
    ).toBeTruthy();
  });
});
