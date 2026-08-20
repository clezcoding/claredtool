## Conflict Detection Report

### BLOCKERS (0)

None.

### WARNINGS (0)

None.

### INFO (5)

[INFO] Classifier type override on clared-app-prd.md
  Found: source docs/clared-app-prd.md classified SPEC (low) by classifier; orchestrator corrected to PRD (medium) because H1+filename are PRD (notes on source .planning/intel/classifications/clared-app-prd-1d76a226.json)
  Note: Dual extraction applied — product/feature requirements written to requirements.md; stack/deployment/API architecture written to constraints.md. Architecture not dropped because type is PRD.
  source: docs/clared-app-prd.md

[INFO] Cross-ref graph acyclic
  Found: docs/clared-app-prd.md cross_refs clared-tax-rule-matrix.md, clared-tax-rule-dsl-schema.json, clared-tax-engine-architecture.md; those three SPECs have empty cross_refs
  Note: Directed graph has 4 nodes, max depth 1, no cycles, under traversal cap 50. Full ingest set synthesized.
  source: docs/clared-app-prd.md, docs/clared-tax-engine-architecture.md, docs/clared-tax-rule-matrix.md, docs/clared-tax-rule-dsl-schema.json

[INFO] Collision logic absent in PRD
  Found: docs/clared-tax-engine-architecture.md ExecutionEngine step 4 states "Kollisionslogik wird explizit im PRD beschrieben"
  Note: docs/clared-app-prd.md is silent on rule-collision / priority-tie behavior. Field marked absent in intel; not fabricated. No contradiction to auto-resolve — SPEC does not assert a collision algorithm, only a documentation location that is empty.
  source: docs/clared-tax-engine-architecture.md, docs/clared-app-prd.md

[INFO] Unlocked stack alternatives in single PRD
  Found: docs/clared-app-prd.md enumerates Tauri or Electron; React/TypeScript or Vue/TypeScript; Node.js NestJS/Express or FastAPI or Rust Axum (recommended: Node.js NestJS or Express); tax-engine integrated module or later microservice; custom backend or Supabase self-hosted BaaS
  Note: Single PRD states alternatives, not competing PRDs. Not competing-variants. No ADR lock. Downstream roadmapper must choose or keep as open decisions. Recommended path recorded: Node.js NestJS/Express; tax-engine Variante 1 (integriert) for start.
  source: docs/clared-app-prd.md

[INFO] No ADR locked decisions
  Found: ingest set has 0 ADR-classified documents; all four docs have locked: false
  Note: MODE new; EXISTING_CONTEXT empty. No LOCKED-vs-LOCKED check fired. No merge-mode CONTEXT.md locked-decision check. SPEC JSON-Schema as TaxRule SSOT (docs/clared-tax-engine-architecture.md) is compatible with docs/clared-tax-rule-dsl-schema.json. PRD tax_rules table optional additionally to file-DSL is compatible with SPEC RuleStore SQL-JSON or YAML/JSON files.
  source: docs/clared-tax-engine-architecture.md, docs/clared-tax-rule-dsl-schema.json, docs/clared-app-prd.md
