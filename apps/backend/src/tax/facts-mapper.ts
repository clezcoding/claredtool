import type { TransactionFacts } from "@clared/tax-engine";
import type { EvaluateInvoiceDto } from "./dto/evaluate-invoice.dto";

/** D-18: map invoice-shaped draft body to engine TransactionFacts. */
export function mapDraftToFacts(dto: EvaluateInvoiceDto): TransactionFacts {
  const amount = dto.items.reduce(
    (sum, item) => sum + item.menge * item.einzelpreis,
    0,
  );

  return {
    supplier_country: dto.seller.country,
    customer_country: dto.customer.country,
    supplier_is_business: Boolean(dto.seller.legalForm),
    customer_is_business: Boolean(dto.customer.vatId),
    supplier_vat_registered: Boolean(dto.seller.vatId),
    customer_vat_registered: Boolean(dto.customer.vatId),
    supplier_vat_id: dto.seller.vatId,
    customer_vat_id: dto.customer.vatId,
    supply_type: (dto.supplyType ?? "service") as TransactionFacts["supply_type"],
    channel: "direct",
    amount,
    currency: dto.currency ?? "EUR",
  };
}
