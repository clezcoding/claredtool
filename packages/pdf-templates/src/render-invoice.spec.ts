import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { renderInvoice } from "./render-invoice";

/** D-23 fixture 1: DE locale, DE B2B 19%, tax shown, issued number/date/due */
describe("renderInvoice fixture 1", () => {
  it("returns PdfBytes starting with %PDF- for DE B2B 19%", async () => {
    const result = await renderInvoice({
      locale: "de",
      vatLine: "omit",
      model: {
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
      },
      tax: {
        invoice_tax_rate: 19,
        invoice_tax_shown: true,
        reverse_charge_flag: false,
        legal_reference:
          "Umsatzsteuer nach § 12 Abs. 1 UStG (Regelsteuersatz 19 %).",
      },
    });

    expect(result.contentType).toBe("application/pdf");
    expect(result.bytes.byteLength).toBeGreaterThanOrEqual(5);
    expect(
      String.fromCharCode(
        result.bytes[0]!,
        result.bytes[1]!,
        result.bytes[2]!,
        result.bytes[3]!
      )
    ).toBe("%PDF");

    const outDir = path.join(__dirname, "..", "tmp");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, "fixture-1-de-b2b.pdf"), result.bytes);
  }, 60_000);
});
