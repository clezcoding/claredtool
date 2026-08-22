---
status: complete
phase: 03-entities-invoices-live-tax
source: [03-VERIFICATION.md]
started: 2026-08-22T18:45:00Z
updated: 2026-08-22T19:26:00Z
tester: agent (gsd-verify-work 3; macos-mcp + gsd-browser + chrome-devtools OAuth + vitest + prod API + dbhub; Coolify MCP only)
---

## Current Test

[complete — 2026-08-22 post-deploy session; D-17 multi-draft live verified]

## Tests

### 1. UI-SPEC screen walk
expected: Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract (03-UI-SPEC.md E2–E8)
result: pass
reported: "E8 gate PASS (gsd-browser localhost:5174 pre-session): Clared, Anmelden, um Rechnungen zu stellen., Anmelden CTA. Live Tauri signed-in PASS: nav Rechnung/Entities/Kunden/Tax/PDF; chip Clared UAT Owner + Plattform. Zero-invoice first-run (21:18 macos vision): Noch keine Rechnung erstellt, Wird vergeben…, Entity wählen, + Position. Populated Rechnung (21:23 keychain session + prod data): picker RE-2026-001, invoice id f137b034-6c8e-49c9-8ace-af6c614c870d. E2 Entities / E3 Kunden / E5 Tax nine-field labels / E4 picker+autosave+rail: vitest screens.test.tsx, phase03-entities.test.tsx, phase03-autosave.test.tsx, phase03-tax-rail.test.tsx, invoice.test.tsx (43/43). Prod API: entity 37eb4827-b04d-4067-98c4-f91ec4c5a6b2 UAT Seller GmbH; customer 94d0a1c8-aa73-4e9a-9a15-f85d2fd2e25b UAT Kunde; 2 tax rules seeded."
severity: —

### 2. D-17 last-edited invoice landing
expected: Create two drafts; PATCH the older one so updatedAt is newest; reload app — Rechnung loads the PATCHed draft, not the other. Zero invoices → empty form.
result: pass
reported: "LIVE prod API + Tauri reload (21:23): created drafts RE-2026-001 id f137b034-6c8e-49c9-8ace-af6c614c870d (older) and RE-2026-002 id 35f4a909-17df-4c63-b17c-41b2d52112da (newer); PATCH older with date+items → updatedAt 2026-08-22T19:23:09.792Z, bezeichnung D17 winner; GET /api/invoices lists RE-2026-001 first. After keychain session inject + Tauri restart, vite log shows ComboboxInput title/placeholder RE-2026-001 and value id f137b034… — not RE-2026-002. Zero-invoice branch: live hero Noch keine Rechnung erstellt (pre-seed). Note: items-only PATCH did not bump updatedAt until invoice date field included (Prisma @updatedAt on parent row only)."
severity: —

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
  reason: "Post-deploy prod API healthy; clared-uat-owner session on Tauri; Rechnung populated + zero states verified live; E2–E7 component contract via 43/43 vitest against same routes"
  severity: —
  test: 1

## Infrastructure Notes (2026-08-22)

| Item | Status |
|------|--------|
| Coolify | clared-api running:healthy, branch gsd/phase-03-entities-invoices-live-tax (`user-coolify` MCP) |
| Authentik user | `clared-uat-owner` pk 5, groups clared-owner + clared-platform |
| Prod DB | 3 migrations; UAT seed: 1 entity, 1 customer, 2 draft invoices |
| Session token (UAT) | Redeemed from OAuth ticket; me primaryRole platform |
| Desktop vitest | 43/43 pass |
| D-17 API ids | older f137b034-6c8e-49c9-8ace-af6c614c870d RE-2026-001; newer 35f4a909-17df-4c63-b17c-41b2d52112da RE-2026-002 |
