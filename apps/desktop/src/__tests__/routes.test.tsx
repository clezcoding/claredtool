import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(() => {
  cleanup();
});

async function renderSignedIn() {
  window.location.hash = "#/";
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
}

describe("sidebar routes", () => {
  it("lists Rechnung, Entities, Kunden, Tax, PDF in that order", async () => {
    await renderSignedIn();
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(5);
    for (const name of ["Rechnung", "Entities", "Kunden", "Tax", "PDF"]) {
      expect(within(nav).getByRole("link", { name })).toBeTruthy();
    }
  });

  it("lands on the first-run empty invoice on the index route", async () => {
    await renderSignedIn();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Noch keine Rechnung erstellt" }),
      ).toBeTruthy();
    });
  });

  it.each([
    ["Entities", "Geschäftseinheiten"],
    ["Kunden", "Kunden"],
    ["Tax", "Steuerregeln"],
    ["PDF", "PDF-Vorschau / Export"],
  ] as const)("navigates to %s without a blank page", async (linkLabel, heading) => {
    await renderSignedIn();
    fireEvent.click(screen.getByRole("link", { name: linkLabel }));
    await waitFor(() => {
      expect(
        within(screen.getByRole("main")).getByRole("heading", { name: heading }),
      ).toBeTruthy();
    });
  });
});
