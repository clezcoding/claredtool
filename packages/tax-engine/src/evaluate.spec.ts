import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

type MatrixFixture = {
  facts: TransactionFacts;
  rate: number;
  reverse: boolean;
  liability: "supplier" | "customer";
  legal_reference: string;
  invoice_text_block_id: string;
};

const MATRIX_FIXTURES: Record<(typeof MATRIX_RULE_IDS)[number], MatrixFixture> =
  {
    EU_DOMESTIC_B2B_SERVICE: {
      facts: {
        supplier_country: "AT",
        customer_country: "AT",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 20,
      reverse: false,
      liability: "supplier",
      legal_reference: "MS_A national VAT law (e.g. local UStG)",
      invoice_text_block_id: "EU_DOMESTIC_SERVICE_STANDARD",
    },
    EU_DOMESTIC_B2C_SERVICE: {
      facts: {
        supplier_country: "AT",
        customer_country: "AT",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "service",
        channel: "direct",
      },
      rate: 20,
      reverse: false,
      liability: "supplier",
      legal_reference: "MS_A national VAT law",
      invoice_text_block_id: "EU_DOMESTIC_SERVICE_B2C",
    },
    EU_INTRACOMM_B2B_SERVICE: {
      facts: {
        supplier_country: "AT",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: true,
      liability: "customer",
      legal_reference: "EU VAT Directive Art. 44, 196",
      invoice_text_block_id: "EU_RC_B2B_SERVICE",
    },
    EU_INTRACOMM_B2C_DIGITAL: {
      facts: {
        supplier_country: "AT",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 19,
      reverse: false,
      liability: "supplier",
      legal_reference: "EU VAT rules for digital services to consumers",
      invoice_text_block_id: "EU_DIGITAL_B2C",
    },
    EU_EXPORT_SERVICE_TO_THIRD: {
      facts: {
        supplier_country: "AT",
        customer_country: "JP",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: false,
      liability: "supplier",
      legal_reference: "EU VAT export rules, national law",
      invoice_text_block_id: "EU_EXPORT_SERVICE_B2B",
    },
    EU_EXPORT_GOODS_TO_THIRD: {
      facts: {
        supplier_country: "AT",
        customer_country: "US",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "goods",
        channel: "direct",
      },
      rate: 0,
      reverse: false,
      liability: "supplier",
      legal_reference: "EU export and customs rules",
      invoice_text_block_id: "EU_EXPORT_GOODS_B2B",
    },
    EU_TO_EU_B2B_GOODS_INTRACOMM: {
      facts: {
        supplier_country: "AT",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "goods",
        channel: "direct",
      },
      rate: 0,
      reverse: true,
      liability: "customer",
      legal_reference: "EU VAT intra-EU acquisition rules",
      invoice_text_block_id: "EU_RC_INTRACOMM_GOODS_B2B",
    },
    EU_TO_EU_B2C_GOODS_INTRACOMM: {
      facts: {
        supplier_country: "AT",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "goods",
        channel: "direct",
      },
      rate: 19,
      reverse: false,
      liability: "supplier",
      legal_reference: "Distance selling / OSS rules",
      invoice_text_block_id: "EU_DISTANT_SELLING_GOODS_B2C",
    },
    THIRD_TO_EU_B2B_SERVICE: {
      facts: {
        supplier_country: "US",
        customer_country: "AT",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: false,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: true,
      liability: "customer",
      legal_reference: "EU VAT Directive Art. 44, 196",
      invoice_text_block_id: "EU_RC_IMPORT_SERVICE_B2B",
    },
    THIRD_TO_EU_B2C_DIGITAL: {
      facts: {
        supplier_country: "US",
        customer_country: "AT",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: false,
        customer_vat_registered: false,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 20,
      reverse: false,
      liability: "supplier",
      legal_reference: "EU VAT digital services, Non-Union OSS",
      invoice_text_block_id: "EU_DIGITAL_IMPORT_B2C",
    },
    US_TO_EU_B2B_SERVICE: {
      facts: {
        supplier_country: "US",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: false,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: true,
      liability: "customer",
      legal_reference: "EU VAT Directive; US not VAT jurisdiction",
      invoice_text_block_id: "EU_RC_US_TO_EU_B2B",
    },
    US_TO_EU_B2C_DIGITAL: {
      facts: {
        supplier_country: "US",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: false,
        customer_vat_registered: false,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 19,
      reverse: false,
      liability: "supplier",
      legal_reference: "EU digital services to consumers",
      invoice_text_block_id: "EU_DIGITAL_US_TO_EU_B2C",
    },
    EU_TO_US_B2B_SERVICE: {
      facts: {
        supplier_country: "AT",
        customer_country: "US",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: false,
      liability: "supplier",
      legal_reference: "US sales tax / nexus rules",
      invoice_text_block_id: "US_B2B_SERVICE_FROM_EU",
    },
    EU_TO_US_B2C_DIGITAL: {
      facts: {
        supplier_country: "AT",
        customer_country: "US",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 0,
      reverse: false,
      liability: "supplier",
      legal_reference: "US digital tax rules (state-level)",
      invoice_text_block_id: "US_B2C_DIGITAL_FROM_EU",
    },
    UAE_TO_EU_B2B_SERVICE: {
      facts: {
        supplier_country: "AE",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: true,
      liability: "customer",
      legal_reference: "EU VAT Directive; UAE VAT export rules",
      invoice_text_block_id: "EU_RC_UAE_TO_EU_B2B",
    },
    UAE_TO_EU_B2B_DIGITAL: {
      facts: {
        supplier_country: "AE",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 0,
      reverse: true,
      liability: "customer",
      legal_reference: "EU VAT Directive; UAE VAT on digital exports",
      invoice_text_block_id: "EU_RC_UAE_TO_EU_DIGITAL_B2B",
    },
    UAE_TO_EU_B2C_DIGITAL: {
      facts: {
        supplier_country: "AE",
        customer_country: "DE",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 19,
      reverse: false,
      liability: "supplier",
      legal_reference: "EU VAT rules; UAE VAT? (non-resident, export)",
      invoice_text_block_id: "EU_DIGITAL_UAE_TO_EU_B2C",
    },
    EU_TO_UAE_B2B_SERVICE: {
      facts: {
        supplier_country: "AT",
        customer_country: "AE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 5,
      reverse: true,
      liability: "customer",
      legal_reference: "UAE VAT Law on imported services (Reverse Charge)",
      invoice_text_block_id: "UAE_RC_IMPORT_SERVICE_B2B",
    },
    EU_TO_UAE_B2B_DIGITAL: {
      facts: {
        supplier_country: "AT",
        customer_country: "AE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 5,
      reverse: true,
      liability: "customer",
      legal_reference: "UAE VATP044, digital imported services",
      invoice_text_block_id: "UAE_RC_IMPORT_DIGITAL_B2B",
    },
    EU_TO_UAE_B2C_DIGITAL: {
      facts: {
        supplier_country: "AT",
        customer_country: "AE",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "digital_service",
        channel: "direct",
      },
      rate: 5,
      reverse: false,
      liability: "supplier",
      legal_reference: "UAE VAT for non-resident digital suppliers",
      invoice_text_block_id: "UAE_DIGITAL_EU_TO_UAE_B2C",
    },
    DOMESTIC_SPECIAL_PROPERTY: {
      facts: {
        supplier_country: "AT",
        customer_country: "AT",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "property",
        channel: "direct",
      },
      rate: 20,
      reverse: false,
      liability: "supplier",
      legal_reference: "Special place-of-supply rules (property)",
      invoice_text_block_id: "EU_PROPERTY_SPECIAL",
    },
    DOMESTIC_SPECIAL_EVENT: {
      facts: {
        supplier_country: "AT",
        customer_country: "AT",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "special",
        channel: "direct",
      },
      rate: 20,
      reverse: false,
      liability: "supplier",
      legal_reference: "Special rules for admission to events",
      invoice_text_block_id: "EU_EVENT_SPECIAL",
    },
    THIRD_TO_THIRD_B2B_SERVICE: {
      facts: {
        supplier_country: "US",
        customer_country: "AE",
        supplier_is_business: true,
        customer_is_business: true,
        supplier_vat_registered: true,
        customer_vat_registered: true,
        supply_type: "service",
        channel: "direct",
      },
      rate: 0,
      reverse: false,
      liability: "supplier",
      legal_reference: "Local VAT/GST rules of involved countries",
      invoice_text_block_id: "THIRD_TO_THIRD_GENERIC_B2B",
    },
  };

const DUPLICATE_RULE = {
  rule_id: "DUPLICATE_A",
  version: "1.0.0",
  conditions: {
    supplier_country: "AT",
    customer_country: "AT",
    supplier_is_business: true,
    customer_is_business: true,
    supplier_vat_registered: true,
    customer_vat_registered: true,
    supply_type: "service",
    channel: "direct",
  },
  effect: {
    place_of_supply_country: "{{customer_country}}",
    tax_liability_party: "supplier",
    invoice_tax_rate: 20,
    invoice_tax_shown: true,
    reverse_charge_flag: false,
    legal_reference: "duplicate A",
    invoice_text_block_id: "DUP_A",
  },
  source_citation: [],
};

describe("evaluate(facts)", () => {
  it.each(MATRIX_RULE_IDS)(
    "returns applied_rule_id %s for the matrix fixture",
    (ruleId) => {
      const fixture = MATRIX_FIXTURES[ruleId];
      const decision = evaluate(fixture.facts);
      expect(decision.applied_rule_id).toBe(ruleId);
      expect(decision.invoice_tax_rate).toBe(fixture.rate);
      expect(decision.reverse_charge_flag).toBe(fixture.reverse);
      expect(decision.tax_liability_party).toBe(fixture.liability);
      expect(decision.legal_reference).toBe(fixture.legal_reference);
      expect(decision.invoice_text_block_id).toBe(fixture.invoice_text_block_id);
    },
  );

  it("throws when zero rules match (no silent empty decision)", () => {
    expect(() =>
      evaluate({
        supplier_country: "IS",
        customer_country: "IS",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "goods",
        channel: "direct",
      }),
    ).toThrow(EvaluateError);

    try {
      evaluate({
        supplier_country: "IS",
        customer_country: "IS",
        supplier_is_business: true,
        customer_is_business: false,
        supplier_vat_registered: true,
        customer_vat_registered: false,
        supply_type: "goods",
        channel: "direct",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EvaluateError);
      expect((error as EvaluateError).code).toBe("no_unique_match");
    }
  });

  it("throws when two rules match (no first-match or priority pick)", () => {
    const dir = mkdtempSync(join(tmpdir(), "tax-rules-"));
    writeFileSync(
      join(dir, "DUPLICATE_A.json"),
      JSON.stringify(DUPLICATE_RULE),
    );
    writeFileSync(
      join(dir, "DUPLICATE_B.json"),
      JSON.stringify({
        ...DUPLICATE_RULE,
        rule_id: "DUPLICATE_B",
        effect: {
          ...DUPLICATE_RULE.effect,
          legal_reference: "duplicate B",
          invoice_text_block_id: "DUP_B",
        },
      }),
    );

    const facts: TransactionFacts = {
      supplier_country: "AT",
      customer_country: "AT",
      supplier_is_business: true,
      customer_is_business: true,
      supplier_vat_registered: true,
      customer_vat_registered: true,
      supply_type: "service",
      channel: "direct",
    };

    expect(() => evaluate(facts, dir)).toThrow(EvaluateError);

    try {
      evaluate(facts, dir);
    } catch (error) {
      expect(error).toBeInstanceOf(EvaluateError);
      expect((error as EvaluateError).code).toBe("no_unique_match");
    }
  });
});
