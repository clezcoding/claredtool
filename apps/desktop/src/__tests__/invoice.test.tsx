import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  it("shows staged Live Steuerberechnung fields and Vorschau navigates to /pdf", async () => {
    renderRechnung();
    const rail = within(screen.getByTestId("tax-rail"));
    const tax = SAMPLE_INVOICE.taxDecision;

    expect(rail.getByRole("heading", { name: "Live Steuerberechnung" })).toBeTruthy();
    expect(rail.getByText("invoice_tax_rate")).toBeTruthy();
    expect(rail.getByText(String(tax.invoice_tax_rate))).toBeTruthy();
    expect(rail.getByText("reverse_charge_flag")).toBeTruthy();
    expect(rail.getByText(String(tax.reverse_charge_flag))).toBeTruthy();
    expect(rail.getByText("legal_reference")).toBeTruthy();
    expect(rail.getByText(tax.legal_reference)).toBeTruthy();
    expect(rail.getByText("applied_rule_id")).toBeTruthy();
    expect(rail.getByText(tax.applied_rule_id)).toBeTruthy();

    const peek = screen.getByRole("link", { name: "Vorschau" });
    expect(peek.getAttribute("href")).toBe("#/pdf");
    fireEvent.click(peek);
    await waitFor(() => {
      expect(
        within(screen.getByRole("main")).getByRole("heading", { name: "PDF" }),
      ).toBeTruthy();
    });
  });

  it("renders SAMPLE_INVOICE number, parties, and totals on the /pdf paper", () => {
    window.location.hash = "#/pdf";
    render(<App />);
    const paper = within(screen.getByTestId("pdf-paper"));
    expect(paper.getByText(SAMPLE_INVOICE.rechnungsnummer)).toBeTruthy();
    expect(paper.getByText(SAMPLE_INVOICE.seller.name)).toBeTruthy();
    expect(paper.getByText(SAMPLE_INVOICE.buyer.name)).toBeTruthy();
    expect(paper.getByText(`Netto ${SAMPLE_INVOICE.nettoGesamt.toFixed(2)}`)).toBeTruthy();
    expect(paper.getByText(`Brutto ${SAMPLE_INVOICE.bruttoGesamt.toFixed(2)}`)).toBeTruthy();
  });
});
