import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { renderInvoice, roundEur } from "./render-invoice";
import { formatMoney } from "./format-money";
import { readFileSync } from "node:fs";

/** Half-cent VAT must round tax first, then add — printed rows must add. */
describe("EUR commercial rounding for printed VAT", () => {
  it("45.50 @ 19% formats tax 8,65 and total 54,15 (not 54,14)", () => {
    const subtotal = roundEur(45.5);
    const taxAmount = roundEur(subtotal * (19 / 100));
    const total = roundEur(subtotal + taxAmount);
    expect(formatMoney(taxAmount, "de")).toContain("8,65");
    expect(formatMoney(total, "de")).toContain("54,15");
    // Unrounded path formats total as 54,14 — proves the bug this guards.
    expect(formatMoney(45.5 + 45.5 * 0.19, "de")).toContain("54,14");
  });
});

const FIXTURE_1_MODEL = {
  entity: {
    name: "Clared GmbH",
    address: "Musterstraße 1, 10115 Berlin",
    vatId: "DE123456789",
    country: "DE",
    legalForm: "GmbH",
  },
  customer: {
    name: "Beispiel AG",
    address: "Kundenweg 2, 80331 München",
    vatId: "DE987654321",
    country: "DE",
  },
  invoice: {
    number: "RE-2026-0001",
    date: "2026-03-01",
    dueDate: "2026-03-15",
  },
  items: [
    {
      bezeichnung: "Beratungsleistung März",
      menge: 1,
      einzelpreis: 1000,
      netto: 1000,
    },
  ],
} as const;

const TAX_DE_B2B_19 = {
  invoice_tax_rate: 19,
  invoice_tax_shown: true,
  reverse_charge_flag: false,
  legal_reference:
    "Umsatzsteuer nach § 12 Abs. 1 UStG (Regelsteuersatz 19 %).",
} as const;

function assertPdfMagic(bytes: Uint8Array): void {
  expect(bytes.byteLength).toBeGreaterThanOrEqual(5);
  expect(
    String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!)
  ).toBe("%PDF");
}

function assertSinglePage(bytes: Uint8Array): void {
  const pageObjects = Buffer.from(bytes)
    .toString("latin1")
    .match(/\/Type\s*\/Page(?![s])/g);
  expect(pageObjects?.length ?? 0).toBe(1);
}

function assertNoFacturXFilename(bytes: Uint8Array): void {
  expect(Buffer.from(bytes).toString("latin1")).not.toContain("factur-x.xml");
}

function writeFixture(name: string, bytes: Uint8Array): void {
  const outDir = path.join(__dirname, "..", "tmp");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, name), bytes);
}

describe("renderInvoice money guards (D-26 package path)", () => {
  it("rejects non-finite line netto before emit", async () => {
    await expect(
      renderInvoice({
        locale: "de",
        vatLine: "omit",
        model: {
          ...FIXTURE_1_MODEL,
          items: [
            {
              bezeichnung: "Bad",
              menge: 1,
              einzelpreis: 10,
              netto: Number.NaN,
            },
          ],
        },
        tax: { ...TAX_DE_B2B_19 },
      })
    ).rejects.toThrow("Render fehlgeschlagen");
  });

  it("rejects non-finite tax rate (no silent 0% via || 0)", async () => {
    await expect(
      renderInvoice({
        locale: "de",
        vatLine: "omit",
        model: { ...FIXTURE_1_MODEL, items: [...FIXTURE_1_MODEL.items] },
        tax: {
          ...TAX_DE_B2B_19,
          invoice_tax_rate: Number.NaN,
        },
      })
    ).rejects.toThrow("Render fehlgeschlagen");
  });
});

/** D-23 fixture 1: DE locale, DE B2B 19%, tax shown, issued number/date/due */
describe("D-23 fixture 1 — DE B2B 19%", () => {
  it("returns PdfBytes starting with %PDF-", async () => {
    const result = await renderInvoice({
      locale: "de",
      vatLine: "omit",
      model: { ...FIXTURE_1_MODEL, items: [...FIXTURE_1_MODEL.items] },
      tax: { ...TAX_DE_B2B_19 },
    });

    expect(result.contentType).toBe("application/pdf");
    assertPdfMagic(result.bytes);
    assertSinglePage(result.bytes);
    assertNoFacturXFilename(result.bytes);
    writeFixture("fixture-1-de-b2b.pdf", result.bytes);
  }, 60_000);
});

