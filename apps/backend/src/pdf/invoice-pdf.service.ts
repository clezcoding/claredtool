import { Injectable } from "@nestjs/common";
import {
  assertAmountsEqual,
  mapVatCategory,
  normalizeUnitCode,
  roundEur,
  serializeCiiComfort,
  serializeUblXRechnung,
  type En16931Facts,
  type MoneyTotals,
  EInvoiceError,
} from "@clared/e-invoice";
import {
  defaultsFromCountry,
  renderInvoice,
  type InvoiceModel,
} from "@clared/pdf-templates";
import type { TaxDecision } from "@clared/tax-engine";
import type { EInvoiceArtifacts } from "./pdf.contract";
import { RenderFailedError } from "./render-failed.error";

export type InvoicePdfKnobs = {
  locale: "de" | "en";
  vatLine: "omit" | "zero";
};

export type StructuredPartyBase = {
  name: string;
  street: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  vatId?: string | null;
};

export type InvoicePdfEntity = StructuredPartyBase & {
  legalForm: string;
  email: string;
  phone: string;
  iban?: string | null;
  bic?: string | null;
  hrb?: string | null;
  managingDirector?: string | null;
};

export type InvoicePdfCustomer = StructuredPartyBase & {
  leitwegId?: string | null;
  buyerReference?: string | null;
};

export type InvoicePdfLine = {
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  netto: number;
  unit?: string | null;
};

export type InvoicePdfInput = {
  entity: InvoicePdfEntity;
  customer: InvoicePdfCustomer;
  invoice: {
    number: string;
    date: string;
    dueDate: string;
    supplyType: "goods" | "service";
  };
  items: InvoicePdfLine[];
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Coerce Prisma Decimal / string numerics at the service edge. */
function toNum(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() === "") return Number.NaN;
  if (value == null) return Number.NaN;
  return Number(String(value));
}

function normalizeNumericFields(input: InvoicePdfInput): InvoicePdfInput {
  return {
    ...input,
    tax: {
      ...input.tax,
      invoice_tax_rate: toNum(input.tax?.invoice_tax_rate as unknown),
    },
    items: (input.items ?? []).map((item) => ({
      ...item,
      menge: toNum(item?.menge as unknown),
      einzelpreis: toNum(item?.einzelpreis as unknown),
      netto: toNum(item?.netto as unknown),
    })),
  };
}

function formatDisplayAddress(party: StructuredPartyBase): string {
  const parts = [party.street.trim()];
  if (isNonEmptyString(party.addressLine2)) {
    parts.push(party.addressLine2.trim());
  }
  parts.push(`${party.postalCode.trim()} ${party.city.trim()}`);
  return parts.join(", ");
}

function validatePartyAddress(party: StructuredPartyBase | undefined): void {
  if (
    !party ||
    !isNonEmptyString(party.name) ||
    !isNonEmptyString(party.street) ||
    !isNonEmptyString(party.postalCode) ||
    !isNonEmptyString(party.city) ||
    !isNonEmptyString(party.country)
  ) {
    throw new RenderFailedError();
  }
}

/**
 * Fail-closed gates for e-invoice generate (D-11, D-12, D-25, D-31, Q1, Q2).
 * Q2: HRB / Geschäftsführer optional — absence alone does not fail-closed.
 */
function validateInput(input: InvoicePdfInput): void {
  if (!input?.entity || !input.customer || !input.invoice || !input.tax) {
    throw new RenderFailedError();
  }
  const { entity, customer, invoice, items, tax } = input;
  validatePartyAddress(entity);
  validatePartyAddress(customer);

  // Q1 BG-6: seller email + phone required on generate
  if (!isNonEmptyString(entity.email) || !isNonEmptyString(entity.phone)) {
    throw new RenderFailedError();
  }

  if (
    !isNonEmptyString(entity.legalForm) ||
    !isNonEmptyString(invoice.number) ||
    !isNonEmptyString(invoice.date) ||
    !isNonEmptyString(invoice.dueDate) ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !isFiniteNumber(tax.invoice_tax_rate) ||
    tax.invoice_tax_rate < 0 ||
    typeof tax.invoice_tax_shown !== "boolean" ||
    typeof tax.reverse_charge_flag !== "boolean" ||
    !isNonEmptyString(tax.legal_reference)
  ) {
    throw new RenderFailedError();
  }

  // D-31: one supplyType per invoice; reject unknown / mixed
  if (invoice.supplyType !== "goods" && invoice.supplyType !== "service") {
    throw new RenderFailedError();
  }

  for (const item of items) {
    if (
      !isNonEmptyString(item?.bezeichnung) ||
      !isFiniteNumber(item.menge) ||
      !isFiniteNumber(item.einzelpreis) ||
      !isFiniteNumber(item.netto) ||
      item.menge <= 0 ||
      item.einzelpreis < 0 ||
      item.netto < 0
    ) {
      throw new RenderFailedError();
    }
  }
}

