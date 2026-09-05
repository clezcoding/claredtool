/** D-22: country → default locale + vatLine. DE/AT only for de — not EU-27.
 * Country defaults always omit a zero-VAT line; `vatLine: "zero"` is knob-only
 * (explicit InvoicePdfKnobs / RenderInvoiceInput), never chosen here.
 */

export type CountryDefaults = {
  locale: "de" | "en";
  /** Country path is omit-only; use knobs for `"zero"`. */
  vatLine: "omit";
};

export function defaultsFromCountry(country: string): CountryDefaults {
  const code = country.trim().toUpperCase();
  if (code === "DE" || code === "AT") {
    return { locale: "de", vatLine: "omit" };
  }
  return { locale: "en", vatLine: "omit" };
}
