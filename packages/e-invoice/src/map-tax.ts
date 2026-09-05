import type { TaxDecision } from "@clared/tax-engine";
import { EInvoiceError } from "./errors";

/** Map TaxDecision → UNTDID 5305. Wave 1 tracer: S only (AE in 04.7-01b). */
export function mapVatCategory(tax: TaxDecision): "S" {
  if (
    tax.reverse_charge_flag === false &&
    tax.invoice_tax_shown === true &&
    Number(tax.invoice_tax_rate) === 19
  ) {
    return "S";
  }
  throw new EInvoiceError("TAX_MAPPING");
}