function visualTotals(input: InvoicePdfInput, rate: number): MoneyTotals {
  const lineTotal = roundEur(
    input.items.reduce((sum, item) => sum + item.netto, 0),
  );
  const taxTotal = roundEur(lineTotal * (rate / 100));
  return {
    lineTotal,
    taxBasis: lineTotal,
    taxTotal,
    grandTotal: roundEur(lineTotal + taxTotal),
  };
}

function toFacts(input: InvoicePdfInput): En16931Facts {
  const category = mapVatCategory(input.tax);
  const rate = category === "AE" ? 0 : Number(input.tax.invoice_tax_rate);
  const exemptionReason =
    category === "AE" ? input.tax.legal_reference.trim() : undefined;
  if (category === "AE" && !exemptionReason) {
    throw new EInvoiceError("TAX_MAPPING");
  }

  const totals = visualTotals(input, rate);
  const buyerRef =
    (isNonEmptyString(input.customer.leitwegId)
      ? input.customer.leitwegId.trim()
      : undefined) ??
    (isNonEmptyString(input.customer.buyerReference)
      ? input.customer.buyerReference.trim()
      : undefined);

  return {
    number: input.invoice.number.trim(),
    issueDate: new Date(`${input.invoice.date.trim()}T00:00:00.000Z`),
    dueDate: new Date(`${input.invoice.dueDate.trim()}T00:00:00.000Z`),
    currency: "EUR",
    typeCode: "380",
    supplyType: input.invoice.supplyType,
    seller: {
      name: input.entity.name.trim(),
      line1: input.entity.street.trim(),
      postCode: input.entity.postalCode.trim(),
      city: input.entity.city.trim(),
      countryCode: input.entity.country.trim(),
      vatId: (input.entity.vatId ?? "").trim(),
      email: input.entity.email.trim(),
      phone: input.entity.phone.trim(),
    },
    buyer: {
      name: input.customer.name.trim(),
      line1: input.customer.street.trim(),
      postCode: input.customer.postalCode.trim(),
      city: input.customer.city.trim(),
      countryCode: input.customer.country.trim(),
      vatId: (input.customer.vatId ?? "").trim(),
    },
    ...(buyerRef ? { buyerReference: buyerRef } : {}),
    lines: input.items.map((item, index) => ({
      id: String(index + 1),
      name: item.bezeichnung.trim(),
      quantity: item.menge,
      unitCode: normalizeUnitCode(item.unit?.trim() || "C62"),
      netAmount: roundEur(item.netto),
    })),
    vat: {
      category,
      rate,
      ...(exemptionReason ? { exemptionReason } : {}),
    },
    totals,
    tax: input.tax,
  };
}

function toVisualModel(input: InvoicePdfInput): InvoiceModel {
  return {
    entity: {
      name: input.entity.name,
      address: formatDisplayAddress(input.entity),
      vatId: input.entity.vatId,
      country: input.entity.country,
      legalForm: input.entity.legalForm,
    },
    customer: {
      name: input.customer.name,
      address: formatDisplayAddress(input.customer),
      vatId: input.customer.vatId,
      country: input.customer.country,
    },
    invoice: {
      number: input.invoice.number,
      date: input.invoice.date,
      dueDate: input.invoice.dueDate,
    },
    items: input.items.map((item) => ({
      bezeichnung: item.bezeichnung,
      menge: item.menge,
      einzelpreis: item.einzelpreis,
      netto: item.netto,
    })),
  };
}

@Injectable()
export class InvoicePdfService {
  async render(input: InvoicePdfInput): Promise<EInvoiceArtifacts> {
    const normalized = normalizeNumericFields(input);
    validateInput(normalized);

    const knobs =
      normalized.knobs ?? defaultsFromCountry(normalized.entity.country);

    let ciiXml: string;
    let ublXml: string;
    try {
      const facts = toFacts(normalized);
      assertAmountsEqual(
        visualTotals(
          normalized,
          facts.vat.category === "AE" ? 0 : Number(normalized.tax.invoice_tax_rate),
        ),
        facts.totals,
      );
      ciiXml = await serializeCiiComfort(facts);
      ublXml = serializeUblXRechnung(facts);
    } catch {
      throw new RenderFailedError();
    }

    let pdfResult: { bytes: Uint8Array; contentType: string };
    try {
      pdfResult = await renderInvoice({
        model: toVisualModel(normalized),
        tax: {
          invoice_tax_rate: normalized.tax.invoice_tax_rate,
          invoice_tax_shown: normalized.tax.invoice_tax_shown,
          reverse_charge_flag: normalized.tax.reverse_charge_flag,
          legal_reference: normalized.tax.legal_reference,
        },
        locale: knobs.locale,
        vatLine: knobs.vatLine,
        ciiXml,
      });
    } catch {
      throw new RenderFailedError();
    }

    if (!pdfResult || pdfResult.contentType !== "application/pdf") {
      throw new RenderFailedError();
    }
    assertPdfMagic(pdfResult.bytes);

    return {
      pdf: { bytes: pdfResult.bytes, contentType: "application/pdf" },
      xrechnungXml: {
        bytes: new TextEncoder().encode(ublXml),
        contentType: "application/xml",
      },
      ciiXml,
    };
  }
}
