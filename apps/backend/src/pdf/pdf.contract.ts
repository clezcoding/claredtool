/** Phase 5 fills templates. 4.3: types + enqueue only. */

export type PdfPaperSize = { paperWidth: "8.27"; paperHeight: "11.7" };

export const PDF_PAPER_A4: PdfPaperSize = {
  paperWidth: "8.27",
  paperHeight: "11.7",
};

export interface HtmlInvoiceFacts {
  readonly html: string;
}

export interface PdfBytes {
  readonly bytes: Uint8Array;
  readonly contentType: "application/pdf";
}

export const PDF_QUEUE = "pdf-generation";

/** Host-local sample. Coolify alias is http://clared-gotenberg:3000. Never a public FQDN (D-11). */
export const DEFAULT_GOTENBERG_URL = "http://127.0.0.1:3000";
