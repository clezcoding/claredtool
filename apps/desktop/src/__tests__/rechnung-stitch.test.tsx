/// <reference types="node" />
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { SAMPLE_INVOICE } from "../data/sample-invoice";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import { signedInOwner } from "./auth-signed-in";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const LAYOUT_PX = ["260", "72", "360", "1000"] as const;

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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockApis(invoices: unknown[]) {
  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/me")) return jsonResponse(signedInOwner);
    if (url.includes("/api/entities")) return jsonResponse([ENTITY]);
    if (url.endsWith("/api/invoices") && !init?.method) return jsonResponse(invoices);
    if (url.includes("/api/customers")) return jsonResponse([CUSTOMER]);
    if (url.includes("/api/tax/evaluate") && init?.method === "POST") {
      return jsonResponse(SAMPLE_INVOICE.taxDecision);
    }
    if (url.includes("/api/invoices/") && init?.method === "PATCH") {
      return jsonResponse(DRAFT_INVOICE);
    }
    if (url.includes("/api/invoices") && init?.method === "POST") {
      return jsonResponse({ ...DRAFT_INVOICE, id: "inv-new", number: "RE-2026-011", items: [] }, 201);
    }
    return new Response("not found", { status: 404 });
  });
}

afterEach(() => {
  cleanup();
  resetAuthMocks();
});

describe("rechnung stitch conversion", () => {
  it("exports EmptyState with title/description/ctaLabel/onCta", async () => {
    const specifier = ["..", "components", "empty-state"].join("/");
    const mod = await import(specifier);
    expect(typeof mod.EmptyState).toBe("function");
  });

  it("exports a Props interface on RechnungScreen for stitch:validate", () => {
    const src = readFileSync(resolve(ROOT, "apps/desktop/src/routes/rechnung.tsx"), "utf8");
    expect(src).toMatch(/export interface \w+Props/);
  });

  it("empty draft shows Beispielrechnung anzeigen and hides the tax rail", async () => {
    mockApis([]);
    window.location.hash = "#/";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Beispielrechnung anzeigen" })).toBeTruthy();
    });
    expect(screen.queryByTestId("tax-rail")).toBeNull();
    expect(screen.queryByRole("link", { name: "Vorschau" })).toBeNull();
  });

  it("empty CTA focuses the form and does not restore SAMPLE_INVOICE", async () => {
    mockApis([]);
    window.location.hash = "#/";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Beispielrechnung anzeigen" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Beispielrechnung anzeigen" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Entity")).toBeTruthy();
    });
    expect(document.activeElement?.id).toBe("entity-picker");
    expect(screen.queryByDisplayValue(SAMPLE_INVOICE.lineItems[0].bezeichnung)).toBeNull();
  });

  it("populated canvas uses max-w-[1000px] and tax rail uses w-[360px]", async () => {
    mockApis([DRAFT_INVOICE]);
    window.location.hash = "#/";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("tax-rail")).toBeTruthy();
    });
    expect(screen.getByTestId("tax-rail").className).toContain("w-[360px]");
    expect(screen.getByTestId("invoice-canvas").className).toContain("max-w-[1000px]");
  });

  it("layout constants 260/72/360/1000 are absent from spacing token declarations", () => {
    const css = [
      readFileSync(resolve(ROOT, "packages/ui/src/styles/globals.css"), "utf8"),
      readFileSync(resolve(ROOT, "apps/desktop/src/styles/globals.css"), "utf8"),
    ].join("\n");
    for (const px of LAYOUT_PX) {
      expect(css).not.toMatch(new RegExp(`--spacing[^:\\n]*:\\s*${px}px`));
    }
  });

  it("QA type: spacing review rows never list 260/72/360/1000", () => {
    const qa = readFileSync(
      resolve(ROOT, ".planning/phases/04.1-stitch-react-5-route-conversion/04.1-QA.md"),
      "utf8",
    );
    const chunks = qa.split(/### Spacing/);
    for (const chunk of chunks.slice(1)) {
      const table = chunk.split(/^### /m)[0];
      for (const px of LAYOUT_PX) {
        expect(table).not.toMatch(new RegExp(`\\|\\s*${px}\\s*\\|`));
      }
    }
  });

  it("invoice.write still gates Neue Rechnung", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/me")) {
        return jsonResponse({
          ...signedInOwner,
          permissions: signedInOwner.permissions.filter((permission) => permission !== "invoice.write"),
        });
      }
      if (url.includes("/api/entities")) return jsonResponse([ENTITY]);
      if (url.endsWith("/api/invoices")) return jsonResponse([DRAFT_INVOICE]);
      if (url.includes("/api/customers")) return jsonResponse([CUSTOMER]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("invoice-canvas")).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: "Neue Rechnung" })).toBeNull();
  });

  it("does not embed a Stitch iframe in rechnung.tsx", () => {
    const src = readFileSync(resolve(ROOT, "apps/desktop/src/routes/rechnung.tsx"), "utf8");
    expect(src).not.toMatch(/<iframe/i);
    expect(src).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
