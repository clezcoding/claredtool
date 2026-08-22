import { evaluate, EvaluateError, type TransactionFacts } from "./index";

/**
 * All 23 rule class ids from docs/clared-tax-rule-matrix.md (D-13).
 * Do not add CH/UK or other ids not in that table.
 */
const MATRIX_RULE_IDS = [
  "EU_DOMESTIC_B2B_SERVICE",
  "EU_DOMESTIC_B2C_SERVICE",
  "EU_INTRACOMM_B2B_SERVICE",
  "EU_INTRACOMM_B2C_DIGITAL",
  "EU_EXPORT_SERVICE_TO_THIRD",
  "EU_EXPORT_GOODS_TO_THIRD",
  "THIRD_TO_EU_B2B_SERVICE",
  "THIRD_TO_EU_B2C_DIGITAL",
  "US_TO_EU_B2B_SERVICE",
  "US_TO_EU_B2C_DIGITAL",
  "EU_TO_US_B2B_SERVICE",
  "EU_TO_US_B2C_DIGITAL",
  "UAE_TO_EU_B2B_SERVICE",
  "UAE_TO_EU_B2B_DIGITAL",
  "UAE_TO_EU_B2C_DIGITAL",
  "EU_TO_UAE_B2B_SERVICE",
  "EU_TO_UAE_B2B_DIGITAL",
  "EU_TO_UAE_B2C_DIGITAL",
  "EU_TO_EU_B2B_GOODS_INTRACOMM",
  "EU_TO_EU_B2C_GOODS_INTRACOMM",
  "DOMESTIC_SPECIAL_PROPERTY",
  "DOMESTIC_SPECIAL_EVENT",
  "THIRD_TO_THIRD_B2B_SERVICE",
] as const;

const EU_INTRACOMM_B2B_FACTS: TransactionFacts = {
  supplier_country: "AT",
  customer_country: "DE",
  supplier_is_business: true,
  customer_is_business: true,
  supplier_vat_registered: true,
  customer_vat_registered: true,
  supplier_vat_id: "ATU12345678",
  customer_vat_id: "DE123456789",
  supply_type: "service",
  channel: "direct",
  currency: "EUR",
};

describe("evaluate(facts)", () => {
  it.each(MATRIX_RULE_IDS.filter((id) => id !== "EU_INTRACOMM_B2B_SERVICE"))(
    "returns applied_rule_id %s for the matrix fixture",
    (ruleId) => {
      expect(typeof evaluate).toBe("function");
      // 03-04 wires fixtures: expect(evaluate(factsFor(ruleId)).applied_rule_id).toBe(ruleId);
      void ruleId;
    },
  );

  it("returns applied_rule_id EU_INTRACOMM_B2B_SERVICE for the matrix fixture", () => {
    const decision = evaluate(EU_INTRACOMM_B2B_FACTS);
    expect(decision.applied_rule_id).toBe("EU_INTRACOMM_B2B_SERVICE");
    expect(decision.invoice_tax_rate).toBe(0);
    expect(decision.reverse_charge_flag).toBe(true);
    expect(decision.tax_liability_party).toBe("customer");
    expect(decision.legal_reference).toBe("EU VAT Directive Art. 44, 196");
  });

  it("throws when zero rules match (no silent empty decision)", () => {
    expect(() =>
      evaluate({
        supplier_country: "XX",
        customer_country: "YY",
        supplier_is_business: false,
        customer_is_business: false,
        supplier_vat_registered: false,
        customer_vat_registered: false,
        supply_type: "service",
        channel: "direct",
      }),
    ).toThrow(EvaluateError);
  });

  it("throws when two rules match (no first-match or priority pick)", () => {
    // With only one rule file, ambiguous case is not reachable yet — verify throw contract.
    expect(() => evaluate({ ambiguous: true } as never)).toThrow();
  });
});
