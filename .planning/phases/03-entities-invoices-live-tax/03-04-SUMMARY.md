---
phase: 03-entities-invoices-live-tax
plan: 04
subsystem: api
tags: [tax-engine, ajv, jest, matrix, TAX-02, generator]

requires:
  - phase: 03-entities-invoices-live-tax
    plan: 02
    provides: evaluate + EU_INTRACOMM_B2B_SERVICE tracer rule and evaluate.spec scaffold
provides:
  - 23 disjoint TaxRule JSON files from generate-rules.mjs exemplar table
  - Green evaluate.spec.ts (23 matrix fixtures + 0-match + 2-match)
  - CI runs pnpm --filter @clared/tax-engine test
affects: [03-05, 03-06, backend rule-seed on next boot]

actuals:
  tokens: 52000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "generate-rules.mjs emits disjoint fixture tuples; asserts no tuple collision"
    - "Exact country equality conditions per exemplar row (not runtime unions)"
    - "match.ts ignores priority; 2-match temp-dir proves no_unique_match (D-13)"

key-files:
  created:
    - packages/tax-engine/scripts/generate-rules.mjs
    - packages/tax-engine/rules/*.json (22 new + 1 regenerated)
  modified:
    - packages/tax-engine/src/evaluate.spec.ts
    - .github/workflows/ci.yml

key-decisions:
  - "Generator uses exact AT/DE/JP/US/AE/IS exemplar countries per plan table — not EU member arrays"
  - "invoice_tax_shown set per matrix row (false when reverse_charge unambiguous)"
  - "0-match fixture IS/IS B2C goods; 2-match via mkdtemp duplicate JSON pair"

patterns-established:
  - "Regenerate rules: node packages/tax-engine/scripts/generate-rules.mjs"
  - "MATRIX_FIXTURES literals in evaluate.spec — expectations not derived from matches()"

requirements-completed: [TAX-02]

coverage:
  - id: D1
    description: "23 matrix rule classes each have JSON file and passing evaluate fixture"
    requirement: TAX-02
    verification:
      - kind: unit
        ref: packages/tax-engine/src/evaluate.spec.ts#returns applied_rule_id
        status: pass
    human_judgment: false
  - id: D2
    description: "Exactly 23 rule JSON files; no CH/GB classes"
    requirement: TAX-02
    verification:
      - kind: other
        ref: "node packages/tax-engine/scripts/generate-rules.mjs && ls rules/*.json | wc -l"
        status: pass
    human_judgment: false
  - id: D3
    description: "evaluate throws EvaluateError no_unique_match on 0 and 2 matches"
    requirement: TAX-02
    verification:
      - kind: unit
        ref: packages/tax-engine/src/evaluate.spec.ts#throws when zero rules match
        status: pass
    human_judgment: false
  - id: D4
    description: "CI runs @clared/tax-engine test suite"
    requirement: TAX-02
    verification:
      - kind: other
        ref: ".github/workflows/ci.yml pnpm --filter @clared/tax-engine test"
        status: pass
    human_judgment: true
    rationale: "CI step added but full GitHub Actions run not executed in this plan"

duration: 5min
completed: 2026-08-22
status: complete
---

# Phase 3 Plan 04: Matrix Rule JSON + Tests Summary

**23 disjoint TaxRule JSON files generated from one exemplar table, with green evaluate.spec covering all matrix classes plus 0/2-match errors and CI**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-22T15:53:00Z
- **Completed:** 2026-08-22T15:58:00Z
- **Tasks:** 2
- **Files modified:** 26

## Accomplishments

- `generate-rules.mjs` emits all 23 matrix classes with disjoint `(supplier, customer, supply_type, customer_is_business)` tuples
- Each JSON validates against `docs/clared-tax-rule-dsl-schema.json`; `rule_id` equals filename stem
- `evaluate.spec.ts` has one test per matrix id with literal TaxDecision expectations plus IS/IS 0-match and temp-dir 2-match throws
- CI workflow runs `pnpm --filter @clared/tax-engine test` after backend unit tests

## Task Commits

1. **Task 1: Generate 23 TaxRule JSON files** - `4f9d247` (feat)
2. **Task 2: Green evaluate.spec 23 classes + throws + CI** - `b6273a2` (test)

## Files Created/Modified

- `packages/tax-engine/scripts/generate-rules.mjs` - exemplar table SSOT + disjointness guard
- `packages/tax-engine/rules/*.json` - 23 Ajv-valid TaxRule files
- `packages/tax-engine/src/evaluate.spec.ts` - 23 + 0 + 2 match-count tests
- `.github/workflows/ci.yml` - tax-engine test step

## Decisions Made

- Exact country conditions per exemplar row instead of EU-wide arrays (keeps disjointness without priority)
- Regenerated `EU_INTRACOMM_B2B_SERVICE.json` equivalent to tracer (AT/DE B2B service, rate 0, reverse charge)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None

## Next Phase Readiness

- Backend RuleSeed on next boot loads all 23 JSON files into `tax_rules` (D-14)
- 03-05/03-06 can rely on full matrix coverage for live tax paths beyond the tracer

## Self-Check: PASSED

- FOUND: packages/tax-engine/scripts/generate-rules.mjs
- FOUND: packages/tax-engine/rules/EU_DOMESTIC_B2B_SERVICE.json
- FOUND: packages/tax-engine/src/evaluate.spec.ts
- FOUND: commit 4f9d247
- FOUND: commit b6273a2
- FOUND: 23 rule JSON files (no CH/GB)

---
*Phase: 03-entities-invoices-live-tax*
*Completed: 2026-08-22*