/** D-23 fixture 2: EN locale, same facts as fixture 1 */
describe("D-23 fixture 2 — EN same facts", () => {
  it("returns %PDF- and EN money grouping differs from DE 1.234,56", async () => {
    const deMoney = formatMoney(1234.56, "de");
    const enMoney = formatMoney(1234.56, "en");
    expect(deMoney).toContain("1.234,56");
    expect(enMoney).not.toContain("1.234,56");
    expect(enMoney).toMatch(/1,234\.56/);

    const result = await renderInvoice({
      locale: "en",
      vatLine: "omit",
      model: { ...FIXTURE_1_MODEL, items: [...FIXTURE_1_MODEL.items] },
      tax: { ...TAX_DE_B2B_19 },
    });

    expect(result.contentType).toBe("application/pdf");
    assertPdfMagic(result.bytes);
    assertSinglePage(result.bytes);
    assertNoFacturXFilename(result.bytes);
    writeFixture("fixture-2-en-b2b.pdf", result.bytes);
  }, 60_000);
});

/** D-23 fixture 3: DE reverse-charge (EU_TO_EU_B2B_GOODS_INTRACOMM shape) */
describe("D-23 fixture 3 — DE reverse-charge", () => {
  it("returns %PDF-, net totals, legal + RC sentence; no audit ids; no fake 19%", async () => {
    const { legalBlockLines } = await import("./render-invoice");

    const tax = {
      invoice_tax_rate: 0,
      invoice_tax_shown: false,
      reverse_charge_flag: true,
      legal_reference: "EU VAT intra-EU acquisition rules",
      // Extra TaxDecision fields must never print (D-12)
      applied_rule_id: "EU_TO_EU_B2B_GOODS_INTRACOMM",
      applied_rule_version: "1.0.0",
      audit_trace: ["should-not-print"],
      invoice_text_block_id: "EU_RC_INTRACOMM_GOODS_B2B",
    };

    const lines = legalBlockLines(tax, "de");
    expect(lines.some((l) => l.includes("EU VAT intra-EU acquisition"))).toBe(
      true
    );
    expect(
      lines.some(
        (l) =>
          /reverse charge/i.test(l) || /Steuerschuldnerschaft/i.test(l)
      )
    ).toBe(true);
    const joined = lines.join("\n");
    expect(joined).not.toContain("applied_rule_id");
    expect(joined).not.toContain("EU_TO_EU_B2B_GOODS_INTRACOMM");
    expect(joined).not.toContain("audit_trace");
    expect(joined).not.toContain("should-not-print");
    expect(joined).not.toContain("EU_RC_INTRACOMM_GOODS_B2B");
    expect(joined).not.toContain("1.0.0");

    // D-19: net total formatting — no fake 19% amount (1000*1.19=1190)
    expect(formatMoney(1000, "de")).toContain("1.000,00");
    expect(formatMoney(1000, "de")).not.toContain("1.190,00");

    const result = await renderInvoice({
      locale: "de",
      vatLine: "omit",
      model: {
        entity: {
          name: "Nordlicht Handel GmbH",
          address: "Hafenstraße 12, 20457 Hamburg",
          vatId: "DE111222333",
          country: "DE",
          legalForm: "GmbH",
        },
        customer: {
          name: "Alpen Technik AG",
          address: "Industrieweg 5, 6020 Innsbruck",
          vatId: "ATU12345678",
          country: "AT",
        },
        invoice: {
          number: "RE-2026-0042",
          date: "2026-03-10",
          dueDate: "2026-03-24",
        },
        items: [
          {
            bezeichnung: "Warenlieferung Intracommunity",
            menge: 1,
            einzelpreis: 1000,
            netto: 1000,
          },
        ],
      },
      tax: {
        invoice_tax_rate: tax.invoice_tax_rate,
        invoice_tax_shown: tax.invoice_tax_shown,
        reverse_charge_flag: tax.reverse_charge_flag,
        legal_reference: tax.legal_reference,
      },
    });

    expect(result.contentType).toBe("application/pdf");
    assertPdfMagic(result.bytes);
    assertSinglePage(result.bytes);
    assertNoFacturXFilename(result.bytes);

    // Render source must not set archival/file-embed or Factur-X filename (D-06)
    const src = readFileSync(
      path.join(__dirname, "render-invoice.ts"),
      "utf8"
    );
    expect(src).not.toContain("factur-x.xml");
    expect(src).not.toContain("archival-profile");
    expect(src).not.toContain("file-embed");
    expect(src).not.toMatch(/ENTWURF|draft watermark/i);

    writeFixture("fixture-3-de-reverse-charge.pdf", result.bytes);
  }, 60_000);
});
