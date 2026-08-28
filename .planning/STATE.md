---
gsd_state_version: 1.0
milestone: v1.0
current_phase: 04.2
current_phase_name: Desktop Platform Hardening
status: planning
stopped_at: Phase 04.2 context gathered
last_updated: "2026-08-28T02:57:04.342Z"
last_activity: 2026-08-28
last_activity_desc: Completed quick task 260828-5c8 — CI parallel jobs, path filters, rust-cache, vitest parallel
state_head: 096d29002463b1bd609eb0f6a9a79429ae96d551
progress:
  total_phases: 10
  completed_phases: 5
  total_plans: 31
  completed_plans: 31
milestone_name: milestone
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-19)

**Core value:** Beautiful interactive invoice + live-tax + PDF loop on the desktop — create invoice, see live tax, get PDF — under 2 minutes.
**Current focus:** Phase 04.2 — Desktop Platform Hardening

## Current Position

Status: planning
Phase: 04.2 — Desktop Platform Hardening (INSERTED)
Phase 04.1 merged: PR #39 (`30e331a`)
Plan: Not started
Phase 04 (Premium UI & Brand Redesign) — complete 2026-08-25
Phase 04.1 (Stitch→React 5-route) — complete 2026-08-28
Phase 04.2 (Desktop Platform Hardening) — **NEXT** discuss → plan → execute
Phase 04.3 (Infra & Prep for PDF/Offline/Audit) — after 04.2
Phase 05 (PDF, Audit & Offline Sync) — blocked on 04.3
Phase 05.1 (Stitch→React extended catalog) — after Phase 5
Decided: Option A — 4.1 = 5-route stitch-build before PDF; 4.2 = desktop hardening; 4.3 = infra prep; 5.1 = extended catalog after Phase 5; Crafted Minimal
Last activity: 2026-08-28 — Phase 04.1 merged PR #39; 04.2 scope enriched; 04.3 inserted before Phase 5

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**

