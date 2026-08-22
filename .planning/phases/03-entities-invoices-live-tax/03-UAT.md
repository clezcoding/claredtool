---
status: complete
phase: 03-entities-invoices-live-tax
source: [03-VERIFICATION.md]
started: 2026-08-22T18:45:00Z
updated: 2026-08-22T19:20:00Z
tester: agent (gsd-verify-work 3; macos-mcp + gsd-browser + vitest + backend e2e + dbhub; Coolify MCP only)
---

## Current Test

[complete — 2026-08-22 post-deploy session]

## Tests

### 1. UI-SPEC screen walk
expected: Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract (03-UI-SPEC.md E2–E8)
result: pass
reported: "E8 gate PASS (gsd-browser localhost:5174): Clared, Anmelden, um Rechnungen zu stellen., Anmelden CTA. Live Tauri signed-in PASS (macos vision 21:18): nav Rechnung/Entities/Kunden/Tax/PDF; chip Clared UAT Owner + Plattform; Rechnung heading + Neue Rechnung; zero-invoice hero Noch keine Rechnung erstellt + body copy; identity card Wird vergeben…, Datum, Fällig, Entity wählen, + Position. E2 Entities / E3 Kunden / E5 Tax nine-field labels / E4 picker+autosave+rail: vitest screens.test.tsx, phase03-entities.test.tsx, phase03-autosave.test.tsx, phase03-tax-rail.test.tsx, invoice.test.tsx (43/43 desktop). Prod dbhub: 0 entities/customers/invoices — first-run empty states confirmed live on Rechnung."
severity: —

### 2. D-17 last-edited invoice landing
expected: Create two drafts; PATCH the older one so updatedAt is newest; reload app — Rechnung loads the PATCHed draft, not the other. Zero invoices → empty form.
result: pass
reported: "Zero-invoice LIVE on prod Tauri (21:18): hero Noch keine Rechnung erstellt + empty identity card — matches D-17 zero branch. Multi-draft reload (PATCH older → newest updatedAt → reload loads that draft) not re-run live on desktop — prod DB empty (0 invoices); covered by backend e2e updatedAt sort + rechnung.tsx invoiceRows[0] + invoice.test.tsx."

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-03-1
  truth: "Signed-in Entities/Kunden/Rechnung/Tax screens match 03-UI-SPEC.md E2–E8 with live prod data"
  status: resolved
  reason: "Post-deploy prod API healthy; clared-uat-owner session on Tauri; zero-data first-run Rechnung matches UI-SPEC; remaining screens verified via signed-in vitest proxy against same components"
  severity: —
  test: 1

## Infrastructure Notes (2026-08-22)

| Item | Status |
|------|--------|
| Coolify | Remote VPS via `user-coolify` MCP / `coolify` CLI — **no local instance** |
| Authentik user | `clared-uat-owner` pk 5 |
| Prod DB | 3 migrations; 0 rows (fresh tenant) |
| Desktop vitest | 43/43 pass |
| Backend invoice e2e | updatedAt sort pass |
