import { Injectable } from "@nestjs/common";
import {
  defaultsFromCountry,
  renderInvoice,
  type InvoiceModel,
} from "@clared/pdf-templates";
import type { TaxDecision } from "@clared/tax-engine";
import type { PdfBytes } from "./pdf.contract";
import { RenderFailedError } from "./render-failed.error";

export type InvoicePdfKnobs = {
  locale: "de" | "en";
  vatLine: "omit" | "zero";
};

export type InvoicePdfInput = {
  entity: InvoiceModel["entity"];
  customer: InvoiceModel["customer"];
  invoice: InvoiceModel["invoice"];
  items: InvoiceModel["items"];
  tax: TaxDecision;
  knobs?: InvoicePdfKnobs;
};

function assertPdfMagic(bytes: Uint8Array): void {
  if (
    bytes.byteLength < 5 ||
    String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!) !== "%PDF"
  ) {
    throw new RenderFailedError();
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateInput(input: InvoicePdfInput): void {
  if (!input?.entity || !input.customer || !input.invoice || !input.tax) {
    throw new RenderFailedError();
  }
  const { entity, customer, invoice, items, tax } = input;
  if (
    !isNonEmptyString(entity.name) ||
    !isNonEmptyString(entity.address) ||
    !isNonEmptyString(entity.country) ||
    !isNonEmptyString(entity.legalForm) ||
    !isNonEmptyString(customer.name) ||
    !isNonEmptyString(customer.address) ||
    !isNonEmptyString(customer.country) ||
    !isNonEmptyString(invoice.number) ||
    !isNonEmptyString(invoice.date) ||
    !isNonEmptyString(invoice.dueDate) ||
    !Array.isArray(items) ||
    items.length === 0 ||
    typeof tax.invoice_tax_rate !== "number" ||
    typeof tax.invoice_tax_shown !== "boolean" ||
    typeof tax.reverse_charge_flag !== "boolean" ||
    !isNonEmptyString(tax.legal_reference)
  ) {
    throw new RenderFailedError();
  }
  for (const item of items) {
    if (
      !isNonEmptyString(item?.bezeichnung) ||
      typeof item.menge !== "number" ||
      typeof item.einzelpreis !== "number" ||
      typeof item.netto !== "number"
    ) {
      throw new RenderFailedError();
    }
  }
}

@Injectable()
export class InvoicePdfService {
  async render(input: InvoicePdfInput): Promise<PdfBytes> {
    validateInput(input);

    const knobs =
      input.knobs ?? defaultsFromCountry(input.entity.country);

    let result: PdfBytes;
    try {
      result = await renderInvoice({
        model: {
          entity: input.entity,
          customer: input.customer,
          invoice: input.invoice,
          items: input.items,
        },
        tax: {
          invoice_tax_rate: input.tax.invoice_tax_rate,
          invoice_tax_shown: input.tax.invoice_tax_shown,
          reverse_charge_flag: input.tax.reverse_charge_flag,
          legal_reference: input.tax.legal_reference,
        },
        locale: knobs.locale,
        vatLine: knobs.vatLine,
      });
    } catch (err) {
      if (err instanceof RenderFailedError) {
        throw err;
      }
      throw new RenderFailedError();
    }

    if (!result || result.contentType !== "application/pdf") {
      throw new RenderFailedError();
    }
    assertPdfMagic(result.bytes);
    return { bytes: result.bytes, contentType: "application/pdf" };
  }
}
