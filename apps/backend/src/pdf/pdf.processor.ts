import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job, UnrecoverableError } from "bullmq";
import { convertHtmlToPdf } from "./gotenberg.client";
import { PDF_QUEUE, type HtmlInvoiceFacts } from "./pdf.contract";

@Processor(PDF_QUEUE, { lockDuration: 45_000 })
export class PdfProcessor extends WorkerHost {
  async process(job: Job<HtmlInvoiceFacts>) {
    if (typeof job.data?.html !== "string" || !job.data.html.trim()) {
      throw new UnrecoverableError("html must be non-empty");
    }
    const pdf = await convertHtmlToPdf(job.data.html);
    return {
      contentType: "application/pdf" as const,
      byteLength: pdf.bytes.byteLength,
    };
  }
}
