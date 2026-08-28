# Roadmap: Clared

## Overview

Clared ships as a stunning Tauri desktop app whose core loop is create invoice → see live tax → get PDF in under 2 minutes. It is **paid subscription SaaS**: backend, Postgres, Redis, and Authentik run on the **founder's Coolify**, not on the customer's machine, not as open source, not for free. Phase 1 puts a real macOS/Windows window on screen with interactive mockups before any feature UI is implemented. Phase 2 connects that shell to the vendor Coolify API and Authentik SSO. Phase 3 is the product: entities, invoices, and a modular tax engine driving live preview. Phase 4 is a full premium redesign (Crafted Minimal) — brand tokens, theme, motion. Phase 4.1 converts approved Google Stitch HTML for the 5 v1 routes into Tauri TSX/React via stitch-build. Phase 4.2 hardens the desktop platform (Tauri plugins, Sentry, updater). Phase 4.3 deploys PDF/audit/offline prep infra (Gotenberg, monitoring, OTel, desktop SQL/dialog/fs). Phase 5 closes the loop with PDF, tax-decision audit, and offline sync. Phase 5.1 converts the remaining Stitch catalog. Phase 6 closes 1:1 fidelity on the 5 routes. Stripe/seats (`SAAS-01`) stay v2.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Tauri Desktop & Mockup-First UI** - Launch Clared in a Tauri window; invoice+tax+PDF mockups exist before implementation (completed 2026-08-20)
- [x] **Phase 2: Self-Hosted Backend & Authentik SSO** - Sign in via Authentik; desktop talks HTTPS+OIDC to vendor Coolify (founder's cluster) (completed 2026-08-22)
- [x] **Phase 3: Entities, Invoices & Live Tax** - Create invoice, see live tax from modular engine (completed 2026-08-22)
- [x] **Phase 4: Premium UI & Brand Redesign** - Crafted Minimal; every page mockup-first with new brand, graphics, and motion (completed 2026-08-25)
- [x] **Phase 4.1: Stitch→React 5-route conversion** (INSERTED) - stitch-build HTML→TSX for Rechnung · Entities · Kunden · Tax · PDF (completed 2026-08-28)
- [ ] **Phase 4.2: Desktop Platform Hardening** (INSERTED) - Tauri plugins, Sentry, updater, desktop polish
- [ ] **Phase 4.3: Infra & Prep for PDF, Offline & Audit** (INSERTED) - Gotenberg, monitoring, OTel, desktop/backend scaffolding before Phase 5
- [ ] **Phase 5: PDF, Audit & Offline Sync** - Download PDF, inspect tax audit trail, work offline and sync
- [ ] **Phase 5.1: Stitch→React extended catalog** (INSERTED) - remaining Stitch screens after PDF loop ships
- [ ] **Phase 6: Mockup 1:1 Fidelity Closure** - pixel-match approved mockups 02–07 on the 5 routes

## Phase Details

### Phase 1: Tauri Desktop & Mockup-First UI

**Goal**: User launches a beautiful Tauri desktop app on macOS or Windows; interactive mockups of the invoice → live-tax → PDF loop exist before feature implementation
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, DESK-01
**Success Criteria** (what must be TRUE):

  1. User can launch Clared as a Tauri window on macOS and on Windows (not Electron)
  2. Interactive mockups / UI-SPEC for the invoice → live-tax → PDF loop exist before app implementation
  3. User can navigate the mockuped desktop shell (Rechnungs-UI, Entities, Kunden, Tax-Vorschau, PDF)

**Plans**: 4/5 plans executed
**Wave 1**

- [x] 01-01-PLAN.md — Foundation, Tauri 2 monorepo + shadcn dark shell, end-to-end tracer, macOS launch

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Invoice canvas: split form/rail, line-item cards, staged tax rail, PDF paper, empty state
- [x] 01-03-PLAN.md — Entities, Kunden, and Tax mock screens
- [x] 01-04-PLAN.md — Higgsfield empty-state illustration + windows-latest CI build (DESK-01 Windows gate)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-05-PLAN.md — Gap closure: demo loading (skeleton/spinner) + demo error copy with retry on Rechnung

**UI hint**: yes

### Phase 2: Self-Hosted Backend & Authentik SSO

**Goal**: User signs in through Authentik and the desktop talks to the vendor Coolify backend (founder's cluster) over HTTPS and OIDC
**Depends on**: Phase 1
**Requirements**: BACK-01, AUTH-01
**Success Criteria** (what must be TRUE):

  1. Interactive mockups / UI-SPEC for login and session UI exist before implementation
  2. User can authenticate via Authentik OIDC (extra Tauri login window; scopes openid profile email)
  3. Desktop reaches the vendor Coolify backend over HTTPS with a backend-validated session or API key; unauthenticated calls are rejected
  4. Tokens carry RBAC groups (AUTH-01: owner, accountant, viewer, plus catalog including `clared-platform`); Postgres, Redis, Authentik, and the backend app run on the founder's Coolify

**Plans**: 7/7 plans executed

**Wave 1**

- [x] 02-01-PLAN.md — Nyquist Wave 0: Nest package + RED health/auth/rbac specs + skipped desktop auth tests

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Tracer ticket→Bearer→/me, RBAC catalog, [BLOCKING] schema push, Dockerfile
- [x] 02-03-PLAN.md — Tauri login window, clared://, OS keychain, split capabilities

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-04-PLAN.md — Gate, session chip, banners, Higgsfield hero

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-05-PLAN.md — openid-client + vendor Authentik compose.yml + blueprint

**Wave 5** *(gap closure; 02-06 and 02-07 parallel)*

- [x] 02-06-PLAN.md — G-02-1: Tauri webview-data-url so Anmelden opens the login window
- [x] 02-07-PLAN.md — G-02-2 + G-02-5: nest dist/main.js + openssl Dockerfile, Coolify redeploy

**UI hint**: yes

### Phase 3: Entities, Invoices & Live Tax

**Goal**: User sets up companies and customers, creates an invoice with line items, and sees live tax from a modular engine
**Depends on**: Phase 2
**Requirements**: ENT-01, INV-01, TAX-01, TAX-02
**Success Criteria** (what must be TRUE):

  1. Interactive mockups / UI-SPEC for entity, customer, invoice, and live-tax screens exist before implementation
  2. Owner can create and list entities (US LLC, EU-GmbH etc.) and customers; non-owners cannot create entities; accountant can see invoices
  3. User can create an invoice with line items and retrieve it by id (`POST /api/invoices`, `GET /api/invoices/:id`)
  4. User sees live tax preview as invoice facts change (TransactionFacts → TaxDecision: rate, reverse charge, legal text, applied_rule_id)
  5. Live preview comes from an integrated library `evaluate(facts): decision` using TaxRule JSON Schema as SSOT; decision-matrix rule classes produce expected TaxDecisions (collision/priority-tie behavior stays unspecified)

**Plans:** 6/6 plans executed

**Wave 1**

- [x] 03-01-PLAN.md — Nyquist Wave 0: skip-wrapped Nest e2e + RED tax-engine spec + desktop product specs

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02-PLAN.md — Backend tracer entity + customer + draft invoice + evaluate library + [BLOCKING] schema migrate

**Wave 3** *(blocked on Wave 2 completion; 03-04 and 03-06 parallel)*

- [x] 03-04-PLAN.md — 23 matrix TaxRule JSON + evaluate fixtures (TAX-02)
- [x] 03-06-PLAN.md — Desktop Bearer + one-path Entities/Rechnung/TaxRail UI

**Wave 4** *(blocked on Wave 3 desktop tracer)*

- [x] 03-03-PLAN.md — Entity/customer list+panel create, country→legal-form, EU VAT (ENT-01)

**Wave 5** *(blocked on 03-02, 03-06, and 03-03)*

- [x] 03-05-PLAN.md — Invoice PATCH/list, 600ms autosave, header picker, live tax rail (INV-01, TAX-01)

**UI hint**: yes

### Phase 4: Premium UI & Brand Redesign

**Goal**: Clared gets a complete premium fintech redesign ("Crafted Minimal") — a new brand system (color, type, motion), new graphics via Higgsfield, and every page redesigned mockup-first including animations, loading/splash, and empty/error states
**Depends on**: Phase 3
**Requirements**: UI-01, BRAND-01 (new)
**Success Criteria** (what must be TRUE):

  1. A "Crafted Minimal" design system (color tokens, type scale, spacing, depth, radius, motion) exists as SSOT and is approved
  2. User-approved image mockups exist for every page before it is coded (mockup-first, per Phase 1 precedent)
  3. All existing surfaces (app shell, Rechnung, Entities, Kunden, Tax, PDF, Login/Session) are rebuilt in the new system, each with empty / error / loading states
  4. New graphics (hero art, illustrations, empty-state art) are generated via Higgsfield CLI and wired in
  5. Motion is implemented per interface-design rules (durations <300ms, custom ease-out, `prefers-reduced-motion` respected), including a loading/splash experience

**Plans**: 6 plans

**Wave 1**

- [x] 04-01-PLAN.md — Crafted Minimal token split + OS-follow theme engine + Darstellung menu + splash (blocks all)

**Wave 2** *(blocked on Wave 1; 04-02 and 04-03 parallel)*

- [x] 04-02-PLAN.md — Rechnung / Tax / PDF restyle (tabular money, Sage press, PdfPaper D-09 guard)
- [x] 04-03-PLAN.md — Entities / Kunden / Auth restyle + shared states + Crafted asset swap + Login-Gate hero

**Wave 3** *(gap closure; blocked on Wave 2)*

- [x] 04-04-PLAN.md — FOUC inline paint + splash hold + invoice picker / Combobox unnest (G-04-1–3)

**Wave 4** *(gap closure; blocked on Wave 3)*

- [x] 04-05-PLAN.md — Empty CTA + login hero + OS applyTheme paint (G-04-4–6)

**Wave 5** *(gap closure; blocked on Wave 4)*

- [x] 04-06-PLAN.md — D-02 canvas token SSOT + FOUC (G-04-1, G-04-2)

**UI hint**: yes

### Phase 04.3: Infra & Prep for PDF, Offline & Audit (INSERTED)

**Goal:** Deploy supporting Coolify infra and wire desktop/backend scaffolding so Phase 5 focuses on product flows (generate PDF, audit trail, offline sync) — not plumbing
**Requirements**: PDF-01 (prep), OFFL-01 (prep), AUDT-01 (prep) — full IDs mapped in `/gsd-plan-phase 04.3`
**Depends on:** Phase 4.2
**Success Criteria** (what must be TRUE):

  1. **Wave 1 — Monitoring:** [Uptime Kuma](https://github.com/louislam/uptime-kuma) on Coolify monitors `clared-api`, Authentik, Postgres; [Beszel](https://github.com/henrygd/beszel) tracks VPS CPU/RAM/docker; alert webhooks documented
  2. **Wave 2 — PDF render infra:** [Gotenberg](https://github.com/gotenberg/gotenberg) on Coolify; NestJS PDF module skeleton (HTML template + invoice facts → PDF bytes contract); optional OTEL on Gotenberg
  3. **Wave 3 — Backend observability prep:** Pino structured logging in NestJS; OpenTelemetry SDK bootstrap; OTel Collector + Grafana (or minimal Coolify stack) deployed or documented for AUDT-01 — no `audit_logs` product UI yet
  4. **Wave 4 — Desktop PDF/offline prep:** official `tauri-plugin-dialog`, `tauri-plugin-fs`, [tauri-plugin-sharekit](https://github.com/Choochmeque/tauri-plugin-sharekit); `tauri-plugin-sql` scaffold (migrations dir, empty schema — no sync logic)
  5. **Wave 5 — Async jobs prep:** BullMQ skeleton on existing Redis (`pdf-generation` queue + worker stub); no invoice PDF templates in this phase
  6. Phase 5 owns end-user PDF download, `audit_logs` rows, and offline sync — this phase only prepares pipes

**Plans:** 0 plans
**UI hint**: no (infra + thin scaffolding)

Plans:

- [ ] TBD (run /gsd-plan-phase 04.3 to break down)

### Phase 04.2: Desktop Platform Hardening (INSERTED)

**Goal:** Harden the Tauri desktop shell for ship-readiness and premium macOS feel — observability, auto-update, native polish, and agent-friendly dev tooling
**Requirements**: DESK-01, DESK-02, DESK-03, DESK-04, DESK-05, DESK-06
**Depends on:** Phase 4.1
**Success Criteria** (what must be TRUE):

  1. **Wave 1 — Desktop feel (tauri-ui batteries cherry-picked):** external-link-guard; overscroll/rubber-band off; desktop selection defaults; startup flash aligned with existing boot paint; [`tauri-plugin-prevent-default`](https://github.com/ferreira-tb/tauri-plugin-prevent-default); [`tauri-plugin-store`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/store) with localStorage→store migration path documented; official [`window-state`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/window-state); [`notification`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/notification); community [`dragout`](https://github.com/alexqqqqqq777/tauri-plugin-dragout) (PDF drag-out ready for Phase 5)
  2. **Wave 2 — Observability:** official [`log`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/log); [`tauri-plugin-sentry`](https://github.com/timfish/sentry-tauri) 0.6 → **Sentry EU Free Cloud** (`de.sentry.io`), `sendDefaultPii: false`, env-gated dev/staging/prod; GlitchTip self-host explicitly deferred unless Cloud limits hit
  3. **Wave 3 — Ship:** official [`updater`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/updater) + official [`process`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/process) (restart after update); update-server on Coolify ([FaynoSync](https://github.com/ku9nov/faynoSync)); signed release channel documented
  4. **Wave 4 — DX (debug builds only):** rich Cmd/Ctrl+D debug-panel; Specta/TauRPC deferred (D-48)
  5. **Wave 5 — Clipboard:** official [`clipboard-manager`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/clipboard-manager) write-only (D-01); not CrossCopy
  6. Constraints: no tauri-ui scaffold migration; MCP bridge unchanged; no Gotenberg/SQL/dialog/fs (those are Phase 4.3)

**Plans:** 2/8 plans executed
**UI hint**: no (infra; minimal UI for debug-panel / update dialog / link guard only)

Plans:

- [x] 04.2-01-PLAN.md — Wave 0: Vitest mocks + RED test stubs (Nyquist)
- [x] 04.2-02-PLAN.md — Tracer: store theme + prevent-default + CSP
- [ ] 04.2-03-PLAN.md — Feel: link-guard, window-state, notification, dragout SUS gate
- [ ] 04.2-04-PLAN.md — Observability: log + Sentry EU scrubbed
- [ ] 04.2-05-PLAN.md — Ship ops: D-06 pubkey gate + FaynoSync Coolify + CI signing
- [ ] 04.2-06-PLAN.md — Ship client: updater UX, menu, dialog, relaunch
- [ ] 04.2-08-PLAN.md — Wave 7: Clipboard write-only + invoice/tax copy (before debug)
- [ ] 04.2-07-PLAN.md — Wave 8: DX rich debug panel + DevTools (depends on 08 copyText)

### Phase 04.1: Stitch→React 5-route conversion (INSERTED)

**Goal:** Convert approved Google Stitch HTML for the v1 5-item nav (Rechnung · Entities · Kunden · Tax · PDF) into production TSX/React in the Tauri desktop app using the stitch-build plugin/skills; close P1 repair backlog items during conversion
**Requirements**: UI-01, BRAND-01, D-11/D-13 scope lock
**Depends on:** Phase 4
**Success Criteria** (what must be TRUE):

  1. Shared AppShell (5-item nav only) extracted once; sidebar width/persona normalized (R-01, R-02)
  2. Routes Rechnung, Entities, Kunden, Tax, PDF are real React/TSX components driven from Stitch HTML SSOT (not leftover HTML iframes)
  3. Related v1 modals/empty states from the Screen→Route map are converted or explicitly deferred with backlog IDs
  4. Crafted Minimal tokens (Phase 4) + German primary copy (D-15); conversion acceptance in `.stitch/qa/STITCH-APPROVAL-BACKLOG.md` met
  5. P1 backlog R-01–R-04 addressed or filed with residual notes; stitch-build skills used as the conversion path

**Plans:** 7/7 plans complete
**UI hint**: yes

Plans:
**Wave 1**

- [x] 04.1-01-PLAN.md — Wave 0: package legitimacy + i18n/Material/pixel scaffold

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04.1-02-PLAN.md — AppShell tracer (260px, F-01, R-01 superseded, D-06 sync)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04.1-03-PLAN.md — Rechnung Stitch conversion + EmptyState 09 + Dialog modals (F-02/F-07)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 04.1-04-PLAN.md — Shared List+Panel Entities+Kunden (F-03/F-04/F-08)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 04.1-05-PLAN.md — Tax Stitch UI + tax-live-store (F-05)

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 04.1-06-PLAN.md — PDF viewer + 15-export (F-06)

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 04.1-07-PLAN.md — Pixel harness QA close + P1 backlog + end UAT

### Phase 5: PDF, Audit & Offline Sync

**Goal**: User finishes the two-minute loop with a PDF, can explain a tax decision from the audit trail, and can keep working when offline
**Depends on**: Phase 4.3
**Requirements**: PDF-01, OFFL-01, AUDT-01
**Success Criteria** (what must be TRUE):

  1. Interactive mockups / UI-SPEC for PDF viewer and offline/sync states exist before implementation (satisfied by Phase 4.1 Stitch→React surfaces + remaining offline/sync mockups)
  2. User can generate, download, and view a multilingual (DE/EN) invoice PDF that includes TaxDecision text blocks (uses Gotenberg + NestJS from 4.3)
  3. Each tax evaluation leaves a persisted `audit_logs` row (applied rule, audit_trace); backend application logs exist (Pino/OTel from 4.3); Grafana dashboards live
  4. User can open recently used entities, customers, and invoices offline (SQLite sync via 4.3 scaffold) and sync when the connection returns

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 4.1 → 4.2 → 4.3 → 5 → 5.1 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tauri Desktop & Mockup-First UI | 5/5 | Complete | 2026-08-20 |
| 2. Self-Hosted Backend & Authentik SSO | 7/7 | Complete | 2026-08-22 |
| 3. Entities, Invoices & Live Tax | 6/6 | Complete | 2026-08-22 |
| 4. Premium UI & Brand Redesign | 6/6 | Complete | 2026-08-25 |
| 4.1 Stitch→React 5-route conversion | 7/7 | Complete    | 2026-08-28 |
| 4.2 Desktop Platform Hardening | 2/8 | In Progress|  |
| 4.3 Infra & Prep for PDF/Offline/Audit | 0/? | Not started | - |
| 5. PDF, Audit & Offline Sync | 0/? | Not started | - |
| 5.1 Stitch→React extended catalog | 0/? | Not started | - |
| 6. Mockup 1:1 Fidelity Closure | 0/? | Not started | - |

### Phase 05.1: Stitch→React extended catalog (INSERTED)

**Goal:** Convert remaining approved Stitch screens (out-of-nav: login/onboarding/lists/overlays/settings/splash/etc.) into TSX/React via stitch-build; close P2 repair backlog
**Requirements**: UI-01, BRAND-01
**Depends on:** Phase 5
**Success Criteria** (what must be TRUE):

  1. Screens listed under “Out of v1 nav (D-13)” in `.stitch/qa/STITCH-APPROVAL-BACKLOG.md` are converted or explicitly deferred with IDs
  2. P2 backlog R-10–R-14 closed during conversion
  3. No regression to the 5-route shell from Phase 4.1

**Plans:** 0 plans
**UI hint**: yes

Plans:

- [ ] TBD (run /gsd-plan-phase 05.1 to break down)

### Phase 6: Mockup 1:1 Fidelity Closure — all 5 routes pixel-match approved mockups 02–07

**Goal:** Close remaining visual/IA gaps (F-01–F-09) so Tauri screens pixel-match approved mockups 02–07 for the 5 v1 routes
**Requirements**: UI-01
**Depends on:** Phase 4.1 (and Phase 5 for PDF/audit live data where needed)
**Plans:** 0 plans
**UI hint**: yes

Plans:

- [ ] TBD (run /gsd-plan-phase 6 to break down)
