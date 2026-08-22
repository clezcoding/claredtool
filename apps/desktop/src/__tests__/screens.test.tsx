import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";

afterEach(() => {
  cleanup();
  resetAuthMocks();
});

async function openScreen(linkLabel: string, heading: string) {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/me")) {
      return new Response(
        JSON.stringify({
          sub: "auth0|viewer",
          email: "viewer@clared.test",
          name: "Vera Viewer",
          groups: ["clared-viewer"],
          permissions: ["entity.read", "kunde.read", "invoice.read", "tax.evaluate"],
          primaryRole: "viewer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.includes("/api/entities")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/customers")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("not found", { status: 404 });
  });

  window.location.hash = "#/";
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
  fireEvent.click(screen.getByRole("link", { name: linkLabel }));
  await waitFor(() => {
    expect(
      within(screen.getByRole("main")).getByRole("heading", { name: heading }),
    ).toBeTruthy();
  });
}

describe("entities screen", () => {
  it("shows empty copy when no entities exist", async () => {
    await openScreen("Entities", "Entities");
    expect(screen.getByText("Noch keine Entity angelegt")).toBeTruthy();
  });

  it("shows a disabled Anlegen button with the Inhaber RBAC hint", async () => {
    await openScreen("Entities", "Entities");
    const anlegen = screen.getByRole("button", { name: "Anlegen" });
    expect(anlegen.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText("Nur Inhaber können Entities anlegen."),
    ).toBeTruthy();
  });
});

describe("kunden screen", () => {
  it("shows empty copy when no customers exist", async () => {
    await openScreen("Kunden", "Kunden");
    expect(screen.getByText("Noch keine Kunden angelegt")).toBeTruthy();
  });

  it("shows a disabled Anlegen button with the kunde.write RBAC hint", async () => {
    await openScreen("Kunden", "Kunden");
    const anlegen = screen.getByRole("button", { name: "Anlegen" });
    expect(anlegen.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText("Keine Berechtigung zum Anlegen von Kunden."),
    ).toBeTruthy();
  });
});

describe("tax screen", () => {
  it("renders staged TaxDecision canonical fields including applied_rule_id", async () => {
    await openScreen("Tax", "Tax");
    const panel = within(screen.getByTestId("tax-decision"));
    expect(panel.getByText("applied_rule_id")).toBeTruthy();
    expect(panel.getByText("legal_reference")).toBeTruthy();
    expect(panel.getByText("place_of_supply_country")).toBeTruthy();
    expect(panel.getByText("tax_liability_party")).toBeTruthy();
    expect(panel.getByText("invoice_tax_rate")).toBeTruthy();
    expect(panel.getByText("invoice_tax_shown")).toBeTruthy();
    expect(panel.getByText("reverse_charge_flag")).toBeTruthy();
    expect(panel.getByText("invoice_text_block_id")).toBeTruthy();
    expect(panel.getByText("applied_rule_version")).toBeTruthy();

    expect(panel.queryByText("rate", { exact: true })).toBeNull();
    expect(panel.queryByText("reverse_charge", { exact: true })).toBeNull();
    expect(panel.queryByText("legal_text", { exact: true })).toBeNull();
  });
});
