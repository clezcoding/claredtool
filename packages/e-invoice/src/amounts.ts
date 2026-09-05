import { EInvoiceError } from "./errors";

/** Round to EUR cents so printed net + tax equals printed total. */
export function roundEur(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export type MoneyTotals = {
  lineTotal: number;
  taxBasis: number;
  taxTotal: number;
  grandTotal: number;
};

export function assertAmountsEqual(
  visual: MoneyTotals,
  xml: MoneyTotals,
): void {
  const keys: (keyof MoneyTotals)[] = [
    "lineTotal",
    "taxBasis",
    "taxTotal",
    "grandTotal",
  ];
  for (const key of keys) {
    if (roundEur(visual[key]) !== roundEur(xml[key])) {
      throw new EInvoiceError("AMOUNT_MISMATCH");
    }
  }
}
