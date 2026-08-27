/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import { signedInOwner } from "./auth-signed-in";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const ENTITY = {
  id: "ent-1",
  name: "Seller GmbH",
  country: "DE",
  legalForm: "GmbH",
  address: "Berlin",
  vatId: "DE123",
};

const ENTITY_TWO = {
  id: "ent-2",
  name: "Buyer AG",
  country: "AT",
  legalForm: "AG",
  address: "Wien",
  vatId: "ATU123",
};

const CUSTOMER = {
  id: "cust-1",
  entityId: "ent-1",
  name: "Buyer US LLC",
  country: "US",
  address: "US address",
  vatId: null,
};

const signedInViewer = {
  ...signedInOwner,
  sub: "auth0|viewer",
  email: "viewer@clared.test",
  name: "Vera Viewer",
  groups: ["clared-viewer"],
  permissions: ["entity.read", "kunde.read", "invoice.read", "tax.evaluate"],
  primaryRole: "viewer",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockSession(me: typeof signedInOwner = signedInOwner) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/me")) return jsonResponse(me);
    if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
      return jsonResponse([]);
    }
    if (url.includes("/api/customers")) return jsonResponse([]);
    if (url.endsWith("/api/invoices")) return jsonResponse([]);
    return new Response("not found", { status: 404 });
  };
}

afterEach(() => {
  cleanup();
  resetAuthMocks();
});

describe("shared List+Panel module", () => {
  it("is a single registry-list-panel module imported by both route wrappers", () => {
    const componentsDir = resolve(ROOT, "apps/desktop/src/components");
    const listPanelFiles = readdirSync(componentsDir).filter((name) =>
      /list-panel|registry-list/.test(name),
    );
    expect(listPanelFiles).toEqual(["registry-list-panel.tsx"]);

    const entities = readFileSync(resolve(ROOT, "apps/desktop/src/routes/entities.tsx"), "utf8");
    const kunden = readFileSync(resolve(ROOT, "apps/desktop/src/routes/kunden.tsx"), "utf8");
    expect(entities).toMatch(/from ["']\.\.\/components\/registry-list-panel["']/);
    expect(kunden).toMatch(/from ["']\.\.\/components\/registry-list-panel["']/);
    expect(entities).not.toMatch(/function RegistryListPanel/);
    expect(kunden).not.toMatch(/function RegistryListPanel/);
  });

  it("exports a Props interface for stitch:validate", () => {
    const src = readFileSync(
      resolve(ROOT, "apps/desktop/src/components/registry-list-panel.tsx"),
      "utf8",
    );
    expect(src).toMatch(/export interface RegistryListPanelProps/);
  });

  it("keeps navigation at exactly five items", async () => {
    fetchMock.mockImplementation(mockSession());
    window.location.hash = "#/entities";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("navigation")).toBeTruthy();
    });
    expect(within(screen.getByRole("navigation")).getAllByRole("link")).toHaveLength(5);
  });
});

describe("Entities List+Panel", () => {
  it("renders a loading fixture while the live entities request is pending", async () => {
    let release: (value: Response) => void = () => undefined;
    const pending = new Promise<Response>((resolvePromise) => {
      release = resolvePromise;
    });
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) return jsonResponse(signedInOwner);
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        return pending;
      }
      if (url.endsWith("/api/invoices")) return jsonResponse([]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/entities";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("list-panel-loading")).toBeTruthy();
    });
    release(jsonResponse([]));
    await waitFor(() => {
      expect(screen.queryByTestId("list-panel-loading")).toBeNull();
    });
  });

  it("renders localized error copy and retry re-executes the live entities loader", async () => {
    let entitiesCalls = 0;
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) return jsonResponse(signedInOwner);
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        entitiesCalls += 1;
        if (entitiesCalls === 1) return new Response("error", { status: 500 });
        return jsonResponse([ENTITY]);
      }
      if (url.endsWith("/api/invoices")) return jsonResponse([]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/entities";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Etwas ist schiefgelaufen.")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
    });
    expect(entitiesCalls).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    await waitFor(() => {
      expect(screen.getByTestId("entity-row")).toBeTruthy();
      expect(screen.getByTestId("entity-detail")).toBeTruthy();
    });
    expect(entitiesCalls).toBe(2);
  });

  it("empty API mounts EmptyState with 37 copy", async () => {
    fetchMock.mockImplementation(mockSession());
    window.location.hash = "#/entities";
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Keine Geschäftseinheiten" }),
      ).toBeTruthy();
    });
    expect(
      screen.getByText("Lege deine erste Geschäftseinheit an, um Rechnungen zu erstellen."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Geschäftseinheit anlegen" })).toBeTruthy();
    expect(screen.queryByTestId("entity-row")).toBeNull();
  });

  it("populated rows render list plus selected detail and auto-open the first row", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) return jsonResponse(signedInOwner);
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        return jsonResponse([ENTITY, ENTITY_TWO]);
      }
      if (url.endsWith("/api/invoices")) return jsonResponse([]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/entities";
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByTestId("entity-row")).toHaveLength(2);
    });
    const detail = screen.getByTestId("entity-detail");
    expect(within(detail).getByText("Seller GmbH")).toBeTruthy();
    expect(screen.getByText("2 Einträge")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Stammdaten" })).toBeTruthy();
    expect(screen.getByText("search")).toBeTruthy();
    const selected = screen.getByTestId("entity-row").closest("tr");
    expect(selected?.className).toMatch(/brand-soft/);
    expect(screen.queryByText("Overview")).toBeNull();
  });

  it("canCreate false shows a disabled create affordance with the owner hint", async () => {
    fetchMock.mockImplementation(mockSession(signedInViewer));
    window.location.hash = "#/entities";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Neue Geschäftseinheit/ })).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /Neue Geschäftseinheit/ }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(screen.getByText("Nur Inhaber können Entities anlegen.")).toBeTruthy();
  });
});

