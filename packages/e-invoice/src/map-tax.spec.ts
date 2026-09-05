import type { TaxDecision } from "@clared/tax-engine";
import { EInvoiceError } from "./errors";
import { mapVatCategory } from "./map-tax";

describe("map-tax", () => {
  it("maps DE B2B 19% shown to category S", () => {
    const tax: TaxDecision = {
      place_of_supply_country: "DE",
      tax_liability_party: "supplier",
      invoice_tax_rate: 19,
      invoice_tax_shown: true,
      reverse_charge_flag: false,
      legal_reference: "§ 12 Abs. 1 UStG",
      invoice_text_block_id: "de-b2b-19",
      applied_rule_id: "de-b2b-standard-19",
      applied_rule_version: "1",
      source_citation: [],
      audit_trace: [],
    };
    expect(mapVatCategory(tax)).toBe("S");
  });

  it("throws EInvoiceError with TAX_MAPPING for unknown tax shape", () => {
    const tax: TaxDecision = {
      place_of_supply_country: "DE",
      tax_liability_party: "customer",
      invoice_tax_rate: 0,
      invoice_tax_shown: false,
      reverse_charge_flag: true,
      legal_reference: "RC",
      invoice_text_block_id: "rc",
      applied_rule_id: "rc",
      applied_rule_version: "1",
      source_citation: [],
      audit_trace: [],
    };
    try {
      mapVatCategory(tax);
      fail("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(EInvoiceError);
      const e = err as EInvoiceError;
      expect(e.code).toBe("TAX_MAPPING");
      expect(e.message).not.toMatch(/Musterstrasse|DE123456789|INV-|IBAN/i);
    }
  });
});
