const PII_PATTERNS: RegExp[] = [
  /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi, // IBAN-ish
  /\bDE\d{9}\b/gi, // DE VAT
  /\b[A-Z]{2}[A-Z0-9]{8,12}\b/g, // generic VAT id
  /\bINV-[A-Z0-9-]+\b/gi, // invoice number style
  /\b\d{1,5}\s+\w+(?:straße|strasse|str\.|street|weg|platz)\b/gi,
];

function scrubMessage(message: string): string {
  let out = message;
  for (const re of PII_PATTERNS) {
    out = out.replace(re, "[redacted]");
  }
  return out;
}

export type EInvoiceErrorCode =
  | "MISSING_SELLER_CONTACT"
  | "MISSING_BUYER_ENDPOINT"
  | "MISSING_PAYMENT_MEANS"
  | "TAX_MAPPING"
  | "AMOUNT_MISMATCH"
  | "SERIALIZE_FAILED";

export class EInvoiceError extends Error {
  readonly code: EInvoiceErrorCode;

  constructor(code: EInvoiceErrorCode, message?: string) {
    super(scrubMessage(message ?? code));
    this.code = code;
    this.name = "EInvoiceError";
  }
}
