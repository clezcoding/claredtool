import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { initOtel } from "./telemetry/otel";
import { WorkerModule } from "./worker.module";

async function bootstrap() {
  initOtel({ serviceName: "clared-worker" });
  await NestFactory.createApplicationContext(WorkerModule);
}
bootstrap();
