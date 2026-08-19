export interface StagedTaxDecision {
  place_of_supply_country: string;
  tax_liability_party: "supplier" | "customer";
  invoice_tax_rate: number;
  invoice_tax_shown: boolean;
  reverse_charge_flag: boolean;
  legal_reference: string;
  invoice_text_block_id: string;
  applied_rule_id: string;
  applied_rule_version: string;
}

export interface LineItem {
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  netto: number;
}

export interface SampleInvoice {
  rechnungsnummer: string;
  datum: string;
  faellig: string;
  seller: { name: string; address: string; ustid: string };
  buyer: { name: string; address: string; country: string };
  lineItems: LineItem[];
  taxDecision: StagedTaxDecision;
  nettoGesamt: number;
  bruttoGesamt: number;
}

export const SAMPLE_INVOICE: SampleInvoice = {
  rechnungsnummer: "RE-2026-001",
  datum: "2026-08-19",
  faellig: "2026-09-18",
  seller: {
    name: "Nordlicht GmbH",
    address: "Torstraße 120, 10119 Berlin, DE",
    ustid: "DE812345678",
  },
  buyer: {
    name: "Acme Manufacturing LLC",
    address: "1 Market Street, San Francisco, CA 94105",
    country: "US",
  },
  lineItems: [
    {
      bezeichnung: "Tax-engine integration consulting",
      menge: 8,
      einzelpreis: 180,
      netto: 1440,
    },
    {
      bezeichnung: "Invoice workspace UX review",
      menge: 4,
      einzelpreis: 160,
      netto: 640,
    },
  ],
  taxDecision: {
    place_of_supply_country: "US",
    tax_liability_party: "customer",
    invoice_tax_rate: 0,
    invoice_tax_shown: false,
    reverse_charge_flag: true,
    legal_reference:
      "§ 13b UStG — Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).",
    invoice_text_block_id: "ustg-13b-reverse-charge",
    applied_rule_id: "eu-b2b-reverse-charge",
    applied_rule_version: "1.0.0",
  },
  nettoGesamt: 2080,
  bruttoGesamt: 2080,
};
