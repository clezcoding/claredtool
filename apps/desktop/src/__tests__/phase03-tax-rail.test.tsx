import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { SAMPLE_INVOICE } from "../data/sample-invoice";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import { signedInOwner } from "./auth-signed-in";

const TAX_ERROR_COPY =
  "Steuerberechnung fehlgeschlagen. Letzte gültige Werte bleiben sichtbar.";

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
  name: SAMPLE_INVOICE.buyer.name,
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

describe("phase03-product", () => {
  afterEach(() => {
    cleanup();
    resetAuthMocks();
  });

  it("keeps the previous invoice_tax_rate visible when evaluate fails", async () => {
    let evaluateCalls = 0;

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
        evaluateCalls += 1;
        if (evaluateCalls === 1) {
          return new Response(JSON.stringify(SAMPLE_INVOICE.taxDecision), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ message: "no_unique_match" }), {
          status: 422,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/invoices/") && init?.method === "PATCH") {
        return new Response(JSON.stringify(DRAFT_INVOICE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("tax-rail")).toBeTruthy();
    });

    const rail = within(screen.getByTestId("tax-rail"));
    await waitFor(() => {
      expect(rail.getByText(SAMPLE_INVOICE.taxDecision.legal_reference)).toBeTruthy();
    });

    const lineInput = screen
      .getAllByRole("textbox")
      .find((node) => node.closest('[data-testid="line-item-card"]'));
    expect(lineInput).toBeTruthy();
    fireEvent.change(lineInput!, { target: { value: "Changed line" } });

    await waitFor(
      () => {
        expect(screen.getByText(TAX_ERROR_COPY)).toBeTruthy();
        expect(rail.getByText(SAMPLE_INVOICE.taxDecision.legal_reference)).toBeTruthy();
      },
      { timeout: 2000 },
    );
  });
});
