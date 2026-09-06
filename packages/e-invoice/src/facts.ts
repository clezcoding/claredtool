import type { TaxDecision } from "@clared/tax-engine";
import { normalizeUnitCode, roundEur, type MoneyTotals } from "./amounts";
import { EInvoiceError } from "./errors";
import { mapVatCategory } from "./map-tax";

export type PartyAddress = {
  name: string;
  line1: string;
  postCode: string;
  city: string;
  countryCode: string;
  vatId: string;
  /** BT-34/BT-49 EndpointID (scheme EM) — required for XRechnung UBL (PEPPOL R010/R020). */
  email?: string;
};

export type SellerParty = PartyAddress & {
  email: string;
  phone: string;
  /** BG-16 PayeeFinancialAccount — fixture/test IBAN OK; never invent on live path (D-18). */
  iban?: string;
};

export type InvoiceLine = {
  id: string;
  name: string;
  quantity: number;
  unitCode: string;
  netAmount: number;
};

export type En16931Facts = {
  number: string;
  issueDate: Date;
  dueDate: Date;
  currency: "EUR";
  typeCode: "380";
  supplyType: "goods" | "service";
  seller: SellerParty;
  buyer: PartyAddress;
  /** BT-10 Buyer reference — Leitweg-ID for B2G when present (D-19). */
  buyerReference?: string;
  lines: InvoiceLine[];
  vat: {
    category: "S" | "AE";
    rate: number;
    exemptionReason?: string;
  };
  totals: MoneyTotals;
  tax: TaxDecision;
};

const DE_B2B_TAX: TaxDecision = {
  place_of_supply_country: "DE",
  tax_liability_party: "supplier",
  invoice_tax_rate: 19,
  invoice_tax_shown: true,
  reverse_charge_flag: false,
  legal_reference: "§ 12 Abs. 1 UStG",
  invoice_text_block_id: "de-b2b-19",
  applied_rule_id: "de-b2b-standard-19",
  applied_rule_version: "1",
  source_citation: [],
  audit_trace: [],
};

const DE_RC_TAX: TaxDecision = {
  place_of_supply_country: "DE",
  tax_liability_party: "customer",
  invoice_tax_rate: 0,
  invoice_tax_shown: false,
  reverse_charge_flag: true,
  legal_reference: "§ 13b UStG",
  invoice_text_block_id: "de-rc",
  applied_rule_id: "de-reverse-charge",
  applied_rule_version: "1",
  source_citation: [],
  audit_trace: [],
};

const SELLER: SellerParty = {
  name: "Clared Seller GmbH",
  line1: "Musterstrasse 1",
  postCode: "80333",
  city: "Muenchen",
  countryCode: "DE",
  vatId: "DE123456789",
  email: "seller@example.com",
  phone: "+498912345678",
  // D-18: non-existent but checksum-valid test IBAN (KoSIT sample pattern)
  iban: "DE79000000001234567890",
};

const BUYER: PartyAddress = {
  name: "Kunden AG",
  line1: "Kundenweg 15",
  postCode: "10115",
  city: "Berlin",
  countryCode: "DE",
  vatId: "DE987654321",
  email: "buyer@example.com",
};

function buildFromTax(
  tax: TaxDecision,
  opts: { number: string; unitRaw: string },
): En16931Facts {
  const category = mapVatCategory(tax);
  const rate = category === "AE" ? 0 : Number(tax.invoice_tax_rate);
  const exemptionReason =
    category === "AE" ? tax.legal_reference.trim() : undefined;
  if (category === "AE" && !exemptionReason) {
    throw new EInvoiceError("TAX_MAPPING");
  }

  const lines: InvoiceLine[] = [
    {
      id: "1",
      name: "Beratungsleistung",
      quantity: 1,
      unitCode: normalizeUnitCode(opts.unitRaw),
      netAmount: roundEur(100),
    },
  ];
  const lineTotal = roundEur(
    lines.reduce((sum, line) => sum + line.netAmount, 0),
  );
  const taxTotal = roundEur(lineTotal * (rate / 100));
  const grandTotal = roundEur(lineTotal + taxTotal);

  return {
    number: opts.number,
    issueDate: new Date("2024-11-15T00:00:00.000Z"),
    dueDate: new Date("2024-12-15T00:00:00.000Z"),
    currency: "EUR",
    typeCode: "380",
    supplyType: "service",
    seller: { ...SELLER },
    buyer: { ...BUYER },
    lines,
    vat: {
      category,
      rate,
      ...(exemptionReason ? { exemptionReason } : {}),
    },
    totals: {
      lineTotal,
      taxBasis: lineTotal,
      taxTotal,
      grandTotal,
    },
    tax,
  };
}

/** Hard-coded DE B2B 19% fixture (Wave 1 tracer). */
export function buildFacts(): En16931Facts {
  return buildFromTax(DE_B2B_TAX, { number: "INV-2024-001", unitRaw: "C62" });
}

/** DE reverse-charge AE fixture: seller+buyer VAT, BG-6, exemption text (D-26, Q1). */
export function buildFactsAe(): En16931Facts {
  return buildFromTax(DE_RC_TAX, { number: "INV-2024-AE-001", unitRaw: "HUR" });
}
