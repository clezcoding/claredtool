import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(() => {
  cleanup();
});

describe("sidebar routes", () => {
  it("lists Rechnung, Entities, Kunden, Tax, PDF in that order", () => {
    window.location.hash = "#/";
    render(<App />);
    const nav = screen.getByRole("navigation");
    const labels = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent?.trim());
    expect(labels).toEqual(["Rechnung", "Entities", "Kunden", "Tax", "PDF"]);
  });

  it("lands on the sample invoice number on the index route", () => {
    window.location.hash = "#/";
    render(<App />);
    expect(screen.getByText("RE-2026-001")).toBeTruthy();
  });

  it.each([
    ["Entities", "Entities"],
    ["Kunden", "Kunden"],
    ["Tax", "Tax"],
    ["PDF", "PDF"],
  ] as const)("navigates to %s without a blank page", async (linkLabel, heading) => {
    window.location.hash = "#/";
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: linkLabel }));
    await waitFor(() => {
      expect(
        within(screen.getByRole("main")).getByRole("heading", { name: heading }),
      ).toBeTruthy();
    });
  });
});
