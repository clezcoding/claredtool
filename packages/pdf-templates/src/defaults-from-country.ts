/** D-22: country → default locale + vatLine. DE/AT only for de — not EU-27. */

export type CountryDefaults = {
  locale: "de" | "en";
  vatLine: "omit" | "zero";
};

export function defaultsFromCountry(country: string): CountryDefaults {
  const code = country.trim().toUpperCase();
  if (code === "DE" || code === "AT") {
    return { locale: "de", vatLine: "omit" };
  }
  return { locale: "en", vatLine: "omit" };
}
