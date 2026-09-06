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

/** UNECE unit allowlist (D-30). Unknown → Stück C62. */
const UNIT_ALLOWLIST = new Set([
  "C62",
  "HUR",
  "DAY",
  "MON",
  "KGM",
  "MTR",
  "H87",
]);

export function normalizeUnitCode(code: string): string {
  const trimmed = code.trim();
  return UNIT_ALLOWLIST.has(trimmed) ? trimmed : "C62";
}

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
