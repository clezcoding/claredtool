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
  @Get("build")
  getBuild() {
    const sha = process.env.GIT_SHA?.trim() || "unknown";
    return { status: "ok", sha };
  }

  @Public()
  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("postgres", this.prisma, { timeout: 400 }),
      async (): Promise<HealthIndicatorResult> => {
        const timeoutMs = 400;
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            this.redis.ping(),
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () => reject(new Error("Redis ping timeout")),
                timeoutMs,
              );
            }),
          ]);
        } finally {
          if (timer !== undefined) {
            clearTimeout(timer);
          }
        }
        return { redis: { status: "up" } };
      },
      async (): Promise<HealthIndicatorResult> => {
        const sha = process.env.GIT_SHA?.trim() || "unknown";
        return { build: { status: "up", sha } };
      },
    ]);
  }
}
