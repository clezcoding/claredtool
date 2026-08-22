export type SupplyType =
  | "service"
  | "digital_service"
  | "goods"
  | "property"
  | "special";

export type TransactionFacts = {
  supplier_entity_id?: string;
  customer_entity_id?: string;
  supplier_country: string;
  customer_country: string;
  supplier_is_business: boolean;
  customer_is_business: boolean;
  supplier_vat_registered: boolean;
  customer_vat_registered: boolean;
  supplier_vat_id?: string;
  customer_vat_id?: string;
  supply_type: SupplyType;
  channel: string;
  transaction_date?: string;
  amount?: number;
  currency?: string;
};

export type TaxDecision = {
  place_of_supply_country: string;
  tax_liability_party: "supplier" | "customer";
  invoice_tax_rate: number;
  invoice_tax_shown: boolean;
  reverse_charge_flag: boolean;
  legal_reference: string;
  invoice_text_block_id: string;
  applied_rule_id: string;
  applied_rule_version: string;
  source_citation: string[];
  audit_trace: unknown[];
};

export type TaxRuleEffect = {
  place_of_supply_country: string;
  tax_liability_party: "supplier" | "customer";
  invoice_tax_rate?: number | string;
  invoice_tax_shown?: boolean;
  reverse_charge_flag?: boolean;
  legal_reference?: string;
  invoice_text_block_id?: string;
  additional_outputs?: Record<string, unknown>;
};

export type TaxRuleConditions = {
  supplier_country?: string | string[];
  customer_country?: string | string[];
  supplier_is_business?: boolean;
  customer_is_business?: boolean;
  supplier_vat_registered?: boolean | string;
  customer_vat_registered?: boolean | string;
  supply_type?: string | string[];
  channel?: string | string[] | null;
  effective_from?: string | null;
  effective_to?: string | null;
  threshold_amount?: number | null;
  threshold_currency?: string | null;
  intracomm_eu?: boolean;
  [key: string]: unknown;
};

export type TaxRule = {
  rule_id: string;
  version: string;
  jurisdiction_scope?: string[];
  description?: string;
  conditions: TaxRuleConditions;
  effect: TaxRuleEffect;
  priority?: number;
  source_citation?: string[];
  tags?: string[];
};

export class EvaluateError extends Error {
  readonly code: "no_unique_match";

  constructor(code: "no_unique_match", message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "EvaluateError";
  }
}
