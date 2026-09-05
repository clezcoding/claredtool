import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HealthIndicatorResult, PrismaHealthIndicator } from "@nestjs/terminus";
import { Public } from "../auth/public.decorator";
import { gotenbergAuthHeader } from "../pdf/gotenberg.client";
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
      async (): Promise<HealthIndicatorResult> => {
        const raw = process.env.GOTENBERG_URL?.trim();
        if (!raw) {
          // Phase 5: worker queue depth deferred; Uptime Kuma covers external PDF path when GOTENBERG_URL is set in prod.
          return { gotenberg: { status: "up", message: "skipped (GOTENBERG_URL unset)" } };
        }
        const origin = raw.replace(/\/$/, "");
        const res = await fetch(`${origin}/health`, {
          headers: { Authorization: gotenbergAuthHeader() },
          signal: AbortSignal.timeout(2_000),
        });
        if (!res.ok) {
          throw new Error(`Gotenberg health HTTP ${res.status}`);
        }
        return { gotenberg: { status: "up" } };
      },
    ]);
  }
}
