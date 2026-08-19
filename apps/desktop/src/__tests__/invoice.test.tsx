import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

afterEach(() => {
  cleanup();
});

function renderRechnung() {
  window.location.hash = "#/";
  render(<App />);
}

describe("invoice canvas", () => {
  it("renders one line-item card per sample line with Bezeichnung, Menge, Einzelpreis, Netto", () => {
    renderRechnung();
    const cards = screen.getAllByTestId("line-item-card");
    expect(cards).toHaveLength(SAMPLE_INVOICE.lineItems.length);

    SAMPLE_INVOICE.lineItems.forEach((item, index) => {
      const card = within(cards[index]);
      expect(card.getByText("Bezeichnung")).toBeTruthy();
      expect(card.getByText(item.bezeichnung)).toBeTruthy();
      expect(card.getByText("Menge")).toBeTruthy();
      expect(card.getByText(String(item.menge))).toBeTruthy();
      expect(card.getByText("Einzelpreis")).toBeTruthy();
      expect(card.getByText(item.einzelpreis.toFixed(2))).toBeTruthy();
      expect(card.getByText("Netto")).toBeTruthy();
      expect(card.getByText(item.netto.toFixed(2))).toBeTruthy();
    });
  });

  it("exposes + Position at the list bottom and a hover-delete control on each card", () => {
    renderRechnung();
    expect(screen.getByRole("button", { name: "+ Position" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Position löschen" })).toHaveLength(
      SAMPLE_INVOICE.lineItems.length,
    );
  });

  it("toggles to the empty-state heading on Neue Rechnung and restores the sample cards", () => {
    renderRechnung();
    fireEvent.click(screen.getByRole("button", { name: "Neue Rechnung" }));

    expect(
      screen.getByRole("heading", { name: "Noch keine Rechnung erstellt" }),
    ).toBeTruthy();
    expect(screen.queryAllByTestId("line-item-card")).toHaveLength(0);
    expect(screen.queryByText(SAMPLE_INVOICE.lineItems[0].bezeichnung)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Beispielrechnung anzeigen" }));
    expect(screen.getAllByTestId("line-item-card")).toHaveLength(
      SAMPLE_INVOICE.lineItems.length,
    );
  });
});
