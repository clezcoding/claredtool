import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaService } from "../prisma/prisma.service";

/** D-14: files are SSOT; upsert tax_rules and delete rows not in files. */
@Injectable()
export class RuleSeedService implements OnModuleInit {
  private readonly logger = new Logger(RuleSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const rulesDir = join(
      process.cwd(),
      "..",
      "..",
      "packages",
      "tax-engine",
      "rules",
    );
    let files: string[];
    try {
      files = readdirSync(rulesDir).filter((name) => name.endsWith(".json"));
    } catch {
      this.logger.warn(`Rule seed skipped — rules dir not found: ${rulesDir}`);
      return;
    }

    const seen = new Set<string>();
    for (const file of files) {
      const payload = JSON.parse(readFileSync(join(rulesDir, file), "utf8")) as {
        rule_id: string;
        version: string;
      };
      const key = `${payload.rule_id}:${payload.version}`;
      seen.add(key);
      await this.prisma.taxRule.upsert({
        where: {
          ruleId_version: {
            ruleId: payload.rule_id,
            version: payload.version,
          },
        },
        create: {
          ruleId: payload.rule_id,
          version: payload.version,
          payload: JSON.parse(readFileSync(join(rulesDir, file), "utf8")),
        },
        update: {
          payload: JSON.parse(readFileSync(join(rulesDir, file), "utf8")),
        },
      });
    }

    const existing = await this.prisma.taxRule.findMany();
    for (const row of existing) {
      const key = `${row.ruleId}:${row.version}`;
      if (!seen.has(key)) {
        await this.prisma.taxRule.delete({ where: { id: row.id } });
      }
    }
  }
}
