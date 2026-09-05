import type { TaxDecision } from "@clared/tax-engine";
import { roundEur, type MoneyTotals } from "./amounts";
import { mapVatCategory } from "./map-tax";

export type PartyAddress = {
  name: string;
  line1: string;
  postCode: string;
  city: string;
  countryCode: string;
  vatId: string;
};

export type SellerParty = PartyAddress & {
  email: string;
  phone: string;
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
  supplyType: "service";
  seller: SellerParty;
  buyer: PartyAddress;
  lines: InvoiceLine[];
  vat: {
    category: "S";
    rate: number;
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

/** Hard-coded DE B2B 19% fixture (Wave 1 tracer). */
export function buildFacts(): En16931Facts {
  const lines: InvoiceLine[] = [
    {
      id: "1",
      name: "Beratungsleistung",
      quantity: 1,
      unitCode: "C62",
      netAmount: roundEur(100),
    },
  ];
  const lineTotal = roundEur(
    lines.reduce((sum, line) => sum + line.netAmount, 0),
  );
  const rate = DE_B2B_TAX.invoice_tax_rate;
  const taxTotal = roundEur(lineTotal * (rate / 100));
  const grandTotal = roundEur(lineTotal + taxTotal);
  const category = mapVatCategory(DE_B2B_TAX);

  return {
    number: "INV-2024-001",
    issueDate: new Date("2024-11-15T00:00:00.000Z"),
    dueDate: new Date("2024-12-15T00:00:00.000Z"),
    currency: "EUR",
    typeCode: "380",
    supplyType: "service",
    seller: {
      name: "Clared Seller GmbH",
      line1: "Musterstrasse 1",
      postCode: "80333",
      city: "Muenchen",
      countryCode: "DE",
      vatId: "DE123456789",
      email: "seller@example.com",
      phone: "+498912345678",
    },
    buyer: {
      name: "Kunden AG",
      line1: "Kundenweg 15",
      postCode: "10115",
      city: "Berlin",
      countryCode: "DE",
      vatId: "DE987654321",
    },
    lines,
    vat: { category, rate },
    totals: {
      lineTotal,
      taxBasis: lineTotal,
      taxTotal,
      grandTotal,
    },
    tax: DE_B2B_TAX,
  };
}
