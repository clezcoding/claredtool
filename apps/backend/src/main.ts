import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { setOpenApiDocument } from "./http/docs.controller";
import { initOtel } from "./telemetry/otel";

async function bootstrap() {
  initOtel();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  const origins = process.env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!origins?.length) {
    throw new Error("CORS_ORIGINS is required");
  }
  app.enableCors({ origin: origins });
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Clared")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build(),
  );
  setOpenApiDocument(document);
  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "openapi.json",
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
