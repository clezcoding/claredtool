import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assertAmountsEqual, roundEur } from "./amounts";
import { buildFacts, buildFactsAe } from "./facts";
import { EInvoiceError } from "./errors";
import { serializeCiiComfort } from "./serialize-cii";

describe("serialize-cii-comfort-s", () => {
  it("cii-comfort-s: Comfort CII with EN16931 guideline and BG-6 contact", async () => {
    const facts = buildFacts();
    const xml = await serializeCiiComfort(facts);
    expect(xml.length).toBeGreaterThan(0);
    expect(xml).toContain("urn:cen.eu:en16931:2017");
    expect(xml).not.toMatch(/MINIMUM|BASIC WL|BASICWL/i);
    expect(xml).toContain(facts.seller.email);
    expect(xml).toContain(facts.seller.phone);
    expect(xml).toContain("DefinedTradeContact");
  });

  it("throws EInvoiceError when seller email missing", async () => {
    const facts = buildFacts();
    facts.seller.email = "";
    await expect(serializeCiiComfort(facts)).rejects.toBeInstanceOf(
      EInvoiceError,
    );
    await expect(serializeCiiComfort(facts)).rejects.toMatchObject({
      code: "MISSING_SELLER_CONTACT",
    });
  });

  it("throws EInvoiceError when seller phone missing", async () => {
    const facts = buildFacts();
    facts.seller.phone = "   ";
    await expect(serializeCiiComfort(facts)).rejects.toMatchObject({
      code: "MISSING_SELLER_CONTACT",
    });
  });

  it("source does not reference PDF-embed API", () => {
    const src = readFileSync(join(__dirname, "serialize-cii.ts"), "utf8");
    // Split so package-wide grep for the API name stays clean (D-06 verify).
    const forbidden = ["embed", "InPdf"].join("");
    expect(src).not.toContain(forbidden);
    expect(src).toMatch(/from ["']node-zugferd["']/);
    expect(src).toMatch(/node-zugferd\/profile\/en16931/);
  });
});

describe("cii-comfort-ae", () => {
  it("cii-comfort-ae: AE reverse charge with exemption text and BG-6", async () => {
    const facts = buildFactsAe();
    expect(facts.vat.category).toBe("AE");
    expect(facts.vat.rate).toBe(0);
    expect(facts.vat.exemptionReason).toBeTruthy();
    expect(facts.seller.email).toBeTruthy();
    expect(facts.seller.phone).toBeTruthy();
    expect(facts.seller.vatId).toBeTruthy();
    expect(facts.buyer.vatId).toBeTruthy();

    const xml = await serializeCiiComfort(facts);
    expect(xml).toContain(">AE<");
    expect(xml).toContain(facts.vat.exemptionReason!);
    expect(xml).toContain("ExemptionReason");
    expect(xml).toContain(facts.seller.email);
    expect(xml).toContain(facts.seller.phone);
    expect(xml).toContain("DefinedTradeContact");
  });
});

describe("amounts-parity", () => {
  it("amounts-parity: visual totals equal CII document amounts", async () => {
    const facts = buildFacts();
    expect(facts.totals.lineTotal).toBe(roundEur(100));
    expect(facts.totals.taxTotal).toBe(roundEur(19));
    expect(facts.totals.grandTotal).toBe(roundEur(119));
    const xml = await serializeCiiComfort(facts);
    const pickLast = (tag: string): number => {
      const re = new RegExp(`<ram:${tag}[^>]*>([^<]+)</ram:${tag}>`, "g");
      const matches = [...xml.matchAll(re)];
      expect(matches.length).toBeGreaterThan(0);
      return roundEur(Number(matches[matches.length - 1][1]));
    };
    assertAmountsEqual(facts.totals, {
      lineTotal: pickLast("LineTotalAmount"),
      taxBasis: pickLast("TaxBasisTotalAmount"),
      taxTotal: pickLast("TaxTotalAmount"),
      grandTotal: pickLast("GrandTotalAmount"),
    });
  });
});
