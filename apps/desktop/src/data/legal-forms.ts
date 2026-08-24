export type LegalFormOption = { value: string; labelDe: string };

export type CountryOption = { iso: string; labelDe: string };

const SONSTIGE: LegalFormOption[] = [{ value: "Sonstige", labelDe: "Sonstige" }];

/** Country → legal forms (D-03). German labels; store ISO + form value. */
export const LEGAL_FORMS_BY_COUNTRY: Record<string, LegalFormOption[]> = {
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

/** Searchable country Combobox options (German display, ISO stored). */
export const COUNTRY_OPTIONS: CountryOption[] = [
  { iso: "AT", labelDe: "Österreich" },
  { iso: "BE", labelDe: "Belgien" },
  { iso: "BG", labelDe: "Bulgarien" },
  { iso: "HR", labelDe: "Kroatien" },
  { iso: "CY", labelDe: "Zypern" },
  { iso: "CZ", labelDe: "Tschechien" },
  { iso: "DK", labelDe: "Dänemark" },
  { iso: "EE", labelDe: "Estland" },
  { iso: "FI", labelDe: "Finnland" },
  { iso: "FR", labelDe: "Frankreich" },
  { iso: "DE", labelDe: "Deutschland" },
  { iso: "GR", labelDe: "Griechenland" },
  { iso: "HU", labelDe: "Ungarn" },
  { iso: "IE", labelDe: "Irland" },
  { iso: "IT", labelDe: "Italien" },
  { iso: "LV", labelDe: "Lettland" },
  { iso: "LT", labelDe: "Litauen" },
  { iso: "LU", labelDe: "Luxemburg" },
  { iso: "MT", labelDe: "Malta" },
  { iso: "NL", labelDe: "Niederlande" },
  { iso: "PL", labelDe: "Polen" },
  { iso: "PT", labelDe: "Portugal" },
  { iso: "RO", labelDe: "Rumänien" },
  { iso: "SK", labelDe: "Slowakei" },
  { iso: "SI", labelDe: "Slowenien" },
  { iso: "ES", labelDe: "Spanien" },
  { iso: "SE", labelDe: "Schweden" },
  { iso: "US", labelDe: "Vereinigte Staaten" },
  { iso: "AE", labelDe: "Vereinigte Arabische Emirate" },
  { iso: "CH", labelDe: "Schweiz" },
  { iso: "GB", labelDe: "Vereinigtes Königreich" },
  { iso: "NO", labelDe: "Norwegen" },
];

export function getLegalFormsForCountry(country: string): LegalFormOption[] {
  return LEGAL_FORMS_BY_COUNTRY[country] ?? SONSTIGE;
}

export function isValidLegalForm(country: string, legalForm: string): boolean {
  return getLegalFormsForCountry(country).some((row) => row.value === legalForm);
}

export function getCountryLabel(iso: string): string {
  return COUNTRY_OPTIONS.find((row) => row.iso === iso)?.labelDe ?? iso;
}
