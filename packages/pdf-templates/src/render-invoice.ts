import { createElement } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PdfRenderer } from "takumi-pdf";
import { InvoiceMinimal, type InvoiceModel, CRAFTED } from "./invoice-minimal";
import { formatMoney, formatInvoiceDate } from "./format-money";

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

const REVERSE_CHARGE_SENTENCE = {
  de: "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).",
  en: "Tax liability of the recipient (reverse charge).",
} as const;

/**
 * D-11/D-12: printable legal lines only — legal_reference + RC sentence.
 * Never include applied_rule_id, applied_rule_version, audit_trace, invoice_text_block_id.
 */
export function legalBlockLines(
  tax: TaxDecisionLike,
  locale: "de" | "en"
): string[] {
  const lines: string[] = [];
  const ref = tax.legal_reference?.trim();
  if (ref) {
    lines.push(ref);
  }
  if (tax.reverse_charge_flag === true) {
    lines.push(REVERSE_CHARGE_SENTENCE[locale]);
  }
  return lines;
}

let renderer = new PdfRenderer();

// Takumi concurrency contract undocumented — serialize shared PdfRenderer.
// ponytail: global lock; upgrade to confirmed re-entrant renderer or per-call instance if needed.
let renderLock: Promise<void> = Promise.resolve();

function recreateRenderer(): void {
  try {
    renderer.free();
  } catch {
    /* ignore free errors on panicked instance */
  }
  renderer = new PdfRenderer();
}

function withRendererExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = renderLock.then(fn);
  renderLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

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

/** Round to EUR cents so printed net + tax equals printed total. */
export function roundEur(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
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

  const subtotal = roundEur(
    model.items.reduce((sum, line) => sum + Number(line.netto), 0)
  );
  const rate = Number(tax.invoice_tax_rate) || 0;
  const showTax = tax.invoice_tax_shown === true;
  const taxAmount = showTax ? roundEur(subtotal * (rate / 100)) : 0;
  const total = roundEur(subtotal + taxAmount);

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
      date: formatInvoiceDate(model.invoice.date, locale),
      dueDate: formatInvoiceDate(model.invoice.dueDate, locale),
    },
  };

  const legalLines = legalBlockLines(tax, locale);
  const legalReference = legalLines.length > 0 ? legalLines.join("\n") : null;

  const node = createElement(InvoiceMinimal, {
    model: displayModel,
    money,
    legalReference,
    labels,
  });

  let bytes: Uint8Array;
  try {
    bytes = await withRendererExclusive(async () => {
      try {
        return await renderer.render(node, {
          size: "a4",
          margin: 0,
          // Paper color under everything — without this, below-content area is viewer white.
          backgroundColor: CRAFTED.oatmeal,
          fonts: fonts(),
          fontFamilies: ["Inter", "Instrument Serif", "sans-serif"],
        });
      } catch {
        // WASM panic / internal error — drop instance so later renders can recover.
        recreateRenderer();
        throw new Error(RENDER_FAILED);
      }
    });
  } catch {
    throw new Error(RENDER_FAILED);
  }

  assertPdfMagic(bytes);
  return { bytes, contentType: "application/pdf" };
}
