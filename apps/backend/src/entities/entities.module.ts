import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EntitiesController } from "./entities.controller";
import { EntitiesService } from "./entities.service";

@Module({
  controllers: [EntitiesController],
  providers: [EntitiesService, PrismaService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
