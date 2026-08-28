export type TaxDemoRuleCategory = "EU" | "Inland" | "Drittland";

export type TaxDemoRule = {
  id: string;
  number: number;
  title: string;
  category: TaxDemoRuleCategory;
  active: boolean;
  ifCustomer: string;
  andService: string;
  thenTax: string;
  description: string;
  updatedAgo: string;
};

export const DEMO_RULES: TaxDemoRule[] = [
  {
    id: "eu-b2b-reverse-charge",
    number: 1,
    title: "EU B2B Reverse-Charge",
    category: "EU",
    active: true,
    ifCustomer: "EU (B2B/B2C)",
    andService: "Digital",
    thenTax: "0% (Steuerfrei)",
    description:
      "Wendet Reverse-Charge für berechtigte digitale EU B2B-Dienstleistungen an.",
    updatedAgo: "vor 2 Tagen",
  },
  {
    id: "domestic-standard-19",
    number: 2,
    title: "Inland Standard 19%",
    category: "Inland",
    active: true,
    ifCustomer: "Inland",
    andService: "Standard",
    thenTax: "19%",
    description: "Regelsatz für inländische Transaktionen und Dienstleistungen.",
    updatedAgo: "vor 5 Tagen",
  },
  {
    id: "eu-b2c-digital-services",
    number: 3,
    title: "EU B2C Digital",
    category: "EU",
    active: true,
    ifCustomer: "EU (B2B/B2C)",
    andService: "Digital",
    thenTax: "19% (Standard)",
    description: "USt am Bestimmungsort für EU-B2C-Digitalleistungen.",
    updatedAgo: "vor 1 Woche",
  },
  {
    id: "non-taxable-export",
    number: 4,
    title: "Drittland Export",
    category: "Drittland",
    active: true,
    ifCustomer: "Drittland",
    andService: "Export",
    thenTax: "0% (Steuerfrei)",
    description: "Steuerfrei für qualifizierte Ausfuhren außerhalb der EU.",
    updatedAgo: "vor 2 Wochen",
  },
  {
    id: "domestic-reduced-7",
    number: 5,
    title: "Inland Ermäßigt 7%",
    category: "Inland",
    active: false,
    ifCustomer: "Inland",
    andService: "Ermäßigt",
    thenTax: "7% (Ermäßigt)",
    description: "Ermäßigter Satz für berechtigte Inlandsumsätze.",
    updatedAgo: "vor 3 Wochen",
  },
];
