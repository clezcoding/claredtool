export type TaxDemoRuleCategory = "EU" | "Domestic" | "Export";

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
    ifCustomer: "EU B2B",
    andService: "Digital",
    thenTax: "0%",
    description: "Applies reverse charge for eligible EU B2B digital services.",
    updatedAgo: "2 days ago",
  },
  {
    id: "domestic-standard-19",
    number: 2,
    title: "Domestic Standard 19%",
    category: "Domestic",
    active: true,
    ifCustomer: "Domestic",
    andService: "Standard",
    thenTax: "19%",
    description: "Standard rate for domestic transactions and services.",
    updatedAgo: "5 days ago",
  },
  {
    id: "eu-b2c-digital-services",
    number: 3,
    title: "EU B2C Digital Services",
    category: "EU",
    active: true,
    ifCustomer: "EU B2C",
    andService: "Digital",
    thenTax: "19%",
    description: "VAT at destination for EU B2C digital services.",
    updatedAgo: "1 week ago",
  },
  {
    id: "non-taxable-export",
    number: 4,
    title: "Non-Taxable Export",
    category: "Export",
    active: true,
    ifCustomer: "Non-EU",
    andService: "Export",
    thenTax: "0%",
    description: "Zero-rated for qualifying exports outside the EU.",
    updatedAgo: "2 weeks ago",
  },
];
