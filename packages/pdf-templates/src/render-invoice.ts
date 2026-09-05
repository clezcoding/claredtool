import { createElement } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PdfRenderer } from "takumi-pdf";
import { InvoiceMinimal, type InvoiceModel, CRAFTED } from "./invoice-minimal";

export type { InvoiceModel, InvoiceLine } from "./invoice-minimal";

export type TaxDecisionLike = {
  invoice_tax_rate: number;
  invoice_tax_shown: boolean;
  reverse_charge_flag: boolean;
  legal_reference: string;
};

export type RenderInvoiceInput = {
  model: InvoiceModel;
  tax: TaxDecisionLike;
  /** D-21: fixture 1 uses de + omit */
  locale: "de" | "en";
  vatLine: "omit" | "zero";
};

export type PdfBytes = {
  readonly bytes: Uint8Array;
  readonly contentType: "application/pdf";
};

const RENDER_FAILED = "Render fehlgeschlagen";

const renderer = new PdfRenderer();

function fontsDir(): string {
  return path.join(__dirname, "..", "fonts");
}

function loadFonts(): Array<{ name: string; data: Buffer }> {
  const dir = fontsDir();
  return [
    {
      name: "Inter",
      data: readFileSync(path.join(dir, "Inter-latin.woff2")),
    },
    {
      name: "Inter",
      data: readFileSync(path.join(dir, "Inter-latin-ext.woff2")),
    },
    {
      name: "Instrument Serif",
      data: readFileSync(path.join(dir, "InstrumentSerif-latin.woff2")),
    },
  ];
}

let cachedFonts: Array<{ name: string; data: Buffer }> | null = null;

function fonts(): Array<{ name: string; data: Buffer }> {
  if (!cachedFonts) {
    cachedFonts = loadFonts();
  }
  return cachedFonts;
}

function formatMoney(amount: number, locale: "de" | "en"): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(isoOrDisplay: string, locale: "de" | "en"): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(isoOrDisplay)) {
    const d = new Date(isoOrDisplay);
    if (Number.isNaN(d.getTime())) {
      return isoOrDisplay;
    }
    if (locale === "de") {
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    }
    return isoOrDisplay.slice(0, 10);
  }
  return isoOrDisplay;
}

function labelsFor(locale: "de" | "en") {
  if (locale === "de") {
    return {
      invoice: "Rechnung",
      billTo: "Rechnungsempfänger",
      details: "Rechnungsdetails",
      dueDate: "Fällig",
      description: "Beschreibung",
      qty: "Menge",
      rate: "Preis",
      lineTotal: "Netto",
      subtotal: "Zwischensumme",
      balanceDue: "Gesamt",
    };
  }
  return {
    invoice: "Invoice",
    billTo: "Bill To",
    details: "Invoice Details",
    dueDate: "Due Date",
    description: "Description",
    qty: "Qty",
    rate: "Rate",
    lineTotal: "Total",
    subtotal: "Subtotal",
    balanceDue: "Balance Due",
  };
}

function assertPdfMagic(bytes: Uint8Array): void {
  if (
    bytes.byteLength < 5 ||
    String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!) !== "%PDF"
  ) {
    throw new Error(RENDER_FAILED);
  }
}

/**
 * Render InvoiceModel + TaxDecision to PDF bytes via Takumi + Crafted Invoice Minimal.
 * Fail-closed: never returns empty PdfBytes (D-26).
 * margin:0 + backgroundColor — full-bleed Oatmeal paper (content alone only painted its own box).
 */
export async function renderInvoice(
  input: RenderInvoiceInput
): Promise<PdfBytes> {
  if (!input?.model || !input.tax) {
    throw new Error(RENDER_FAILED);
  }

  const { model, tax, locale, vatLine } = input;
  const labels = labelsFor(locale);

  const subtotal = model.items.reduce(
    (sum, line) => sum + Number(line.netto),
    0
  );
  const rate = Number(tax.invoice_tax_rate) || 0;
  const showTax = tax.invoice_tax_shown === true;
  const taxAmount = showTax ? subtotal * (rate / 100) : 0;
  const total = showTax ? subtotal + taxAmount : subtotal;

  let taxLabel: string | null = null;
  let taxAmountStr: string | null = null;
  if (showTax) {
    taxLabel = locale === "de" ? `MwSt ${rate} %` : `VAT ${rate}%`;
    taxAmountStr = formatMoney(taxAmount, locale);
  } else if (vatLine === "zero") {
    taxLabel = locale === "de" ? "MwSt 0,00" : "VAT 0.00";
    taxAmountStr = formatMoney(0, locale);
  }

  const money = {
    subtotal: formatMoney(subtotal, locale),
    taxLabel,
    taxAmount: taxAmountStr,
    total: formatMoney(total, locale),
    lineRates: model.items.map((i) =>
      formatMoney(Number(i.einzelpreis), locale)
    ),
    lineTotals: model.items.map((i) => formatMoney(Number(i.netto), locale)),
  };

  const displayModel: InvoiceModel = {
    ...model,
    invoice: {
      ...model.invoice,
      date: formatDate(model.invoice.date, locale),
      dueDate: formatDate(model.invoice.dueDate, locale),
    },
  };

  const legalReference =
    tax.legal_reference && tax.legal_reference.trim().length > 0
      ? tax.legal_reference
      : null;

  const node = createElement(InvoiceMinimal, {
    model: displayModel,
    money,
    legalReference,
    labels,
  });

  let bytes: Uint8Array;
  try {
    bytes = await renderer.render(node, {
      size: "a4",
      margin: 0,
      // Paper color under everything — without this, below-content area is viewer white.
      backgroundColor: CRAFTED.oatmeal,
      fonts: fonts(),
      fontFamilies: ["Inter", "Instrument Serif", "sans-serif"],
    });
  } catch {
    throw new Error(RENDER_FAILED);
  }

  assertPdfMagic(bytes);
  return { bytes, contentType: "application/pdf" };
}
