import { join } from "node:path";
import { matches } from "./match";
import { loadRules } from "./store";
import {
  EvaluateError,
  type TaxDecision,
  type TaxRule,
  type TransactionFacts,
} from "./schema";

export { EvaluateError, loadRules, matches };
export type { TaxDecision, TaxRule, TransactionFacts };

const defaultRulesDir = join(__dirname, "..", "rules");

function decisionFrom(rule: TaxRule, facts: TransactionFacts): TaxDecision {
  const effect = rule.effect;
  let placeOfSupply = effect.place_of_supply_country;
  if (placeOfSupply === "{{customer_country}}") {
    placeOfSupply = facts.customer_country;
  }

  return {
    place_of_supply_country: placeOfSupply,
    tax_liability_party: effect.tax_liability_party,
    invoice_tax_rate: Number(effect.invoice_tax_rate ?? 0),
    invoice_tax_shown: effect.invoice_tax_shown ?? false,
    reverse_charge_flag: effect.reverse_charge_flag ?? false,
    legal_reference: effect.legal_reference ?? "",
    invoice_text_block_id: effect.invoice_text_block_id ?? "",
    applied_rule_id: rule.rule_id,
    applied_rule_version: rule.version,
    source_citation: rule.source_citation ?? [],
    audit_trace: [],
  };
}

export function evaluate(
  facts: TransactionFacts,
  rulesDir: string = defaultRulesDir,
): TaxDecision {
  const rules = loadRules(rulesDir);
  const matched = rules.filter((rule) => matches(rule, facts));
  if (matched.length !== 1) {
    throw new EvaluateError("no_unique_match");
  }
  return decisionFrom(matched[0], facts);
}
