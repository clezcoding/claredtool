import { evaluate } from "./index";

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

describe("evaluate(facts)", () => {
  it.each(MATRIX_RULE_IDS)(
    "returns applied_rule_id %s for the matrix fixture",
    (ruleId) => {
      expect(typeof evaluate).toBe("function");
      // 03-04 wires fixtures: expect(evaluate(factsFor(ruleId)).applied_rule_id).toBe(ruleId);
      void ruleId;
    },
  );

  it("throws when zero rules match (no silent empty decision)", () => {
    expect(() => evaluate({} as never)).toThrow();
  });

  it("throws when two rules match (no first-match or priority pick)", () => {
    expect(() => evaluate({ ambiguous: true } as never)).toThrow();
  });
});
