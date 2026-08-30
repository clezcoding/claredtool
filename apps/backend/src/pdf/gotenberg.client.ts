import {
  DEFAULT_GOTENBERG_URL,
  PDF_PAPER_A4,
  type PdfBytes,
} from "./pdf.contract";
import { EmptyHtmlError } from "./empty-html.error";

const CONVERT_PATH = "/forms/chromium/convert/html";

function basicAuthHeader(): string {
  const user = process.env.GOTENBERG_API_BASIC_AUTH_USERNAME;
  const password = process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD;
  if (!user || !password) {
    throw new Error(
      "GOTENBERG_API_BASIC_AUTH_USERNAME and GOTENBERG_API_BASIC_AUTH_PASSWORD are required",
    );
  }
  return `Basic ${Buffer.from(`${user}:${password}`, "utf8").toString("base64")}`;
}

function gotenbergOrigin(): string {
  const raw = process.env.GOTENBERG_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "test") {
      return DEFAULT_GOTENBERG_URL.replace(/\/$/, "");
    }
    throw new Error("GOTENBERG_URL is required");
  }
  return raw.replace(/\/$/, "");
}

export async function convertHtmlToPdf(html: string): Promise<PdfBytes> {
  if (!html.trim()) {
    throw new EmptyHtmlError();
  }
  const file = new File([html], "index.html", {
    type: "text/html;charset=utf-8",
  });
  const body = new FormData();
  body.set("files", file);
  body.set("paperWidth", PDF_PAPER_A4.paperWidth);
  body.set("paperHeight", PDF_PAPER_A4.paperHeight);
  const res = await fetch(`${gotenbergOrigin()}${CONVERT_PATH}`, {
    method: "POST",
    headers: { Authorization: basicAuthHeader() },
    body,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`Gotenberg HTTP ${res.status}`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (
    bytes.byteLength < 5 ||
    String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF"
  ) {
    throw new Error("Gotenberg response is not a PDF");
  }
  return { bytes, contentType: "application/pdf" };
}
