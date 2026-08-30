import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { EmptyHtmlError } from "./empty-html.error";
import { PDF_QUEUE, type HtmlInvoiceFacts } from "./pdf.contract";

@Injectable()
export class PdfService {
  constructor(@InjectQueue(PDF_QUEUE) private readonly queue: Queue) {}

  add(facts: HtmlInvoiceFacts) {
    if (typeof facts?.html !== "string" || !facts.html.trim()) {
      throw new EmptyHtmlError();
    }
    return this.queue.add(
      "html",
      { html: facts.html },
      {
        jobId: crypto.randomUUID(),
        removeOnComplete: { age: 86_400 },
        removeOnFail: { age: 604_800 },
      },
    );
  }
}
