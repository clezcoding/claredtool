import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RuleSeedService } from "./rule-seed";
import { TaxController } from "./tax.controller";

@Module({
  controllers: [TaxController],
  providers: [RuleSeedService, PrismaService],
})
export class TaxModule {}
