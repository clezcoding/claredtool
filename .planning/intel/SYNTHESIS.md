# Synthesis

Ingest mode: new
Precedence: ADR > SPEC > PRD > DOC (no per-doc precedence overrides)

## Doc counts by type

- Total classified: 4
- ADR: 0
- SPEC: 3 (docs/clared-tax-engine-architecture.md, docs/clared-tax-rule-matrix.md, docs/clared-tax-rule-dsl-schema.json)
- PRD: 1 (docs/clared-app-prd.md) — orchestrator override from classifier SPEC/low to PRD/medium; dual-extracted
- DOC: 0
- UNKNOWN: 0

## Cycle detection

- Nodes: 4
- Edges: 3 (PRD → three SPECs)
- Cycles: 0
- Max depth: 1 (cap 50)

## Decisions locked

- Count: 0
- Source paths: none (no ADR-classified documents)

## Requirements extracted

- Count: 10
- IDs: REQ-desktop-client, REQ-self-hosted-backend, REQ-invoice-management, REQ-entity-customer-management, REQ-live-tax-evaluation, REQ-tax-engine-modularity, REQ-authentik-sso-rbac, REQ-offline-capability, REQ-pdf-generation, REQ-audit-and-monitoring
- File: .planning/intel/requirements.md

## Constraints

- Count: 21
- Type breakdown: api-contract 1, schema 7, nfr 9, protocol 4
- Sources: PRD stack/deployment/API (11) + tax-engine architecture (7) + VAT matrix (2) + Tax Rule JSON Schema (1)
- File: .planning/intel/constraints.md

## Context topics

- Count: 0
- File: .planning/intel/context.md (no DOC-classified sources)

## Conflicts

- Blockers: 0
- Competing-variants: 0
- Auto-resolved / INFO: 5
- Detail: .planning/INGEST-CONFLICTS.md

## Intel files

- .planning/intel/decisions.md
- .planning/intel/requirements.md
- .planning/intel/constraints.md
- .planning/intel/context.md
- .planning/intel/SYNTHESIS.md (this file)

STATUS: READY — safe to route
