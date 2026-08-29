import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { EmptyHtmlError } from "./empty-html.error";
import { convertHtmlToPdf } from "./gotenberg.client";
import { PDF_QUEUE, type HtmlInvoiceFacts } from "./pdf.contract";

@Processor(PDF_QUEUE, { lockDuration: 45_000 })
export class PdfProcessor extends WorkerHost {
  async process(job: Job<HtmlInvoiceFacts>) {
    if (typeof job.data?.html !== "string" || !job.data.html.trim()) {
      throw new EmptyHtmlError();
    }
    const pdf = await convertHtmlToPdf(job.data.html);
    return {
      contentType: "application/pdf" as const,
      byteLength: pdf.bytes.byteLength,
    };
  }
}