- Total plans completed: 31
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | - | - |
| 02 | 7 | - | - |
| 03 | 6 | - | - |
| 04 | 6 | - | - |
| 06 | 0 | - | - |
| 04.1 | 7 | - | - |

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
| Phase 04-premium-ui-brand-redesign P01 | 9 min | 4 tasks | 12 files |
| Phase 04-premium-ui-brand-redesign P02 | 6 min | 3 tasks | 7 files |
| Phase 04-premium-ui-brand-redesign P03 | 9 | 3 tasks | 10 files |
| Phase 04 P04 | 4min | 3 tasks | 8 files |
| Phase 04-premium-ui-brand-redesign P05 | 3 | 3 tasks | 7 files |
| Phase 04-premium-ui-brand-redesign P06 | 6min | 3 tasks | 4 files |
| Phase 04.1-stitch-react-5-route-conversion P01 | 5min | 2 tasks | 12 files |
| Phase 04.1 P02 | 10min | 2 tasks | 12 files |
| Phase 04.1 P03 | 18 | 3 tasks | 13 files |
| Phase 04.1 P04 | 12min | 2 tasks | 14 files |
| Phase 04.1-stitch-react-5-route-conversion P05 | 11min | 2 tasks | 10 files |
| Phase 04.1-stitch-react-5-route-conversion P06 | 48 | 2 tasks | 11 files |
| Phase 04.1 P07 | 25min | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Locked: Tauri (not Electron); Coolify Postgres/Redis/Authentik/backend; tax library `evaluate(facts): decision` + TaxRule JSON Schema SSOT; HTTPS+OIDC
- Pending: NestJS/Express vs FastAPI vs Axum; integrated tax module vs later microservice; collision logic; Supabase not v1 default
- [Phase 04]: Premium UI Redesign (Crafted Minimal: Oatmeal, Charcoal, Pure White, Sage/Amber)
- [Phase 04]: i18n required from day 1 (German and English UI)
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
- [Phase 04]: Amber --destructive #C9A227 sampled from 03-rechnung-dark (A1) — D-02 grants hex discretion; sparse emphasis only
- [Phase 04]: Dark raised card #1C1C1A hairline #2A2A28 (A2) — Sampled from dark mockups for whisper separator
- [Phase 04]: Menu.default() plus Darstellung; core:menu:default granted — Keep macOS app menu; A4 ACL for JS setAsAppMenu
- [Phase 04-premium-ui-brand-redesign]: Did not rebuild mockup Von/Kunde cards, serif totals, or tax-rules editor — D-11 IA lock; class-only restyle — Plan locks IA; restyle is token classes on existing split canvas / dl / empty hero
- [Phase 04-premium-ui-brand-redesign]: Empty CTA Beispielrechnung anzeigen restored; click focuses form instead of SAMPLE_INVOICE — Phase 3 removed sample restore; UI-SPEC still requires the CTA copy
- [Phase 04-premium-ui-brand-redesign]: PdfPaper numerals may use tabular-nums; inline #fff/#111 stay (D-09) — Dark theme must not invert invoice paper content
- [Phase 04]: Class-only Entities/Kunden restyle; mockup table/search/tabs not built (D-11 IA lock)
- [Phase 04]: Session chip gained no Darstellung/theme item (D-07 / Phase 2 D-36)
- [Phase 04]: Login-gate hero GPT Image 2 after cost-check (7 credits); leftover 3 of 10 Starter credits
- [Phase 04]: splash.png copied into public/; splash.tsx stays wordmark+spinner (D-16 type-only)
- [Phase 04]: First-paint hex is Pale Oatmeal #F7F7F5 / Deep Charcoal #111110, not UA white
- [Phase 04]: Head IIFE injects html,body CSS then body.style when body exists
- [Phase 04]: PDF-01 OFFL-01 AUDT-01 remapped to Phase 5 Pending
- [Phase 04]: OS appearance sync reuses applyTheme('system') so inline D-02 hex and .dark stay aligned
- [Phase 04]: Hell/Dunkel ignore matchMedia because syncSystemAppearance returns unless currentPref() is system
- [Phase 04]: Empty CTA copy restored to UI-SPEC; startNewDraft and showRail = !showHero unchanged
- [Phase 04]: Login hero reuses 04-03 public PNG; no Higgsfield; canvas bg-background
- [Phase 04-06]: Canvas --background SSOT is Pale Oatmeal #F7F7F5 / Deep Charcoal #111110 across IIFE, PAINT_*, and both globals.css (G-04-1, G-04-2)
- [Phase ?]: Option A: Phase 4.1 stitch-build 5 routes before PDF; Phase 5.1 extended catalog after Phase 5
- [Phase 04.1]: Packages installed only after human typed packages verified (Task 1 blocking-human closed 2026-08-27)
- [Phase 04.1]: No @types/pngjs — pixel-diff.mjs is Node ESM; tsc include is src only
- [Phase 04.1]: gitignore scripts/ scoped to /scripts/ so apps/desktop/scripts/pixel-diff.mjs can be tracked
- [Phase 04.1]: stitch:validate wraps stitch-build validate.js at the resolved plugin cache path
- [Phase 04.1]: Five nav items only; Stitch catalog sidebar items stay out (D-11/D-13)
- [Phase 04.1]: R-01 360px was tax rail LAYOUT_TAX_RAIL_WIDTH; nav SSOT is 260px from 02-rechnung-light
- [Phase 04.1]: Entities ligature domain and PDF ligature picture_as_pdf are D-45 nearest matches
- [Phase 04.1]: Header Neue Rechnung stays startNewDraft(); Stitch 23 opens from Weitere Aktionen
- [Phase 04.1]: 29/40 overlays use Dialog so D-35/D-36 smoke covers all Rechnung modals
- [Phase 04.1]: Single registry-list-panel module; no forked List+Panel trees
- [Phase 04.1]: Create is Dialog overlay (24/26), not the inspector create panel; F-08 detail stays behind the modal
- [Phase 04.1]: Sage selected row uses bg-brand-soft/30 + 3px primary-container rail; CTA uses primary-container not Stitch #1f432d primary (BRAND-01 sage reserved)
- [Phase 04.1]: Bank IBAN/BIC render — until an API exists (D-14); no fake 12-entity volume (D-28)
- [Phase 04.1]: Five Stitch 06 cards including inactive Inland Ermäßigt 7%; DEMO_RULES German titles
- [Phase 04.1]: 47 not mounted as a page — expanded card from 06, edit overlay from 39
- [Phase 04.1]: Neu ordnen stays Bald (A5); Neue Regel opens Dialog 39
- [Phase 04.1]: Paper body stays SAMPLE_INVOICE preview (D-39); Stitch Acme/payment footer not copied
- [Phase 04.1]: EN/DE is Dokumentensprache on PdfPaper, not i18n.changeLanguage
- [Phase 04.1]: 15-export mounts below the 07 viewer on /pdf (D-12); NAV_ITEMS stays 5
- [Phase 04.1]: DATEV #00AA13 is --datev for the brand chip only; generate CTA uses primary-container
- [Phase 04.1]: Human 2026-08-28 phase6: transfer F-09 threshold-0 FAIL (02–07) to Phase 06. D-11 five-nav vs catalog mockups. Pixel gate residual-closed, not PASS. — Named residual D-09/D-27; Kaneo #70.
- [Phase 04.1]: Capture inner 1536x1024 requires fullscreen first; WKWebView native shot is 2x even-pixel CSS subsample. — Windowed availHeight ~1005 cannot fit inner 1536x1024.

