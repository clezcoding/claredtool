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
  const raw = process.env.GOTENBERG_URL ?? DEFAULT_GOTENBERG_URL;
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
  });
  if (!res.ok) {
    throw new Error(`Gotenberg HTTP ${res.status}`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { bytes, contentType: "application/pdf" };
}
