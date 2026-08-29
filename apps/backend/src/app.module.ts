import { Module, ValidationPipe } from "@nestjs/common";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { TerminusModule } from "@nestjs/terminus";
import { LoggerModule } from "nestjs-pino";
import { AuthController } from "./auth/auth.controller";
import { AuthGuard } from "./auth/auth.guard";
import { PermissionsGuard } from "./auth/permissions.guard";
import { CustomersController } from "./customers/customers.controller";
import { CustomersModule } from "./customers/customers.module";
import { EntitiesController } from "./entities/entities.controller";
import { EntitiesModule } from "./entities/entities.module";
import { CatchAllController } from "./http/catch-all.controller";
import { DocsController } from "./http/docs.controller";
import { HealthController } from "./health/health.controller";
import { InvoicesController } from "./invoices/invoices.controller";
import { InvoicesModule } from "./invoices/invoices.module";
import { MeController } from "./me/me.controller";
import { PrismaService } from "./prisma/prisma.service";
import { KEY_VALUE_STORE, RedisService, createKeyValueStore } from "./redis/redis.service";
import { PdfModule } from "./pdf/pdf.module";
import { TaxController } from "./tax/tax.controller";
import { TaxModule } from "./tax/tax.module";
import { pinoBaseOptions } from "./telemetry/pino-options";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        ...pinoBaseOptions("clared-api"),
      },
    }),
    TerminusModule,
    EntitiesModule,
    CustomersModule,
    InvoicesModule,
    TaxModule,
    PdfModule,
  ],
  controllers: [
    HealthController,
    AuthController,
    MeController,
    DocsController,
    EntitiesController,
    CustomersController,
    InvoicesController,
    TaxController,
    CatchAllController,
  ],
  providers: [
    PrismaService,
    RedisService,
    { provide: KEY_VALUE_STORE, useFactory: createKeyValueStore },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },
  ],
})
export class AppModule {}