### Pending Todos

None yet.

### Blockers/Concerns

- Collision logic unspecified (SPEC → PRD; PRD silent) — do not invent
- Backend stack still Pending — Phase 1 UI locked to React; Phase 2/3 implementation still needs backend pick

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260822-u6p | Räume das Projektverzeichniss auf. | 2026-08-22 | 7c30d5e | [260822-u6p-r-ume-das-projektverzeichniss-auf](./quick/260822-u6p-r-ume-das-projektverzeichniss-auf/) |
| 260828-5c8 | Optimize GitHub Actions CI: parallel jobs, path filters, rust-cache, vitest parallel | 2026-08-28 | 41ec7f6 | [260828-5c8-optimize-github-actions-ci-parallel-jobs](./quick/260828-5c8-optimize-github-actions-ci-parallel-jobs/) |

### Roadmap Evolution

- Phase 4.1 inserted after Phase 4: Stitch→React 5-route conversion (D-13 v1 nav; stitch-build; P1 backlog R-01–R-04) (URGENT)
- Phase 5.1 inserted after Phase 5: Stitch→React extended catalog (out-of-nav + P2 R-10–R-14) (URGENT)
- Phase 04.2 inserted after Phase 4: Desktop Platform Hardening — Tauri plugins, sentry, tauri-ui batteries, updater infra (URGENT)
- Phase 04.3 inserted after Phase 4: Infra & Prep for PDF/Offline/Audit — Gotenberg, Uptime Kuma, Beszel, OTel/Grafana, Pino, dialog/fs/sharekit/sql scaffold, BullMQ skeleton (URGENT)

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-28T02:57:04.150Z
Stopped at: Phase 04.2 context gathered
Resume file: .planning/phases/04.2-desktop-platform-hardening-tauri-plugins-updater-log-prevent/04.2-CONTEXT.md

## Rebuild Log

- timestamp: 2026-08-24T22:50:17.581Z
  kind: by-phase-table-reconciled
  section: ## Performance Metrics
  before: | Phase | Plans | Total | Avg/Plan | \n |-------|-------|-------|----------| \n | 01 | 5 | - | - | \n | 02 | 7 | - | - | \n | 4 | 6 | - | - |
  after: | Phase | Plans | Total | Avg/Plan | \n |-------|-------|-------|----------| \n | 01 | 5 | - | - | \n | 02 | 7 | - | - | \n | 03 | 6 | - | - | \n | 04 | 6 | - | - | \n | 06 | 0 | - | - |
  reason: phase dirs on disk are canonical; rows for missing phases dropped, missing phases added
