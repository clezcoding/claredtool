import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import { signedInOwner } from "./auth-signed-in";

const signedInViewer = {
  sub: "auth0|viewer",
  email: "viewer@clared.test",
  name: "Vera Viewer",
  groups: ["clared-viewer"],
  permissions: ["entity.read", "invoice.read", "tax.evaluate"],
  primaryRole: "viewer",
};

const mockEntities: Array<{
  id: string;
  name: string;
  country: string;
  legalForm: string;
  address: string;
  vatId: string | null;
}> = [];

describe("phase03-product", () => {
  afterEach(() => {
    cleanup();
    resetAuthMocks();
    mockEntities.length = 0;
  });

  it("shows Anlegen visible but disabled with owner-only hint without entity.create", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/me")) {
        return new Response(JSON.stringify(signedInViewer), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/entities")) {
        return new Response(JSON.stringify(mockEntities), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/entities";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Neue Geschäftseinheit/ })).toBeTruthy();
    });

    const anlegen = screen.getByRole("button", { name: /Neue Geschäftseinheit/ });
    expect(anlegen.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText("Nur Inhaber können Entities anlegen."),
    ).toBeTruthy();
  });

  it("owner with entity.create: Anlegen enabled opens create form with Land wählen", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) {
        return new Response(JSON.stringify(signedInOwner), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/entities") && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as {
          name: string;
          country: string;
          legalForm: string;
          address: string;
          vatId?: string;
        };
        const created = {
          id: "entity-new-1",
          ...body,
          vatId: body.vatId ?? null,
        };
        mockEntities.push(created);
        return new Response(JSON.stringify(created), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/entities")) {
        return new Response(JSON.stringify(mockEntities), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/entities";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Neue Geschäftseinheit/ })).toBeTruthy();
    });

    const anlegen = screen.getByRole("button", { name: /Neue Geschäftseinheit/ });
    expect(anlegen.hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("heading", { name: "Geschäftseinheiten" })).toBeTruthy();
    fireEvent.click(anlegen);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Neue Geschäftseinheit" })).toBeTruthy();
      expect(screen.getByPlaceholderText("Land wählen")).toBeTruthy();
    });
  });
});
