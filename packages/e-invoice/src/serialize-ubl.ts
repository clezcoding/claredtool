import { assertAmountsEqual, roundEur, type MoneyTotals } from "./amounts";
import { EInvoiceError } from "./errors";
import type { En16931Facts } from "./facts";

const BT24 =
  "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0";

function moneyStr(n: number): string {
  return roundEur(n).toFixed(2);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function assertSellerContact(facts: En16931Facts): void {
  const email = facts.seller.email?.trim();
  const phone = facts.seller.phone?.trim();
  if (!email || !phone) {
    throw new EInvoiceError("MISSING_SELLER_CONTACT");
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function extractUblTotals(xml: string): MoneyTotals {
  const pick = (local: string): number => {
    const re = new RegExp(
      `<(?:cbc:)?${local}[^>]*>([^<]+)</(?:cbc:)?${local}>`,
    );
    const m = xml.match(re);
    if (!m) throw new EInvoiceError("AMOUNT_MISMATCH");
    return roundEur(Number(m[1]));
  };
  return {
    lineTotal: pick("LineExtensionAmount"),
    taxBasis: pick("TaxExclusiveAmount"),
    taxTotal: pick("TaxAmount"),
    grandTotal: pick("TaxInclusiveAmount"),
  };
}

/** Hand-rolled XRechnung 3.0.2 UBL Invoice (D-01, D-02, D-08). */
export function serializeUblXRechnung(facts: En16931Facts): string {
  assertSellerContact(facts);

  const linesXml = facts.lines
    .map(
      (line) => `
  <cac:InvoiceLine>
    <cbc:ID>${escapeXml(line.id)}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${escapeXml(line.unitCode)}">${line.quantity.toFixed(4)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${facts.currency}">${moneyStr(line.netAmount)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXml(line.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${facts.vat.category}</cbc:ID>
        <cbc:Percent>${moneyStr(facts.vat.rate)}</cbc:Percent>${
          facts.vat.exemptionReason
            ? `
        <cbc:TaxExemptionReason>${escapeXml(facts.vat.exemptionReason)}</cbc:TaxExemptionReason>`
            : ""
        }
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${facts.currency}">${moneyStr(line.netAmount / line.quantity)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>${BT24}</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(facts.number)}</cbc:ID>
  <cbc:IssueDate>${isoDate(facts.issueDate)}</cbc:IssueDate>
  <cbc:DueDate>${isoDate(facts.dueDate)}</cbc:DueDate>
  <cbc:InvoiceTypeCode>${facts.typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${facts.currency}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(facts.seller.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(facts.seller.line1)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(facts.seller.city)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(facts.seller.postCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escapeXml(facts.seller.countryCode)}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(facts.seller.vatId)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(facts.seller.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Telephone>${escapeXml(facts.seller.phone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escapeXml(facts.seller.email)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(facts.buyer.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(facts.buyer.line1)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(facts.buyer.city)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(facts.buyer.postCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escapeXml(facts.buyer.countryCode)}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(facts.buyer.vatId)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(facts.buyer.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${facts.currency}">${moneyStr(facts.totals.taxTotal)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${facts.currency}">${moneyStr(facts.totals.taxBasis)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${facts.currency}">${moneyStr(facts.totals.taxTotal)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${facts.vat.category}</cbc:ID>
        <cbc:Percent>${moneyStr(facts.vat.rate)}</cbc:Percent>${
          facts.vat.exemptionReason
            ? `
        <cbc:TaxExemptionReason>${escapeXml(facts.vat.exemptionReason)}</cbc:TaxExemptionReason>`
            : ""
        }
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${facts.currency}">${moneyStr(facts.totals.lineTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${facts.currency}">${moneyStr(facts.totals.taxBasis)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${facts.currency}">${moneyStr(facts.totals.grandTotal)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${facts.currency}">${moneyStr(facts.totals.grandTotal)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${linesXml}
</Invoice>
`;

  assertAmountsEqual(facts.totals, extractUblTotals(xml));
  return xml;
}
