type LegalFormRow = { value: string; labelDe: string };

const SONSTIGE: LegalFormRow[] = [{ value: "Sonstige", labelDe: "Sonstige" }];

const LEGAL_FORMS_BY_COUNTRY: Record<string, LegalFormRow[]> = {
  AT: [
    { value: "GmbH", labelDe: "GmbH" },
    { value: "AG", labelDe: "AG" },
  ],
  BE: [
    { value: "BV/SRL", labelDe: "BV/SRL" },
    { value: "NV/SA", labelDe: "NV/SA" },
  ],
  BG: [
    { value: "EOOD", labelDe: "EOOD" },
    { value: "AD", labelDe: "AD" },
  ],
  HR: [
    { value: "d.o.o.", labelDe: "d.o.o." },
    { value: "d.d.", labelDe: "d.d." },
  ],
  CY: [
    { value: "Ltd", labelDe: "Ltd" },
    { value: "PLC", labelDe: "PLC" },
  ],
  CZ: [
    { value: "s.r.o.", labelDe: "s.r.o." },
    { value: "a.s.", labelDe: "a.s." },
  ],
  DK: [
    { value: "ApS", labelDe: "ApS" },
    { value: "A/S", labelDe: "A/S" },
  ],
  EE: [
    { value: "OÜ", labelDe: "OÜ" },
    { value: "AS", labelDe: "AS" },
  ],
  FI: [
    { value: "Oy", labelDe: "Oy" },
    { value: "Oyj", labelDe: "Oyj" },
  ],
  FR: [
    { value: "SARL", labelDe: "SARL" },
    { value: "SAS", labelDe: "SAS" },
    { value: "SA", labelDe: "SA" },
  ],
  DE: [
    { value: "GmbH", labelDe: "GmbH" },
    { value: "UG", labelDe: "UG (haftungsbeschränkt)" },
    { value: "AG", labelDe: "AG" },
    { value: "e.K.", labelDe: "e.K." },
  ],
  GR: [
    { value: "EPE", labelDe: "EPE" },
    { value: "AE", labelDe: "AE" },
  ],
  HU: [
    { value: "Kft.", labelDe: "Kft." },
    { value: "Zrt.", labelDe: "Zrt." },
  ],
  IE: [
    { value: "Ltd", labelDe: "Ltd" },
    { value: "DAC", labelDe: "DAC" },
  ],
  IT: [
    { value: "Srl", labelDe: "Srl" },
    { value: "SpA", labelDe: "SpA" },
  ],
  LV: [
    { value: "SIA", labelDe: "SIA" },
    { value: "AS", labelDe: "AS" },
  ],
  LT: [
    { value: "UAB", labelDe: "UAB" },
    { value: "AB", labelDe: "AB" },
  ],
  LU: [
    { value: "SARL", labelDe: "SARL" },
    { value: "SA", labelDe: "SA" },
  ],
  MT: [{ value: "Ltd", labelDe: "Ltd" }],
  NL: [
    { value: "BV", labelDe: "BV" },
    { value: "NV", labelDe: "NV" },
  ],
  PL: [
    { value: "sp. z o.o.", labelDe: "sp. z o.o." },
    { value: "SA", labelDe: "SA" },
  ],
  PT: [
    { value: "Lda", labelDe: "Lda" },
    { value: "SA", labelDe: "SA" },
  ],
  RO: [
    { value: "SRL", labelDe: "SRL" },
    { value: "SA", labelDe: "SA" },
  ],
  SK: [
    { value: "s.r.o.", labelDe: "s.r.o." },
    { value: "a.s.", labelDe: "a.s." },
  ],
  SI: [
    { value: "d.o.o.", labelDe: "d.o.o." },
    { value: "d.d.", labelDe: "d.d." },
  ],
  ES: [
    { value: "SL", labelDe: "SL" },
    { value: "SA", labelDe: "SA" },
  ],
  SE: [{ value: "AB", labelDe: "AB" }],
  US: [
    { value: "LLC", labelDe: "LLC" },
    { value: "C-Corp", labelDe: "C-Corp" },
    { value: "S-Corp", labelDe: "S-Corp" },
  ],
  AE: [{ value: "LLC", labelDe: "LLC" }],
  CH: SONSTIGE,
  GB: SONSTIGE,
  NO: SONSTIGE,
};

export function getLegalFormsForCountry(country: string): LegalFormRow[] {
  return LEGAL_FORMS_BY_COUNTRY[country] ?? SONSTIGE;
}

export function isValidLegalForm(country: string, legalForm: string): boolean {
  return getLegalFormsForCountry(country).some((row) => row.value === legalForm);
}
