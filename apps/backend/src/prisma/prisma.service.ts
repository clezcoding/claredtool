import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    super({
      adapter: new PrismaPg({
        connectionString,
        connectionTimeoutMillis: 400,
        idleTimeoutMillis: 200,
        max: 10,
        allowExitOnIdle: true,
      }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.race([
      this.$disconnect(),
      new Promise<void>((resolve) => setTimeout(resolve, 500)),
    ]);
  }
}
