import { InvoicePdfService } from "./invoice-pdf.service";
import { RenderFailedError } from "./render-failed.error";

jest.mock("@clared/pdf-templates", () => ({
  renderInvoice: jest.fn(),
  defaultsFromCountry: jest.fn(() => ({ locale: "de", vatLine: "omit" })),
}));

import { renderInvoice } from "@clared/pdf-templates";

const renderInvoiceMock = renderInvoice as jest.MockedFunction<
  typeof renderInvoice
>;

const SELLER_NAME = "Clared GmbH";
const SELLER_STREET = "Musterstraße 1";
const SELLER_EMAIL = "billing@clared.example";
const SELLER_PHONE = "+49301234567";
const LINE_BEZEICHNUNG = "Beratungsleistung März";
const BT24 =
  "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0";

function validInput() {
  return {
    entity: {
      name: SELLER_NAME,
      street: SELLER_STREET,
      postalCode: "10115",
      city: "Berlin",
      vatId: "DE123456789",
      country: "DE",
      legalForm: "GmbH",
      email: SELLER_EMAIL,
      phone: SELLER_PHONE,
      // D-18: test IBAN only in fixtures/tests — never invent on live path
      iban: "DE79000000001234567890",
    },
    customer: {
      name: "Beispiel AG",
      street: "Kundenweg 2",
      postalCode: "80331",
      city: "München",
      vatId: "DE987654321",
      country: "DE",
      email: "buyer@example.com",
    },
    invoice: {
      number: "RE-2026-0001",
      date: "2026-03-01",
      dueDate: "2026-03-15",
      supplyType: "service" as const,
    },
    items: [
      {
        bezeichnung: LINE_BEZEICHNUNG,
        menge: 1,
        einzelpreis: 1000,
        netto: 1000,
        unit: "C62",
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

  it("render(complete DE B2B 19%) returns hybrid PDF + XRechnung with BG-6 (D-03, PDF-01)", async () => {
    const pdfBytes = new TextEncoder().encode("%PDF-1.4 factur-x.xml mock");
    renderInvoiceMock.mockResolvedValue({
      bytes: pdfBytes,
      contentType: "application/pdf",
    });

    const result = await service.render(validInput());

    expect(result.pdf.contentType).toBe("application/pdf");
    expect(
      String.fromCharCode(
        result.pdf.bytes[0]!,
        result.pdf.bytes[1]!,
        result.pdf.bytes[2]!,
        result.pdf.bytes[3]!,
      ),
    ).toBe("%PDF");
    expect(Buffer.from(result.pdf.bytes).toString("latin1")).toContain(
      "factur-x.xml",
    );

    expect(result.xrechnungXml.contentType).toBe("application/xml");
    const ubl = new TextDecoder().decode(result.xrechnungXml.bytes);
    expect(ubl.length).toBeGreaterThan(0);
    expect(ubl).toContain(`<cbc:CustomizationID>${BT24}</cbc:CustomizationID>`);
    expect(ubl).toContain(
      `<cbc:ElectronicMail>${SELLER_EMAIL}</cbc:ElectronicMail>`,
    );
    expect(ubl).toContain(`<cbc:Telephone>${SELLER_PHONE}</cbc:Telephone>`);

    expect(result.ciiXml).toBeTruthy();
    expect(renderInvoiceMock).toHaveBeenCalledTimes(1);
    const call = renderInvoiceMock.mock.calls[0]![0]!;
    expect(call.ciiXml.length).toBeGreaterThan(0);
    expect(call.ciiXml).toContain("CrossIndustryInvoice");
  });

  it("throws on missing required fields and never returns visual-only PDF (D-12)", async () => {
    await expect(
      service.render({
        ...validInput(),
        entity: undefined as never,
      }),
    ).rejects.toThrow(RenderFailedError);

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

  it("throws when renderInvoice returns non-PDF; message has no seller or line text (D-11)", async () => {
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

  describe("fail-closed gates (D-11, D-12, D-18, D-25, D-31, Q1, Q2)", () => {
    async function expectScrubbedFail(input: ReturnType<typeof validInput>) {
      let message = "";
      try {
        await service.render(input);
        throw new Error("expected render to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(RenderFailedError);
        message = (err as Error).message;
      }
      expect(message).toBe("Render fehlgeschlagen");
      expect(message).not.toContain(SELLER_STREET);
      expect(message).not.toContain(SELLER_NAME);
      expect(message).not.toContain("DE123456789");
      expect(message).not.toContain("DE89370400440532013000");
      expect(renderInvoiceMock).not.toHaveBeenCalled();
    }

    it("missing street / postalCode / city → RenderFailedError; no PDF (D-12)", async () => {
      await expectScrubbedFail({
        ...validInput(),
        entity: { ...validInput().entity, street: "" },
      });
      await expectScrubbedFail({
        ...validInput(),
        customer: { ...validInput().customer, postalCode: "  " },
      });
      await expectScrubbedFail({
        ...validInput(),
        customer: { ...validInput().customer, city: "" },
      });
    });

    it("missing seller email or phone → RenderFailedError (Q1 BG-6); no PDF", async () => {
      await expectScrubbedFail({
        ...validInput(),
        entity: { ...validInput().entity, email: "" },
      });
      await expectScrubbedFail({
        ...validInput(),
        entity: { ...validInput().entity, phone: "" },
      });
    });

    it("unknown tax combination → RenderFailedError (D-25); no PDF", async () => {
      await expectScrubbedFail({
        ...validInput(),
        tax: {
          ...validInput().tax,
          invoice_tax_rate: 7,
          invoice_tax_shown: true,
          reverse_charge_flag: false,
        },
      });
    });

    it("supplyType outside goods|service or mixed → RenderFailedError (D-31); no PII", async () => {
      await expectScrubbedFail({
        ...validInput(),
        invoice: {
          ...validInput().invoice,
          supplyType: "mixed" as "service",
        },
      });
      await expectScrubbedFail({
        ...validInput(),
        invoice: {
          ...validInput().invoice,
          supplyType: "consulting" as "service",
        },
      });
    });

    it("empty IBAN → RenderFailedError — do not invent IBAN; XRechnung needs BG-16 (D-18, BR-DE-1)", async () => {
      await expectScrubbedFail({
        ...validInput(),
        entity: { ...validInput().entity, iban: "" },
      });
    });

    it("missing buyer email → RenderFailedError — XRechnung needs BT-49 EndpointID", async () => {
      await expectScrubbedFail({
        ...validInput(),
        customer: { ...validInput().customer, email: "" },
      });
    });

    // Q2: HRB / Geschäftsführer optional — absence alone does not fail-closed
    // unless a validator marks fatal (document gate for Nest specs).
    it("empty HRB/GF alone does not fail-closed (Q2 optional)", async () => {
      const pdfBytes = new TextEncoder().encode("%PDF-1.4 factur-x.xml mock");
      renderInvoiceMock.mockResolvedValue({
        bytes: pdfBytes,
        contentType: "application/pdf",
      });

      const input = {
        ...validInput(),
        entity: {
          ...validInput().entity,
          hrb: null,
          managingDirector: null,
        },
      };
      const result = await service.render(input);
      expect(result.pdf.contentType).toBe("application/pdf");
      expect(result.xrechnungXml.contentType).toBe("application/xml");
    });
  });

  describe("AE reverse-charge + B2G Leitweg (D-19, D-26)", () => {
    it("DE reverse-charge AE returns hybrid PDF + XRechnung with exemption", async () => {
      const pdfBytes = new TextEncoder().encode("%PDF-1.4 factur-x.xml mock");
      renderInvoiceMock.mockResolvedValue({
        bytes: pdfBytes,
        contentType: "application/pdf",
      });

      const legal =
        "Steuerschuldnerschaft des Leistungsempfängers (§ 13b UStG).";
      const result = await service.render({
        ...validInput(),
        tax: {
          ...validInput().tax,
          place_of_supply_country: "DE",
          tax_liability_party: "customer",
          invoice_tax_rate: 0,
          invoice_tax_shown: false,
          reverse_charge_flag: true,
          legal_reference: legal,
          invoice_text_block_id: "de-rc",
          applied_rule_id: "de-reverse-charge",
        },
      });

      expect(result.pdf.contentType).toBe("application/pdf");
      expect(Buffer.from(result.pdf.bytes).toString("latin1")).toContain(
        "factur-x.xml",
      );
      const ubl = new TextDecoder().decode(result.xrechnungXml.bytes);
      expect(ubl).toContain("<cbc:ID>AE</cbc:ID>");
      expect(ubl).toContain(
        `<cbc:TaxExemptionReason>${legal}</cbc:TaxExemptionReason>`,
      );
      expect(ubl).toContain(
        `<cbc:ElectronicMail>${SELLER_EMAIL}</cbc:ElectronicMail>`,
      );
      // B2B without Leitweg remains valid — no BuyerReference required
      expect(ubl).not.toContain("<cbc:BuyerReference>");
    });

    it("B2G Leitweg buyer emits BT-10 BuyerReference in XRechnung (D-19)", async () => {
      const pdfBytes = new TextEncoder().encode("%PDF-1.4 factur-x.xml mock");
      renderInvoiceMock.mockResolvedValue({
        bytes: pdfBytes,
        contentType: "application/pdf",
      });

      const leitweg = "991-12345-67";
      const result = await service.render({
        ...validInput(),
        customer: {
          ...validInput().customer,
          name: "Stadt Musterhausen",
          leitwegId: leitweg,
          buyerReference: "should-not-win-over-leitweg",
        },
      });

      const ubl = new TextDecoder().decode(result.xrechnungXml.bytes);
      expect(ubl).toContain(
        `<cbc:BuyerReference>${leitweg}</cbc:BuyerReference>`,
      );
      expect(ubl).toContain(`<cbc:CustomizationID>${BT24}</cbc:CustomizationID>`);
      expect(result.pdf.contentType).toBe("application/pdf");
    });
  });
});
