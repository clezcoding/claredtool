/** D-18: Intl money/dates for PDF knobs locale "de" | "en". No date-fns. */

export type PdfLocale = "de" | "en";

export function formatMoney(
  amount: number,
  locale: PdfLocale,
  currency: "EUR" = "EUR"
): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** de → TT.MM.JJJJ; en → YYYY-MM-DD */
export function formatInvoiceDate(
  isoOrDate: string | Date,
  locale: PdfLocale
): string {
  const iso =
    typeof isoOrDate === "string"
      ? isoOrDate
      : isoOrDate.toISOString().slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(d.getTime())) {
      return iso.slice(0, 10);
    }
    if (locale === "de") {
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    }
    return iso.slice(0, 10);
  }

  return typeof isoOrDate === "string" ? isoOrDate : iso;
}
