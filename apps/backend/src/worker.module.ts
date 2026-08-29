import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PDF_QUEUE } from "./pdf/pdf.contract";
import { PdfProcessor } from "./pdf/pdf.processor";
import { bullRootOptions } from "./pdf/pdf.module";

@Module({
  imports: [
    BullModule.forRootAsync({ useFactory: bullRootOptions }),
    BullModule.registerQueue({ name: PDF_QUEUE }),
  ],
  controllers: [],
  providers: [PdfProcessor],
})
export class WorkerModule {}
