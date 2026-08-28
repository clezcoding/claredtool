/** Engine may emit percent integer (20) or fraction (0.2). */
export function taxFraction(rate: number): number {
  return rate > 1 ? rate / 100 : rate;
}

export function taxPercent(rate: number): number {
  return rate <= 1 ? Math.round(rate * 100) : Math.round(rate);
}

export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDateDe(iso: string): string {
  if (!iso) return "—";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
