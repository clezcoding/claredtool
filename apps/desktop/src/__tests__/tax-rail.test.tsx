import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { TaxRail } from "../components/tax-rail";
import "../i18n";

afterEach(() => {
  cleanup();
});

describe("TaxRail", () => {
  it("shows 20% and €100 tax when engine emits invoice_tax_rate 20 on €500 net", () => {
    render(
      <MemoryRouter>
        <TaxRail
          tax={{
            invoice_tax_rate: 20,
            reverse_charge_flag: false,
            legal_reference: "UStG §12",
            applied_rule_id: "MS_A",
          }}
          netto={500}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Umsatzsteuer (20%)")).toBeTruthy();
    expect(screen.getAllByText("100,00 €").length).toBeGreaterThan(0);
    expect(screen.getByText("600,00 €")).toBeTruthy();
    expect(screen.queryByText(/2000%/)).toBeNull();
  });
});
