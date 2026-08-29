import {
  DEFAULT_GOTENBERG_URL,
  PDF_QUEUE,
  type HtmlInvoiceFacts,
  type PdfPaperSize,
} from "./pdf.contract";

describe("PDF_QUEUE", () => {
  it("equals pdf-generation", () => {
    expect(PDF_QUEUE).toBe("pdf-generation");
  });
});

describe("PdfPaperSize A4", () => {
  it("uses Gotenberg HTML-to-PDF inches paperWidth 8.27 and paperHeight 11.7", () => {
    const a4: PdfPaperSize = { paperWidth: "8.27", paperHeight: "11.7" };
    expect(a4.paperWidth).toBe("8.27");
    expect(a4.paperHeight).toBe("11.7");
  });
});

describe("DEFAULT_GOTENBERG_URL", () => {
  it("is host-local or docker alias, not a public hostname (D-11)", () => {
    expect([
      "http://127.0.0.1:3000",
      "http://gotenberg:3000",
      "http://clared-gotenberg:3000",
    ]).toContain(DEFAULT_GOTENBERG_URL);
    expect(DEFAULT_GOTENBERG_URL).not.toMatch(/\.(online|com|io|net|org)(:|\/|$)/);
  });
});

describe("HtmlInvoiceFacts empty html", () => {
  it("is a typed empty-input case (Plan 02 rejects before Gotenberg)", () => {
    const empty: HtmlInvoiceFacts = { html: "" };
    expect(empty.html).toBe("");
  });
});
