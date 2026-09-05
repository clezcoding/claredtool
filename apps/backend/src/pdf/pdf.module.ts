import { Module } from "@nestjs/common";
import { InvoicePdfService } from "./invoice-pdf.service";

/** Engine cutover skeleton: service exported for later HTTP + RBAC (pdf.generate). */
@Module({
  providers: [InvoicePdfService],
  exports: [InvoicePdfService],
})
export class PdfModule {}
