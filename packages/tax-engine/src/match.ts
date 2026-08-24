import type { TaxRule, TaxRuleConditions, TransactionFacts } from "./schema";

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
]);

function matchesScalar(
  conditionValue: unknown,
  factValue: unknown,
): boolean {
  if (conditionValue === undefined) {
    return true;
  }
  if (Array.isArray(conditionValue)) {
    return conditionValue.includes(factValue);
  }
  return conditionValue === factValue;
}

function matchesConditions(
  conditions: TaxRuleConditions,
  facts: TransactionFacts,
): boolean {
  const fieldMap: Record<string, unknown> = {
    supplier_country: facts.supplier_country,
    customer_country: facts.customer_country,
    supplier_is_business: facts.supplier_is_business,
    customer_is_business: facts.customer_is_business,
    supplier_vat_registered: facts.supplier_vat_registered,
    customer_vat_registered: facts.customer_vat_registered,
    supply_type: facts.supply_type,
    channel: facts.channel,
  };

  for (const [key, conditionValue] of Object.entries(conditions)) {
    if (key === "intracomm_eu") {
      if (conditionValue === true) {
        const supplier = facts.supplier_country;
        const customer = facts.customer_country;
        if (
          !EU_COUNTRIES.has(supplier) ||
          !EU_COUNTRIES.has(customer) ||
          supplier === customer
        ) {
          return false;
        }
      }
      continue;
    }
    if (key === "effective_from" || key === "effective_to") {
      continue;
    }
    if (key === "threshold_amount" || key === "threshold_currency") {
      continue;
    }
    if (!(key in fieldMap)) {
      continue;
    }
    if (!matchesScalar(conditionValue, fieldMap[key])) {
      return false;
    }
  }
  return true;
}

export function matches(rule: TaxRule, facts: TransactionFacts): boolean {
  return matchesConditions(rule.conditions, facts);
}
