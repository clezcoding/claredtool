# Roadmap: Clared

## Overview

Clared ships as a stunning Tauri desktop app whose core loop is create invoice → see live tax → get PDF in under 2 minutes. It is **paid subscription SaaS**: backend, Postgres, Redis, and Authentik run on the **founder's Coolify**, not on the customer's machine, not as open source, not for free. Phase 1 puts a real macOS/Windows window on screen with interactive mockups before any feature UI is implemented. Phase 2 connects that shell to the vendor Coolify API and Authentik SSO. Phase 3 is the product: entities, invoices, and a modular tax engine driving live preview. Phase 4 is a full premium redesign (Crafted Minimal) — every page rebuilt mockup-first with a new brand, new graphics, and motion. Phase 5 closes the loop with PDF, tax-decision audit, and offline sync. Stripe/seats (`SAAS-01`) stay v2.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Tauri Desktop & Mockup-First UI** - Launch Clared in a Tauri window; invoice+tax+PDF mockups exist before implementation (completed 2026-08-20)
- [x] **Phase 2: Self-Hosted Backend & Authentik SSO** - Sign in via Authentik; desktop talks HTTPS+OIDC to vendor Coolify (founder's cluster) (completed 2026-08-22)
- [x] **Phase 3: Entities, Invoices & Live Tax** - Create invoice, see live tax from modular engine (completed 2026-08-22)
- [ ] **Phase 4: Premium UI & Brand Redesign** - Crafted Minimal; every page mockup-first with new brand, graphics, and motion
- [ ] **Phase 5: PDF, Audit & Offline Sync** - Download PDF, inspect tax audit trail, work offline and sync

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

### Phase 5: PDF, Audit & Offline Sync

**Goal**: User finishes the two-minute loop with a PDF, can explain a tax decision from the audit trail, and can keep working when offline
**Depends on**: Phase 4
**Requirements**: PDF-01, OFFL-01, AUDT-01
**Success Criteria** (what must be TRUE):

  1. Interactive mockups / UI-SPEC for PDF viewer and offline/sync states exist before implementation
  2. User can generate, download, and view a multilingual (DE/EN) invoice PDF that includes TaxDecision text blocks
  3. Each tax evaluation leaves a persisted `audit_logs` row (applied rule, audit_trace); backend application logs exist; operator can add Grafana/Prometheus on Coolify
  4. User can open recently used entities, customers, and invoices offline (IndexedDB/SQLite) and sync when the connection returns

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tauri Desktop & Mockup-First UI | 5/5 | Complete    | 2026-08-20 |
| 2. Self-Hosted Backend & Authentik SSO | 7/7 | Complete    | 2026-08-22 |
| 3. Entities, Invoices & Live Tax | 6/6 | Complete    | 2026-08-22 |
| 4. Premium UI & Brand Redesign | 5/5 | In Progress|  |
| 5. PDF, Audit & Offline Sync | 0/? | Not started | - |

### Phase 6: Mockup 1:1 Fidelity Closure — all 5 routes pixel-match approved mockups 02–07

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 5
**Plans:** 0 plans

Plans:

- [ ] TBD (run /gsd-plan-phase 6 to break down)
