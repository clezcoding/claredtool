import { InvoicePdfService } from "./invoice-pdf.service";

jest.mock("@clared/pdf-templates", () => ({
  renderInvoice: jest.fn(),
  defaultsFromCountry: jest.fn(() => ({ locale: "de", vatLine: "omit" })),
}));

import { renderInvoice } from "@clared/pdf-templates";

const renderInvoiceMock = renderInvoice as jest.MockedFunction<
  typeof renderInvoice
>;

const SELLER_NAME = "Clared GmbH";
const LINE_BEZEICHNUNG = "Beratungsleistung März";

function validInput() {
  return {
    entity: {
      name: SELLER_NAME,
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
        bezeichnung: LINE_BEZEICHNUNG,
        menge: 1,
        einzelpreis: 1000,
        netto: 1000,
      },
    ],
    tax: {
      place_of_supply_country: "DE",
      tax_liability_party: "supplier" as const,
      invoice_tax_rate: 19,
      invoice_tax_shown: true,
      reverse_charge_flag: false,
      legal_reference:
        "Umsatzsteuer nach § 12 Abs. 1 UStG (Regelsteuersatz 19 %).",
      invoice_text_block_id: "de-b2b-19",
      applied_rule_id: "rule-de-b2b",
      applied_rule_version: "1",
      source_citation: [] as string[],
      audit_trace: [] as unknown[],
    },
    knobs: { locale: "de" as const, vatLine: "omit" as const },
  };
}

describe("InvoicePdfService", () => {
  const service = new InvoicePdfService();

  beforeEach(() => {
    renderInvoiceMock.mockReset();
  });

  it("render(valid DE B2B 19%) returns application/pdf bytes starting %PDF-", async () => {
    const pdfBytes = new TextEncoder().encode("%PDF-1.4 mock");
    renderInvoiceMock.mockResolvedValue({
      bytes: pdfBytes,
      contentType: "application/pdf",
    });

    const result = await service.render(validInput());

    expect(result.contentType).toBe("application/pdf");
    expect(
      String.fromCharCode(
        result.bytes[0]!,
        result.bytes[1]!,
        result.bytes[2]!,
        result.bytes[3]!,
      ),
    ).toBe("%PDF");
    expect(renderInvoiceMock).toHaveBeenCalledTimes(1);
  });

  it("throws on missing required fields and never returns empty PdfBytes", async () => {
    await expect(
      service.render({
        ...validInput(),
        entity: undefined as never,
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    await expect(
      service.render({
        ...validInput(),
        items: [],
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    expect(renderInvoiceMock).not.toHaveBeenCalled();
  });

  it("throws on empty-string numeric fields (no silent 0 coercion)", async () => {
    await expect(
      service.render({
        ...validInput(),
        items: [
          {
            bezeichnung: LINE_BEZEICHNUNG,
            menge: "" as unknown as number,
            einzelpreis: 1000,
            netto: 1000,
          },
        ],
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    await expect(
      service.render({
        ...validInput(),
        tax: { ...validInput().tax, invoice_tax_rate: "   " as unknown as number },
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    expect(renderInvoiceMock).not.toHaveBeenCalled();
  });

  it("throws on negative menge / preis / netto / tax rate (credits are a separate path)", async () => {
    await expect(
      service.render({
        ...validInput(),
        items: [
          {
            bezeichnung: LINE_BEZEICHNUNG,
            menge: -1,
            einzelpreis: 1000,
            netto: 1000,
          },
        ],
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    await expect(
      service.render({
        ...validInput(),
        items: [
          {
            bezeichnung: LINE_BEZEICHNUNG,
            menge: 1,
            einzelpreis: -10,
            netto: 1000,
          },
        ],
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    await expect(
      service.render({
        ...validInput(),
        tax: { ...validInput().tax, invoice_tax_rate: -1 },
      }),
    ).rejects.toThrow("Render fehlgeschlagen");

    expect(renderInvoiceMock).not.toHaveBeenCalled();
  });

  it("throws when renderInvoice returns non-PDF; message has no seller or line text (D-26)", async () => {
    renderInvoiceMock.mockResolvedValue({
      bytes: new TextEncoder().encode("<html>not-pdf</html>"),
      contentType: "application/pdf",
    });

    let message = "";
    try {
      await service.render(validInput());
      throw new Error("expected render to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      message = (err as Error).message;
    }
    expect(message).toBe("Render fehlgeschlagen");
    expect(message).not.toContain(SELLER_NAME);
    expect(message).not.toContain(LINE_BEZEICHNUNG);
  });
});
