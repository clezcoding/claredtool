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

describe.skip("phase03-product", () => {
  afterEach(() => {
    cleanup();
    resetAuthMocks();
  });

  it("keeps the previous invoice_tax_rate visible when evaluate fails", async () => {
    const lastGoodRate = SAMPLE_INVOICE.taxDecision.invoice_tax_rate;

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) {
        return new Response(JSON.stringify(signedInOwner), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/tax/evaluate") && init?.method === "POST") {
        return new Response(JSON.stringify({ message: "no_unique_match" }), {
          status: 422,
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
    expect(rail.getByText(String(lastGoodRate))).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue(SAMPLE_INVOICE.buyer.name), {
      target: { value: "Changed Buyer" },
    });

    await waitFor(
      () => {
        expect(screen.getByText(TAX_ERROR_COPY)).toBeTruthy();
        expect(rail.getByText(String(lastGoodRate))).toBeTruthy();
      },
      { timeout: 2000 },
    );
  });
});
