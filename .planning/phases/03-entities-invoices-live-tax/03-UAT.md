---
status: partial
phase: 03-entities-invoices-live-tax
source: [03-VERIFICATION.md]
started: 2026-08-22T18:45:00Z
updated: 2026-08-22T17:38:00Z
tester: agent (gsd-verify-work 3; Coolify + Authentik + dbhub + macos-mcp + tauri dev)
---

## Current Test

[testing complete — 1 blocked prerequisite, 1 pass with API evidence]

## Tests

### 1. UI-SPEC screen walk
expected: Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract (03-UI-SPEC.md E2–E8)
result: blocked
blocked_by: third-party
reason: "Signed-in walk (E2–E7) requires Authentik login. Desktop on gate (E8). Only Authentik user is akadmin@clared.local (clared-platform, not clared-owner). No MFA/password available to agent. Gate verified live via macOS: title Clared, copy „Anmelden, um Rechnungen zu stellen.“, login-gate-hero, Anmelden CTA, no sidebar. Vitest proxy 43/43 pass (screens, phase03-entities, invoice, autosave, tax-rail). tauri-mcp launch_app broken (unrecognized subcommand). Prod API on phase-02 branch; Coolify Postgres has only init migration — phase-3 tables absent in prod dbhub."

### 2. D-17 last-edited invoice landing
expected: Create two drafts; PATCH the older one so updatedAt is newest; reload app — Rechnung loads the PATCHed draft, not the other. Zero invoices → empty form.
result: pass
reported: "Backend e2e invoices.e2e-spec.ts: GET /api/invoices sorted updatedAt desc (newer draft index < older). Prisma Invoice.updatedAt @updatedAt on PATCH. Desktop rechnung.tsx loadDrafts applies invoiceRows[0] after GET (server order). Zero-invoice empty form covered in invoice.test.tsx + loadDrafts branch. Live desktop reload after PATCH not executed (same auth blocker as test 1). Local OrbStack DB: 36 entities, 14 invoices, 23 tax_rules. All automated suites green: tax-engine 25, backend unit 21, backend e2e 32, desktop 43."

## Summary

total: 2
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 1

## Gaps

- gap_id: G-03-1
  truth: "Signed-in Entities/Kunden/Rechnung/Tax screens match 03-UI-SPEC.md E2–E8"
  status: failed
  reason: "Agent blocked: no clared-owner Authentik login; prod stack not deployed phase 3; cannot open signed-in desktop session"
  severity: major
  test: 1
  root_cause: "Authentik has only akadmin (clared-platform). No test owner user. Tauri dev points VITE_BACKEND_URL=https://clared-api.puzzlessdev.online (phase-02 deploy). Coolify Postgres (dbhub) missing phase-3 migrations/tables."
  artifacts:
    - path: "Coolify clared-api"
      issue: "git_branch gsd/phase-02-self-hosted-backend-authentik-sso"
    - path: "dbhub _prisma_migrations"
      issue: "only 20260822014200_init; no entities/invoices tables in prod"
    - path: "user-authentik authentik_users_list"
      issue: "single user akadmin; clared-owner group has zero members"
  missing:
    - "Authentik user in clared-owner with known credentials (or MFA handoff)"
    - "Deploy phase 3 to Coolify (branch + migrations + redeploy clared-api)"
    - "Re-run signed-in UI walk after login"

## Infrastructure Notes (agent session 2026-08-22)

| Check | Result |
|-------|--------|
| Coolify clared-api | running:healthy, https://clared-api.puzzlessdev.online |
| Coolify git branch | gsd/phase-02-self-hosted-backend-authentik-sso |
| dbhub prod tables | _prisma_migrations only (phase-2 schema) |
| Authentik app clared | OAuth2 provider pk 3, launch clared-api callback |
| Local OrbStack Postgres | phase-3 tables + 36 entities / 14 invoices / 23 rules |
| Tauri dev | VITE_BACKEND_URL=prod; gate screen visible |
| tauri-mcp | launch_app error: unrecognized subcommand 'tool' |
| Automated tests | 121 total pass (25+21+32+43) |
