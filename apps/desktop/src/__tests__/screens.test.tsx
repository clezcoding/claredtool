import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

afterEach(() => {
  cleanup();
});

async function openScreen(linkLabel: string, heading: string) {
  window.location.hash = "#/";
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: linkLabel }));
  await waitFor(() => {
    expect(
      within(screen.getByRole("main")).getByRole("heading", { name: heading }),
    ).toBeTruthy();
  });
}

describe("entities screen", () => {
  it("renders exactly one row with the SAMPLE_INVOICE seller name", async () => {
    await openScreen("Entities", "Entities");
    const rows = within(screen.getByRole("main")).getAllByTestId("entity-row");
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByText(SAMPLE_INVOICE.seller.name)).toBeTruthy();
  });

  it("clicking the row reveals a read-only detail containing the seller ustid", async () => {
    await openScreen("Entities", "Entities");
    fireEvent.click(screen.getByTestId("entity-row"));
    const detail = screen.getByTestId("entity-detail");
    expect(within(detail).getByText(SAMPLE_INVOICE.seller.ustid)).toBeTruthy();
  });

  it("shows a disabled Anlegen button with the Phase-3 hint", async () => {
    await openScreen("Entities", "Entities");
    const anlegen = screen.getByRole("button", { name: "Anlegen" });
    expect(anlegen.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("Wird in Phase 3 aktiviert")).toBeTruthy();
  });
});
