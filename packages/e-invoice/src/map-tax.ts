import type { TaxDecision } from "@clared/tax-engine";
import { EInvoiceError } from "./errors";

/** Map TaxDecision → UNTDID 5305. Minimum: S + AE (D-26). Unknown → fail-closed (D-25). */
export function mapVatCategory(tax: TaxDecision): "S" | "AE" {
  if (tax.reverse_charge_flag === true) {
    return "AE";
  }
  if (
    tax.reverse_charge_flag === false &&
    tax.invoice_tax_shown === true &&
    Number(tax.invoice_tax_rate) === 19
  ) {
    return "S";
  }
  throw new EInvoiceError("TAX_MAPPING");
}
