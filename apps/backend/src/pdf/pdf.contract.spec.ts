import {
  DEFAULT_GOTENBERG_URL,
  PDF_PAPER_A4,
  PDF_QUEUE,
  type HtmlInvoiceFacts,
} from "./pdf.contract";

describe("PDF_QUEUE", () => {
  it("equals pdf-generation", () => {
    expect(PDF_QUEUE).toBe("pdf-generation");
  });
});

describe("PdfPaperSize A4", () => {
  it("uses Gotenberg HTML-to-PDF inches paperWidth 8.27 and paperHeight 11.7", () => {
    expect(PDF_PAPER_A4.paperWidth).toBe("8.27");
    expect(PDF_PAPER_A4.paperHeight).toBe("11.7");
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
