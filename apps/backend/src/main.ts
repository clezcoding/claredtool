import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "openapi.json",
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
