import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PDF_QUEUE } from "./pdf.contract";
import { PdfService } from "./pdf.service";

export function bullRootOptions() {
  const prefix = "clared-bull";
  if (process.env.NODE_ENV === "test") {
    return {
      connection: { host: "127.0.0.1", port: 6379, lazyConnect: true },
      prefix,
    };
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is required");
  }
  return { connection: { url }, prefix };
}

@Module({
  imports: [
    BullModule.forRootAsync({ useFactory: bullRootOptions }),
    BullModule.registerQueue({ name: PDF_QUEUE }),
  ],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
