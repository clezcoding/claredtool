---
gsd_state_version: 1.0
milestone: v1.0
current_phase: 02
current_phase_name: Self-Hosted Backend & Authentik SSO
status: executing
stopped_at: Completed 02-02-PLAN.md
last_updated: "2026-08-22T01:46:41.123Z"
last_activity: 2026-08-22
last_activity_desc: Phase 02 execution started
state_head: 23ab9d8b916a6e3519b27c9e61a30db55b2d9083
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 10
  completed_plans: 7
milestone_name: milestone
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-19)

**Core value:** Beautiful interactive invoice + live-tax + PDF loop on the desktop — create invoice, see live tax, get PDF — under 2 minutes.
**Current focus:** Phase 02 — Self-Hosted Backend & Authentik SSO

## Current Position

Phase: 02 (Self-Hosted Backend & Authentik SSO) — EXECUTING
Plan: 3 of 5
Status: Ready to execute
Last activity: 2026-08-22 — Phase 02 execution started

Progress: [██░░░░░░░░] 25%

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 17 min | 3 tasks | 57 files |
| Phase 01 P02 | 8min | 3 tasks | 8 files |
| Phase 01-tauri-desktop-mockup-first-ui P03 | 14 | 3 tasks | 8 files |
| Phase 01-tauri-desktop-mockup-first-ui P04 | 6 | 2 tasks | 2 files |
| Phase 02-self-hosted-backend-authentik-sso P01 | 7 min | 2 tasks | 18 files |
| Phase 02-self-hosted-backend-authentik-sso P02 | 19 min | 3 tasks | 31 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Locked: Tauri (not Electron); Coolify Postgres/Redis/Authentik/backend; tax library `evaluate(facts): decision` + TaxRule JSON Schema SSOT; HTTPS+OIDC
- Pending: NestJS/Express vs FastAPI vs Axum; integrated tax module vs later microservice; collision logic; Supabase not v1 default
- [Phase 01]: React 19 + Vite 8 + Tauri 2 for the desktop client (Phase 1 UI stack lock)
- [Phase 01]: createHashRouter from react-router so sub-routes survive tauri://localhost
- [Phase 01]: Vite/Tauri bound to 5174 because 5173 was occupied by BILLIT Vite
- [Phase 01]: StagedTaxDecision uses canonical tax-engine fields (invoice_tax_rate, reverse_charge_flag, legal_reference) not RESEARCH aliases
- [Phase 01]: Empty-state return CTA is Beispielrechnung anzeigen (not in Copywriting Contract)
- [Phase 01]: Tax rail and Vorschau hide while empty state is showing (UI-SPEC empty E6)
- [Phase 01]: PdfPaper uses inline #fff/#111 so dark theme tokens cannot invert paper content
- [Phase 01]: Added a minimal @clared/ui Button so CreateDisabledButton matches the plan; Rechnung still uses native buttons
- [Phase 01]: Entity/Kunden detail is a panel below the list after click, not a permanent split inspector (D-29)
- [Phase 01]: /tax shows all nine StagedTaxDecision fields; the invoice rail still shows four
- [Phase 01]: Empty-state hero is GPT Image 2 16:9 2k (2688×1520), not the 1×1 placeholder
- [Phase 01]: CI uses explicit pnpm tauri build + upload-artifact, not tauri-action (no signing/secrets this phase)
- [Phase 01]: Matrix windows-latest + macos-latest with fail-fast false so a macOS miss cannot cancel the Windows evidence job
- [Phase 02]: Wave 0 stays RED; projectRbac /health /auth implementation is 02-02
- [Phase 02]: Desktop auth specs use dynamic import specifiers so Vite collection ignores missing LoginGate/chip/banner files
- [Phase 02]: prisma/@prisma/engines allowBuilds true so pnpm --filter backend install succeeds
- [Phase 02-self-hosted-backend-authentik-sso]: MemoryStore at auth/memory-store.ts to match Wave 0 e2e imports
- [Phase 02-self-hosted-backend-authentik-sso]: POST /auth/session HttpCode 200 (Nest POST default 201 would fail AUTH-01)
- [Phase 02-self-hosted-backend-authentik-sso]: Empty Prisma init migration; no User/Role models (D-22)
- [Phase 02-self-hosted-backend-authentik-sso]: SCHEMA_PUSH used compose Postgres; host :5432 was a different instance

### Pending Todos

None yet.

### Blockers/Concerns

- Collision logic unspecified (SPEC → PRD; PRD silent) — do not invent
- Backend stack still Pending — Phase 1 UI locked to React; Phase 2/3 implementation still needs backend pick

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-22T01:46:41.100Z
Stopped at: Completed 02-02-PLAN.md
Resume file: None
