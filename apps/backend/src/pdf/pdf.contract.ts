/** Sync PDF bytes contract for Nest InvoicePdfService (D-02). Queue/HTML types removed (D-03). */

export interface PdfBytes {
  readonly bytes: Uint8Array;
  readonly contentType: "application/pdf";
}
