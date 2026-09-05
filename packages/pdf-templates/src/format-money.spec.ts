import { formatMoney, formatInvoiceDate } from "./format-money";

describe("formatMoney (D-18)", () => {
  it('formats 1234.56 as de with 1.234,56 and euro sign', () => {
    const s = formatMoney(1234.56, "de");
    expect(s).toContain("1.234,56");
    expect(s).toMatch(/€|EUR/);
  });

  it('formats 1234.56 as en distinct from DE grouping', () => {
    const de = formatMoney(1234.56, "de");
    const en = formatMoney(1234.56, "en");
    expect(en).not.toBe(de);
    expect(en).toMatch(/1,234\.56/);
    expect(en).toMatch(/€|EUR/);
  });
});

describe("formatInvoiceDate (D-18)", () => {
  it.each([
    ["de", "2026-03-15", "15.03.2026"],
    ["en", "2026-03-15", "2026-03-15"],
  ] as const)("locale %s formats %s → %s", (locale, iso, expected) => {
    expect(formatInvoiceDate(iso, locale)).toBe(expected);
  });
});
