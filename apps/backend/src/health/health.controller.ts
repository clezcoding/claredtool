import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HealthIndicatorResult, PrismaHealthIndicator } from "@nestjs/terminus";
import { Public } from "../auth/public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  getHealth() {
    return { status: "ok" };
  }

  @Public()
  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("postgres", this.prisma, { timeout: 400 }),
      async (): Promise<HealthIndicatorResult> => {
        await this.redis.ping();
        return { redis: { status: "up" } };
      },
    ]);
  }
}
