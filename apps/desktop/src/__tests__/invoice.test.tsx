import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { SAMPLE_INVOICE } from "../data/sample-invoice";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import { signedInOwner } from "./auth-signed-in";

const ENTITY = {
  id: "ent-1",
  name: "Seller GmbH",
  country: "DE",
  legalForm: "GmbH",
  address: "Berlin",
  vatId: "DE123",
  currencyDefault: "EUR",
};

const CUSTOMER = {
  id: "cust-1",
  entityId: "ent-1",
  name: "Buyer US LLC",
  country: "US",
  address: "US address",
  vatId: null,
};

const DRAFT_INVOICE = {
  id: "inv-1",
  entityId: "ent-1",
  customerId: "cust-1",
  number: "RE-2026-010",
  currency: "EUR",
  date: "2026-08-20",
  dueDate: "2026-09-20",
  updatedAt: "2026-08-22T10:00:00.000Z",
  items: SAMPLE_INVOICE.lineItems.map((item, index) => ({
    id: `item-${index}`,
    position: index,
    bezeichnung: item.bezeichnung,
    menge: item.menge,
    einzelpreis: item.einzelpreis,
    netto: item.netto,
  })),
};

function mockSignedInInvoiceApis() {
  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/me")) {
      return new Response(JSON.stringify(signedInOwner), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/entities")) {
      return new Response(JSON.stringify([ENTITY]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/api/invoices") && !init?.method) {
      return new Response(JSON.stringify([DRAFT_INVOICE]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/customers")) {
      return new Response(JSON.stringify([CUSTOMER]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/tax/evaluate") && init?.method === "POST") {
      return new Response(JSON.stringify(SAMPLE_INVOICE.taxDecision), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/invoices/") && init?.method === "PATCH") {
      return new Response(JSON.stringify(DRAFT_INVOICE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/invoices") && init?.method === "POST") {
      return new Response(
        JSON.stringify({
          ...DRAFT_INVOICE,
          id: "inv-new",
          number: "RE-2026-011",
          items: [],
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response("not found", { status: 404 });
  });
}

afterEach(() => {
  cleanup();
  resetAuthMocks();
});

async function renderRechnung() {
  mockSignedInInvoiceApis();
  window.location.hash = "#/";
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
  await waitFor(() => {
    expect(screen.getAllByTestId("line-item-card").length).toBeGreaterThan(0);
  });
}

describe("invoice canvas", () => {
  it("renders one line-item card per draft line with Bezeichnung, Menge, Einzelpreis, Netto", async () => {
    await renderRechnung();
    const cards = screen.getAllByTestId("line-item-card");
    expect(cards).toHaveLength(DRAFT_INVOICE.items.length);

    DRAFT_INVOICE.items.forEach((item, index) => {
      const card = within(cards[index]);
      expect(card.getByText("Bezeichnung")).toBeTruthy();
      expect(card.getByDisplayValue(item.bezeichnung)).toBeTruthy();
      expect(card.getByText("Menge")).toBeTruthy();
      expect(card.getByText("Einzelpreis")).toBeTruthy();
      expect(card.getByText("Netto")).toBeTruthy();
      expect(card.getByText(item.netto.toFixed(2))).toBeTruthy();
    });
  });

  it("exposes + Position at the list bottom and a hover-delete control on each card", async () => {
    await renderRechnung();
    expect(screen.getByRole("button", { name: "+ Zeile hinzufügen" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Position löschen" })).toHaveLength(
      DRAFT_INVOICE.items.length,
    );
  });

  it("Neue Rechnung opens an empty form without restoring sample cards", async () => {
    await renderRechnung();
    fireEvent.click(screen.getByRole("button", { name: "Neue Rechnung" }));

    expect(screen.queryByText(DRAFT_INVOICE.items[0].bezeichnung)).toBeNull();
    expect(screen.getAllByTestId("line-item-card")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Noch keine Rechnung erstellt" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Beispielrechnung anzeigen" })).toBeNull();
  });

  it("shows live tax fields from evaluate and Vorschau navigates to /pdf", async () => {
    await renderRechnung();
    const rail = within(screen.getByTestId("tax-rail"));
    const tax = SAMPLE_INVOICE.taxDecision;

    await waitFor(() => {
      expect(rail.getByText(tax.legal_reference)).toBeTruthy();
    });

    expect(rail.getByRole("heading", { name: "Steuerübersicht" })).toBeTruthy();
    expect(rail.getByText(tax.legal_reference)).toBeTruthy();
    expect(rail.getByText("Rechnung erfüllt Pflichtangaben")).toBeTruthy();

    const peek = screen.getByRole("link", { name: "PDF Vorschau" });
    expect(peek.getAttribute("href")).toBe("#/pdf");
    fireEvent.click(peek);
    await waitFor(() => {
      expect(
        within(screen.getByRole("main")).getByRole("heading", {
          name: "PDF-Vorschau / Export",
        }),
      ).toBeTruthy();
    });
  });

  it("shows ErrorState in the main pane when invoice.read is missing", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/me")) {
        return new Response(
          JSON.stringify({
            ...signedInOwner,
            permissions: signedInOwner.permissions.filter(
              (permission) => permission !== "invoice.read",
            ),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("navigation")).toBeTruthy();
      expect(screen.getByTestId("error-state")).toBeTruthy();
    });
  });

  it("renders SAMPLE_INVOICE number, parties, and totals on the /pdf paper", async () => {
    window.location.hash = "#/pdf";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("pdf-paper")).toBeTruthy();
    });
    const paper = within(screen.getByTestId("pdf-paper"));
    expect(paper.getByText(SAMPLE_INVOICE.rechnungsnummer)).toBeTruthy();
    expect(paper.getByText(SAMPLE_INVOICE.seller.name)).toBeTruthy();
    expect(paper.getByText(SAMPLE_INVOICE.buyer.name)).toBeTruthy();
    expect(paper.getByText(`Netto ${SAMPLE_INVOICE.nettoGesamt.toFixed(2)}`)).toBeTruthy();
    expect(paper.getByText(`Brutto ${SAMPLE_INVOICE.bruttoGesamt.toFixed(2)}`)).toBeTruthy();
  });
});