describe("Kunden List+Panel", () => {
  it("renders a loading fixture while the live customers request is pending", async () => {
    let release: (value: Response) => void = () => undefined;
    const pending = new Promise<Response>((resolvePromise) => {
      release = resolvePromise;
    });
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) return jsonResponse(signedInOwner);
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        return pending;
      }
      if (url.includes("/api/customers")) return jsonResponse([]);
      if (url.endsWith("/api/invoices")) return jsonResponse([]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/kunden";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("list-panel-loading")).toBeTruthy();
    });
    release(jsonResponse([]));
    await waitFor(() => {
      expect(screen.queryByTestId("list-panel-loading")).toBeNull();
    });
  });

  it("renders localized error copy and retry re-executes the live kunden loader", async () => {
    let loadCalls = 0;
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) return jsonResponse(signedInOwner);
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        loadCalls += 1;
        if (loadCalls === 1) return new Response("error", { status: 500 });
        return jsonResponse([ENTITY]);
      }
      if (url.includes("/api/customers")) return jsonResponse([CUSTOMER]);
      if (url.endsWith("/api/invoices")) return jsonResponse([]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/kunden";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Etwas ist schiefgelaufen.")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
    });
    expect(loadCalls).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    await waitFor(() => {
      expect(screen.getByTestId("kunden-row")).toBeTruthy();
      expect(screen.getByTestId("kunden-detail")).toBeTruthy();
    });
    expect(loadCalls).toBeGreaterThan(1);
  });

  it("empty API mounts EmptyState with generic 09 copy", async () => {
    fetchMock.mockImplementation(mockSession());
    window.location.hash = "#/kunden";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Noch nichts vorhanden" })).toBeTruthy();
    });
    expect(screen.getByText("Sobald du Daten anlegst, erscheinen sie hier.")).toBeTruthy();
    expect(screen.queryByTestId("kunden-row")).toBeNull();
  });

  it("populated rows render list plus selected detail and auto-open the first row", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) return jsonResponse(signedInOwner);
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        return jsonResponse([ENTITY]);
      }
      if (url.includes("/api/customers")) return jsonResponse([CUSTOMER]);
      if (url.endsWith("/api/invoices")) return jsonResponse([]);
      return new Response("not found", { status: 404 });
    });
    window.location.hash = "#/kunden";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("kunden-row")).toBeTruthy();
    });
    expect(within(screen.getByTestId("kunden-detail")).getByText("Buyer US LLC")).toBeTruthy();
    expect(screen.getByText("1 Eintrag")).toBeTruthy();
  });

  it("canCreate false shows a disabled create affordance with the write hint", async () => {
    fetchMock.mockImplementation(mockSession(signedInViewer));
    window.location.hash = "#/kunden";
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Neuer Kunde/ })).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /Neuer Kunde/ }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("Keine Berechtigung zum Anlegen von Kunden.")).toBeTruthy();
  });
});
