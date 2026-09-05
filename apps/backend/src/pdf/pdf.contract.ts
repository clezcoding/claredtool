/** Sync PDF bytes contract for Nest InvoicePdfService (D-02). Queue/HTML types removed (D-03). */

export interface PdfBytes {
  readonly bytes: Uint8Array;
  readonly contentType: "application/pdf";
}

/** In-memory hybrid PDF + XRechnung (D-03, PDF-01). No Garage persist in 4.7 (D-33). */
export interface EInvoiceArtifacts {
  readonly pdf: PdfBytes;
  readonly xrechnungXml: {
    readonly bytes: Uint8Array;
    readonly contentType: "application/xml";
  };
  /** Same CII string embedded as factur-x.xml — optional for fixtures/debug. */
  readonly ciiXml?: string;
}
