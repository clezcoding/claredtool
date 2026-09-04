import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import pino from "pino";
import { initOtel } from "./telemetry/otel";
import { pinoBaseOptions } from "./telemetry/pino-options";
import { WorkerModule } from "./worker.module";
import { listenWorkerHealth } from "./worker-health";

async function bootstrap() {
  initOtel({ serviceName: "clared-worker" });
  const log = pino(pinoBaseOptions("clared-worker"));
  log.info("Worker gestartet");
  const app = await NestFactory.createApplicationContext(WorkerModule);
  const health = listenWorkerHealth(Number(process.env.PORT) || 3000);
  const shutdown = async (signal: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        health.close((err) => (err ? reject(err) : resolve()));
      });
      await app.close();
      process.exit(0);
    } catch (err) {
      console.error(`${signal} shutdown failed`, err);
      process.exit(1);
    }
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
