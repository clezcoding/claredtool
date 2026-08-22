---
gsd_state_version: 1.0
milestone: v1.0
current_phase: 3
current_phase_name: Entities, Invoices & Live Tax
status: planning
stopped_at: Phase 02 complete, ready to plan Phase 3
last_updated: "2026-08-22T11:57:48.990Z"
last_activity: 2026-08-22
last_activity_desc: Phase 02 complete, transitioned to Phase 3
state_head: ddeb28ec22a10260b2b7eb8a4d6450ef5dad4476
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 12
  completed_plans: 12
milestone_name: milestone
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-19)

**Core value:** Beautiful interactive invoice + live-tax + PDF loop on the desktop — create invoice, see live tax, get PDF — under 2 minutes.
**Current focus:** Phase 3 — Entities, Invoices & Live Tax

## Current Position

Phase: 3 — Entities, Invoices & Live Tax
Plan: Not started
Status: Ready to plan
Last activity: 2026-08-22 — Phase 02 complete, transitioned to Phase 3

Progress: [██░░░░░░░░] 25%

## Performance Metrics

**Velocity:**

- Total plans completed: 12
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | - | - |
| 02 | 7 | - | - |

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
| Phase 02-self-hosted-backend-authentik-sso P03 | 8 min | 2 tasks | 14 files |
| Phase 02-self-hosted-backend-authentik-sso P04 | 17 min | 3 tasks | 22 files |
| Phase 02-self-hosted-backend-authentik-sso P05 | 7 min | 3 tasks | 7 files |
| Phase 02-self-hosted-backend-authentik-sso P06 | 2 min | 2 tasks | 2 files |
| Phase 02-self-hosted-backend-authentik-sso P07 | 12 min | 2 tasks | 4 files |

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
- [Phase 02-self-hosted-backend-authentik-sso]: AppManifest::commands in build.rs so keychain IPC is ACL-denied on the login WebView (T-02-10) — Tauri allows all app commands from every window unless AppManifest lists them; login.json core:default alone would not block keychain.
- [Phase 02-self-hosted-backend-authentik-sso]: Login CSP via initialization_script meta because WebviewWindowBuilder has no CSP setter (A3) — on_navigation exists; no per-window CSP setter on this crate. Meta inject plus host allowlist.
- [Phase 02-self-hosted-backend-authentik-sso]: login-init.html loaded as include_str data URL so src-tauri HTML does not depend on Vite public/ — Plan places the spinner HTML in src-tauri; WebviewUrl::App would look in frontend dist.
- [Phase 02-self-hosted-backend-authentik-sso]: Chip/banner live in components/; open_login_window optional url for end_session; vitest fileParallelism false
- [Phase 02-self-hosted-backend-authentik-sso]: Keep dynamic import of openid-client; static ESM import breaks Jest CJS (AUTH_TEST_MODE never loads the package)
- [Phase 02-self-hosted-backend-authentik-sso]: Blueprint sets client_id clared and does not set client_secret (copy generated SECRET into env; prod only in Coolify)
- [Phase 02-self-hosted-backend-authentik-sso]: wget official compose.yml verbatim — postgresql service is Authentik's DB, no redis, no /etc/localtime
- [Phase 02-self-hosted-backend-authentik-sso]: Enable only webview-data-url on tauri; keep login_init_url() as data:text/html and WebviewUrl::External (no Vite public/ move, no asset-protocol fallback) — Plan 02-06: crate feature is sufficient; document location stays src-tauri include_str per D-16 / 02-03.
- [Phase 02-self-hosted-backend-authentik-sso]: Human Anmelden window check deferred to end-of-phase UAT (human_verify_mode); Task 2 is Vitest-only — Orchestrator: do not halt; live OS window is harvested into 02-UAT.md.
- [Phase 02-self-hosted-backend-authentik-sso]: Fix emit path to dist/main.js; do not paper over with a nested CMD (G-02-2) — prisma.config.ts at package root made tsc rootDir . and emit dist/src/main.js
- [Phase 02-self-hosted-backend-authentik-sso]: apt-get install curl so Coolify Dockerfile HTTP healthcheck can probe /health — node:22-bookworm-slim has neither curl nor wget; first deploy rolled back a running Nest
- [Phase 02-self-hosted-backend-authentik-sso]: Local Authentik GHCR 2026.8.0 denial stays environmental; compose.yml unchanged (G-02-5) — Plan prohibition: do not add GHCR credentials or compose tag fallback

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

Last session: 2026-08-22T04:30:52.483Z
Stopped at: Phase 02 complete, ready to plan Phase 3
Resume file: None
