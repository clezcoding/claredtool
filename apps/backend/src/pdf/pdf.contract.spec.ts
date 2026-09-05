import type { PdfBytes } from "./pdf.contract";
import * as contract from "./pdf.contract";

describe("PdfBytes", () => {
  it("uses contentType application/pdf", () => {
    const sample: PdfBytes = {
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
      contentType: "application/pdf",
    };
    expect(sample.contentType).toBe("application/pdf");
    expect(sample.bytes.byteLength).toBeGreaterThanOrEqual(5);
  });

  it("does not export queue or Chromium URL constants (D-03)", () => {
    expect(contract).not.toHaveProperty("PDF_QUEUE");
    expect(contract).not.toHaveProperty("DEFAULT_GOTENBERG_URL");
    expect(contract).not.toHaveProperty("PDF_PAPER_A4");
    expect(contract).not.toHaveProperty("HtmlInvoiceFacts");
  });
});
