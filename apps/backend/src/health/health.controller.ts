import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { Public } from "../auth/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
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
    ]);
  }
}
