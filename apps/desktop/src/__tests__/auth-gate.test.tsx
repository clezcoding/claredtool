import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
});

describe.skip("phase02-auth", () => {
  it("unsigned gate shows Clared, body copy, Anmelden, and no navigation", async () => {
    const specifier = ["..", "auth", "login-gate"].join("/");
    const { LoginGate } = await import(specifier);
    render(<LoginGate />);
    expect(screen.getByRole("heading", { name: "Clared" })).toBeTruthy();
    expect(screen.getByText("Anmelden, um Rechnungen zu stellen.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
