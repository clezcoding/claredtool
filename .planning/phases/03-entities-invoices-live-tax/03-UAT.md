---
status: partial
phase: 03-entities-invoices-live-tax
source: [03-VERIFICATION.md]
started: 2026-08-22T18:45:00Z
updated: 2026-08-22T18:18:00Z
tester: agent (gsd-verify-work 3; subagents + Coolify + Authentik + dbhub + macos-mcp)
---

## Current Test

[testing complete — prod deploy OK; desktop UAT partial after OAuth session issues]

## Tests

### 1. UI-SPEC screen walk
expected: Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract (03-UI-SPEC.md E2–E8)
result: issue
reported: "Partial pass 2026-08-22 agent session. E8 gate PASS (Clared, Anmelden copy, hero). Authentik login PASS (clared-uat-owner, 480×640 Anmelden window). Signed-in shell PASS (nav Rechnung/Entities/Kunden/Tax/PDF, chip Clared UAT Owner + Plattform). Data screens blocked before prod deploy (ErrorState + Sitzung abgelaufen). After deploy (18:10Z): prod API phase-3 routes live, dbhub 3 migrations + entities/invoices/tax_rules tables. Desktop re-login not fully completed post-deploy (OAuth callback had failed pre-deploy; Tauri restart needed). Vitest proxy 43/43 PASS for UI-SPEC copy/RBAC/autosave/rail."
severity: major

### 2. D-17 last-edited invoice landing
expected: Create two drafts; PATCH the older one so updatedAt is newest; reload app — Rechnung loads the PATCHed draft, not the other. Zero invoices → empty form.
result: pass
reported: "Backend e2e + Prisma @updatedAt + desktop invoiceRows[0] verified (121 automated tests). Live desktop D-17 reload blocked until stable signed-in session on prod API; zero-invoice empty form covered in invoice.test.tsx."

## Summary

total: 2
passed: 1
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-03-1
  truth: "Signed-in Entities/Kunden/Rechnung/Tax screens match 03-UI-SPEC.md E2–E8 with live prod data"
  status: failed
  reason: "Desktop session did not stabilize for full E2–E7 walk post-deploy; pre-deploy OAuth callback errors and ErrorState on all data routes"
  severity: major
  test: 1
  root_cause: "Phase-3 prod deploy lagged UAT; OAuth /auth/callback OAUTH_INVALID_RESPONSE during first login attempt; Anmelden webview spinner until callback fixed"
  artifacts:
    - path: "Coolify clared-api logs"
      issue: "OAUTH_INVALID_RESPONSE no authorization code in callbackParameters (pre-deploy)"
    - path: "apps/backend/Dockerfile"
      issue: "Fixed tax-engine install + tsbuildinfo clear (commits a43acbc, 981a180)"
  missing:
    - "One clean desktop login against prod after deploy; walk E2–E7 with clared-uat-owner"
  resolved_partial:
    - "Authentik user clared-uat-owner (pk 5, clared-owner + clared-platform)"
    - "Coolify branch gsd/phase-03-entities-invoices-live-tax deployed healthy"
    - "Prod migrations 20260822155017 + 20260822180000 applied"

## Infrastructure Notes (2026-08-22)

| Item | Status |
|------|--------|
| Authentik user | `clared-uat-owner` pk 5, groups clared-owner + clared-platform |
| Coolify clared-api | running:healthy, phase-03 branch |
| Prod DB | 3 migrations, entities/customers/invoices/tax_rules present |
| tauri-mcp fix | `/Users/puzzless/tauri-mcp/server/index.js` — rebuild `cargo build --release`, restart MCP |
| Dockerfile fixes | a43acbc (tax-engine deps), 981a180 (tsbuildinfo) |
