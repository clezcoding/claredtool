import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { convertHtmlToPdf } from "./gotenberg.client";
import { PDF_QUEUE, type HtmlInvoiceFacts } from "./pdf.contract";

@Processor(PDF_QUEUE)
export class PdfProcessor extends WorkerHost {
  async process(job: Job<HtmlInvoiceFacts>) {
    const pdf = await convertHtmlToPdf(job.data.html);
    return {
      contentType: "application/pdf" as const,
      byteLength: pdf.bytes.byteLength,
    };
  }
}
