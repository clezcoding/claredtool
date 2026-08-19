import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("sidebar routes", () => {
  it("lists Rechnung, Entities, Kunden, Tax, PDF in that order", () => {
    render(<App />);
    const nav = screen.getByRole("navigation");
    const labels = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent?.trim());
    expect(labels).toEqual(["Rechnung", "Entities", "Kunden", "Tax", "PDF"]);
  });

  it("lands on the sample invoice number on the index route", () => {
    render(<App />);
    expect(screen.getByText("RE-2026-001")).toBeTruthy();
  });

  it.each([
    ["Entities", "Entities"],
    ["Kunden", "Kunden"],
    ["Tax", "Tax"],
    ["PDF", "PDF"],
  ] as const)("navigates to %s without a blank page", (linkLabel, heading) => {
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: linkLabel }));
    expect(
      within(screen.getByRole("main")).getByRole("heading", { name: heading }),
    ).toBeTruthy();
  });
});
