/// <reference types="node" />
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "../i18n";
import { SAMPLE_INVOICE } from "../data/sample-invoice";
import {
  resetTaxLiveState,
  setTaxLiveState,
} from "../data/tax-live-store";
import { TaxScreen } from "../routes/tax";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const TAX_SRC = resolve(ROOT, "apps/desktop/src/routes/tax.tsx");

const TAX_FIELDS = [
  "place_of_supply_country",
  "tax_liability_party",
  "invoice_tax_rate",
  "invoice_tax_shown",
  "reverse_charge_flag",
  "legal_reference",
  "invoice_text_block_id",
  "applied_rule_id",
  "applied_rule_version",
] as const;

afterEach(() => {
  cleanup();
  resetTaxLiveState();
});

describe("tax Stitch conversion", () => {
  it("exports TaxScreenProps for stitch:validate", () => {
    const src = readFileSync(TAX_SRC, "utf8");
    expect(src).toMatch(/export interface TaxScreenProps/);
  });

  it("subscribes to tax-live-store via useSyncExternalStore", () => {
    const src = readFileSync(TAX_SRC, "utf8");
    expect(src).toMatch(/subscribeTaxLive/);
    expect(src).toMatch(/getTaxLiveState/);
    expect(src).toMatch(/useSyncExternalStore/);
  });

  it("renders all nine StagedTaxDecision fields as placeholders when absent", () => {
    render(<TaxScreen />);
    const panel = within(screen.getByTestId("tax-decision"));
    for (const field of TAX_FIELDS) {
      expect(panel.getByText(field)).toBeTruthy();
    }
    expect(panel.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("shows live store values after setTaxLiveState", () => {
    setTaxLiveState(SAMPLE_INVOICE.taxDecision, null);
    render(<TaxScreen />);
    const panel = within(screen.getByTestId("tax-decision"));
    expect(panel.getByText("US")).toBeTruthy();
    expect(panel.getByText("eu-b2b-reverse-charge")).toBeTruthy();
    expect(panel.getByText("1.0.0")).toBeTruthy();
  });

  it("shows F-05 Neue Regel and Neu ordnen controls", () => {
    render(<TaxScreen />);
    const newRule = screen.getByRole("button", { name: /Neue Regel/ });
    const reorder = screen.getByRole("button", { name: /Neu ordnen/ });
    expect(newRule.hasAttribute("disabled")).toBe(false);
    expect(reorder.hasAttribute("disabled")).toBe(false);
  });

  it("uses Material Symbols for F-05 chrome, not Lucide", () => {
    render(<TaxScreen />);
    const icons = document.querySelectorAll(".material-symbols-outlined");
    expect(icons.length).toBeGreaterThan(0);
    const ligatures = [...icons].map((node) => node.textContent ?? "");
    expect(ligatures.some((text) => text.includes("add"))).toBe(true);
    expect(
      ligatures.some(
        (text) => text.includes("drag_indicator") || text.includes("reorder"),
      ),
    ).toBe(true);
  });

  it("toggles are real switches, not presentation-only chrome", () => {
    render(<TaxScreen />);
    const toggles = screen.getAllByRole("switch");
    expect(toggles.length).toBeGreaterThan(0);
    const first = toggles[0];
    const before = first.getAttribute("aria-checked");
    fireEvent.click(first);
    expect(first.getAttribute("aria-checked")).not.toBe(before);
  });

  it("Reorder click shows Bald toast when no mutation API exists", () => {
    render(<TaxScreen />);
    fireEvent.click(screen.getByRole("button", { name: /Neu ordnen/ }));
    expect(screen.getByText("Bald")).toBeTruthy();
  });
});
