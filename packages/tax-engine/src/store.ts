import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import type { TaxRule } from "./schema";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

let validateRule: ReturnType<typeof ajv.compile> | null = null;

function getValidator(): ReturnType<typeof ajv.compile> {
  if (validateRule) {
    return validateRule;
  }
  const schemaPath = join(__dirname, "schema", "clared-tax-rule-dsl-schema.json");
  const monorepoPath = join(__dirname, "..", "..", "docs", "clared-tax-rule-dsl-schema.json");
  let raw: string;
  try {
    raw = readFileSync(schemaPath, "utf8");
  } catch {
    raw = readFileSync(monorepoPath, "utf8");
  }
  validateRule = ajv.compile(JSON.parse(raw));
  return validateRule;
}

export function loadRules(rulesDir: string): TaxRule[] {
  const validate = getValidator();
  const files = readdirSync(rulesDir).filter((name) => name.endsWith(".json"));
  const rules: TaxRule[] = [];
  for (const file of files) {
    const parsed: unknown = JSON.parse(readFileSync(join(rulesDir, file), "utf8"));
    if (!validate(parsed)) {
      throw new Error(`Invalid rule file ${file}: ${JSON.stringify(validate.errors)}`);
    }
    rules.push(parsed as TaxRule);
  }
  return rules;
}
