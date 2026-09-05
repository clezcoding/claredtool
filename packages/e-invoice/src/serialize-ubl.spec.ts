import { buildFacts } from "./facts";
import { EInvoiceError } from "./errors";
import { serializeUblXRechnung } from "./serialize-ubl";
import { assertAmountsEqual, roundEur } from "./amounts";

const BT24 =
  "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0";

describe("serialize-ubl-xrechnung", () => {
  it("ubl-xrechnung: BT-24 customization ID and BG-6 seller contact", () => {
    const facts = buildFacts();
    const xml = serializeUblXRechnung(facts);
    expect(xml.length).toBeGreaterThan(0);
    expect(xml).toContain(`<cbc:CustomizationID>${BT24}</cbc:CustomizationID>`);
    expect(xml).toContain(
      `<cbc:ElectronicMail>${facts.seller.email}</cbc:ElectronicMail>`,
    );
    expect(xml).toContain(
      `<cbc:Telephone>${facts.seller.phone}</cbc:Telephone>`,
    );
    expect(xml).toContain("<cac:Contact>");
  });

  it("throws EInvoiceError when seller email or phone missing", () => {
    const noEmail = buildFacts();
    noEmail.seller.email = "";
    expect(() => serializeUblXRechnung(noEmail)).toThrow(EInvoiceError);

    const noPhone = buildFacts();
    noPhone.seller.phone = "";
    expect(() => serializeUblXRechnung(noPhone)).toThrow(EInvoiceError);
  });

  it("amounts-parity: visual totals equal UBL monetary totals", () => {
    const facts = buildFacts();
    const xml = serializeUblXRechnung(facts);
    const pick = (local: string): number => {
      const re = new RegExp(
        `<(?:cbc:)?${local}[^>]*>([^<]+)</(?:cbc:)?${local}>`,
      );
      const m = xml.match(re);
      expect(m).toBeTruthy();
      return roundEur(Number(m![1]));
    };
    assertAmountsEqual(facts.totals, {
      lineTotal: pick("LineExtensionAmount"),
      taxBasis: pick("TaxExclusiveAmount"),
      taxTotal: pick("TaxAmount"),
      grandTotal: pick("TaxInclusiveAmount"),
    });
  });
});
