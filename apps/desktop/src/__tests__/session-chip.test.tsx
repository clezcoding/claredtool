import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { signedInOwner } from "./auth-signed-in";

afterEach(() => {
  cleanup();
});

const BADGE_LABELS: Record<string, string> = {
  platform: "Plattform",
  owner: "Inhaber",
  admin: "Admin",
  accountant: "Buchhaltung",
  tax: "Steuer",
  clerk: "Sachbearbeitung",
  auditor: "Prüfung",
  viewer: "Ansicht",
};

describe("phase02-auth", () => {
  it.each(Object.entries(BADGE_LABELS))(
    "badge for %s is %s",
    async (primaryRole, label) => {
      const specifier = ["..", "components", "session-chip"].join("/");
      const { SessionChip } = await import(specifier);
      render(
        <SessionChip me={{ ...signedInOwner, primaryRole, groups: [`clared-${primaryRole}`] }} />,
      );
      expect(screen.getByText(label)).toBeTruthy();
    },
  );

  it("falls back to email when name is empty and never shows sub", async () => {
    const specifier = ["..", "components", "session-chip"].join("/");
    const { SessionChip } = await import(specifier);
    render(
      <SessionChip
        me={{ ...signedInOwner, name: "", email: "fallback@clared.test", sub: "must-not-appear" }}
      />,
    );
    expect(screen.getByText("fallback@clared.test")).toBeTruthy();
    expect(screen.queryByText("must-not-appear")).toBeNull();
  });

  it("mini-menu shows Rolle then Abmelden", async () => {
    const specifier = ["..", "components", "session-chip"].join("/");
    const { SessionChip } = await import(specifier);
    render(<SessionChip me={signedInOwner} />);
    fireEvent.click(screen.getByRole("button", { name: "Ada Owner" }));
    expect(screen.getByText("Rolle: Inhaber")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Abmelden" })).toBeTruthy();
  });
});
