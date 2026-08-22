import { Module, ValidationPipe } from "@nestjs/common";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { TerminusModule } from "@nestjs/terminus";
import { AuthController } from "./auth/auth.controller";
import { AuthGuard } from "./auth/auth.guard";
import { CatchAllController } from "./http/catch-all.controller";
import { DocsController } from "./http/docs.controller";
import { HealthController } from "./health/health.controller";
import { MeController } from "./me/me.controller";
import { PrismaService } from "./prisma/prisma.service";
import { KEY_VALUE_STORE, RedisService, createKeyValueStore } from "./redis/redis.service";

@Module({
  imports: [TerminusModule],
  controllers: [
    HealthController,
    AuthController,
    MeController,
    DocsController,
    CatchAllController,
  ],
  providers: [
    PrismaService,
    RedisService,
    { provide: KEY_VALUE_STORE, useFactory: createKeyValueStore },
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },
  ],
})
export class AppModule {}
