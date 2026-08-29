import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import pino from "pino";
import { initOtel } from "./telemetry/otel";
import { pinoBaseOptions } from "./telemetry/pino-options";
import { WorkerModule } from "./worker.module";

async function bootstrap() {
  initOtel({ serviceName: "clared-worker" });
  const log = pino(pinoBaseOptions("clared-worker"));
  log.info("Worker gestartet");
  const app = await NestFactory.createApplicationContext(WorkerModule);
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
