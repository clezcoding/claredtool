/** EU-27 ISO alpha-2 (A1 — no CH, UK/GB, NO). */
export const EU_COUNTRY_CODES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
] as const;

export type EuCountryCode = (typeof EU_COUNTRY_CODES)[number];

const EU_SET = new Set<string>(EU_COUNTRY_CODES);

export function isEuCountry(iso: string): boolean {
  return EU_SET.has(iso);
}
