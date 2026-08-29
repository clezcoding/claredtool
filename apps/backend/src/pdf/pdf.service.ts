import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { PDF_QUEUE, type HtmlInvoiceFacts } from "./pdf.contract";

@Injectable()
export class PdfService {
  constructor(@InjectQueue(PDF_QUEUE) private readonly queue: Queue) {}

  add(facts: HtmlInvoiceFacts) {
    return this.queue.add("html", facts, { jobId: crypto.randomUUID() });
  }
}
