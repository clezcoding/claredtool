import { zugferd } from "node-zugferd";
import { EN16931 } from "node-zugferd/profile/en16931";
import { assertAmountsEqual, roundEur, type MoneyTotals } from "./amounts";
import { EInvoiceError } from "./errors";
import type { En16931Facts } from "./facts";

function moneyStr(n: number): string {
  return roundEur(n).toFixed(2);
}

function assertSellerContact(facts: En16931Facts): void {
  const email = facts.seller.email?.trim();
  const phone = facts.seller.phone?.trim();
  if (!email || !phone) {
    throw new EInvoiceError("MISSING_SELLER_CONTACT");
  }
}

function extractXmlTotals(xml: string): MoneyTotals {
  const pick = (tag: string): number => {
    const re = new RegExp(`<ram:${tag}[^>]*>([^<]+)</ram:${tag}>`);
    const m = xml.match(re);
    if (!m) {
      throw new EInvoiceError("AMOUNT_MISMATCH");
    }
    return roundEur(Number(m[1]));
  };
  return {
    lineTotal: pick("LineTotalAmount"),
    taxBasis: pick("TaxBasisTotalAmount"),
    taxTotal: pick("TaxTotalAmount"),
    grandTotal: pick("GrandTotalAmount"),
  };
}

/** Comfort / EN16931 CII via node-zugferd toXML only (D-04, D-06, D-07). */
export async function serializeCiiComfort(facts: En16931Facts): Promise<string> {
  assertSellerContact(facts);

  // strict:false — XSD via xsd-schema-validator needs approved native build;
  // product Schematron gate is Mustang/KoSIT in CI (D-27/D-28), not Nest.
  const invoicer = zugferd({ profile: EN16931, strict: false });
  const data = {
    number: facts.number,
    typeCode: facts.typeCode,
    issueDate: facts.issueDate,
    transaction: {
      line: facts.lines.map((line) => ({
        identifier: line.id,
        tradeProduct: { name: line.name },
        tradeAgreement: {
          netTradePrice: { chargeAmount: moneyStr(line.netAmount / line.quantity) },
        },
        tradeDelivery: {
          billedQuantity: {
            amount: line.quantity.toFixed(4),
            unitMeasureCode: line.unitCode as "C62",
          },
        },
        tradeSettlement: {
          tradeTax: {
            typeCode: "VAT" as const,
            categoryCode: facts.vat.category,
            rateApplicablePercent: String(facts.vat.rate),
          },
          monetarySummation: { lineTotalAmount: moneyStr(line.netAmount) },
        },
      })),
      tradeAgreement: {
        seller: {
          name: facts.seller.name,
          postalAddress: {
            postCode: facts.seller.postCode,
            line1: facts.seller.line1,
            city: facts.seller.city,
            countryCode: facts.seller.countryCode as "DE",
          },
          taxRegistration: { vatIdentifier: facts.seller.vatId },
          tradeContact: {
            phoneNumber: facts.seller.phone,
            emailAddress: facts.seller.email,
          },
        },
        buyer: {
          name: facts.buyer.name,
          postalAddress: {
            postCode: facts.buyer.postCode,
            line1: facts.buyer.line1,
            city: facts.buyer.city,
            countryCode: facts.buyer.countryCode as "DE",
          },
          taxRegistration: { vatIdentifier: facts.buyer.vatId },
        },
      },
      tradeDelivery: {
        information: { deliveryDate: facts.issueDate },
      },
      tradeSettlement: {
        currencyCode: facts.currency,
        vatBreakdown: [
          {
            calculatedAmount: moneyStr(facts.totals.taxTotal),
            typeCode: "VAT" as const,
            basisAmount: moneyStr(facts.totals.taxBasis),
            categoryCode: facts.vat.category,
            rateApplicablePercent: moneyStr(facts.vat.rate),
          },
        ],
        paymentTerms: { dueDate: facts.dueDate },
        monetarySummation: {
          lineTotalAmount: moneyStr(facts.totals.lineTotal),
          taxBasisTotalAmount: moneyStr(facts.totals.taxBasis),
          taxTotal: {
            amount: moneyStr(facts.totals.taxTotal),
            currencyCode: facts.currency,
          },
          grandTotalAmount: moneyStr(facts.totals.grandTotal),
          duePayableAmount: moneyStr(facts.totals.grandTotal),
        },
      },
    },
  };

  try {
    const invoice = invoicer.create(data);
    const xml = await invoice.toXML();
    assertAmountsEqual(facts.totals, extractXmlTotals(xml));
    return xml;
  } catch (err) {
    if (err instanceof EInvoiceError) throw err;
    throw new EInvoiceError("SERIALIZE_FAILED");
  }
}
