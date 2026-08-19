# Roadmap: Clared

## Overview

Clared ships as a stunning Tauri desktop app whose core loop is create invoice → see live tax → get PDF in under 2 minutes. Phase 1 puts a real macOS/Windows window on screen with interactive mockups before any feature UI is implemented. Phase 2 connects that shell to a Coolify-hosted API and Authentik SSO. Phase 3 is the product: entities, invoices, and a modular tax engine driving live preview. Phase 4 closes the loop with PDF, tax-decision audit, and offline sync.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Tauri Desktop & Mockup-First UI** - Launch Clared in a Tauri window; invoice+tax+PDF mockups exist before implementation
- [ ] **Phase 2: Self-Hosted Backend & Authentik SSO** - Sign in via Authentik; desktop talks HTTPS+OIDC to Coolify
- [ ] **Phase 3: Entities, Invoices & Live Tax** - Create invoice, see live tax from modular engine
- [ ] **Phase 4: PDF, Audit & Offline Sync** - Download PDF, inspect tax audit trail, work offline and sync

## Phase Details

### Phase 1: Tauri Desktop & Mockup-First UI

**Goal**: User launches a beautiful Tauri desktop app on macOS or Windows; interactive mockups of the invoice → live-tax → PDF loop exist before feature implementation
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, DESK-01
**Success Criteria** (what must be TRUE):

  1. User can launch Clared as a Tauri window on macOS and on Windows (not Electron)
  2. Interactive mockups / UI-SPEC for the invoice → live-tax → PDF loop exist before app implementation
  3. User can navigate the mockuped desktop shell (Rechnungs-UI, Entities, Kunden, Tax-Vorschau, PDF)

**Plans**: 1/4 plans executed
**Wave 1**

- [x] 01-01-PLAN.md — Foundation, Tauri 2 monorepo + shadcn dark shell, end-to-end tracer, macOS launch

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Invoice canvas: split form/rail, line-item cards, staged tax rail, PDF paper, empty state
- [ ] 01-03-PLAN.md — Entities, Kunden, and Tax mock screens
- [ ] 01-04-PLAN.md — Higgsfield empty-state illustration + windows-latest CI build (DESK-01 Windows gate)

**UI hint**: yes

### Phase 2: Self-Hosted Backend & Authentik SSO

**Goal**: User signs in through Authentik and the desktop talks to a self-hosted Coolify backend over HTTPS and OIDC
**Depends on**: Phase 1
**Requirements**: BACK-01, AUTH-01
**Success Criteria** (what must be TRUE):

  1. Interactive mockups / UI-SPEC for login and session UI exist before implementation
  2. User can authenticate via Authentik OIDC (browser window or embedded WebView; scopes openid profile email)
  3. Desktop reaches the Coolify backend over HTTPS with a backend-validated session or API key; unauthenticated calls are rejected
  4. Tokens carry roles owner, accountant, viewer; Postgres, Redis, Authentik, and the backend app run on Coolify

**Plans**: TBD
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

**Plans**: TBD
**UI hint**: yes

### Phase 4: PDF, Audit & Offline Sync

**Goal**: User finishes the two-minute loop with a PDF, can explain a tax decision from the audit trail, and can keep working when offline
**Depends on**: Phase 3
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
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tauri Desktop & Mockup-First UI | 1/4 | In Progress|  |
| 2. Self-Hosted Backend & Authentik SSO | 0/? | Not started | - |
| 3. Entities, Invoices & Live Tax | 0/? | Not started | - |
| 4. PDF, Audit & Offline Sync | 0/? | Not started | - |
