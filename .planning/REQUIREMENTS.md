# Requirements: Clared

**Defined:** 2026-08-19
**Core Value:** Beautiful interactive invoice + live-tax + PDF loop on the desktop — create invoice, see live tax, get PDF — under 2 minutes.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Desktop & UI

- [ ] **UI-01**: Every UI-bearing phase has interactive mockups / UI-SPEC before implementation (ALWAYS build mockups)
- [ ] **DESK-01**: User can run Clared as a Tauri desktop app (Rust + Web-UI) on macOS and Windows

### Backend & Identity

- [ ] **BACK-01**: Desktop connects over HTTPS and OIDC/OAuth2 to a self-hosted Coolify backend (Backend-App, Postgres, Redis, Authentik)
- [ ] **AUTH-01**: User authenticates via Authentik OIDC (SSO/MFA); backend validates token and creates session/API-key; roles owner, accountant, viewer

### Entities & Invoices

- [ ] **ENT-01**: User can manage companies (US LLC, EU-GmbH etc.) and customers/mandants; only owner may create entities
- [ ] **INV-01**: User can create, persist, and retrieve invoices including line items (`POST /api/invoices`, `GET /api/invoices/:id`)

### Tax Engine

- [ ] **TAX-01**: User sees live tax preview from tax-engine evaluation of a TransactionFacts structure (`POST /api/tax/evaluate`)
- [ ] **TAX-02**: Tax engine is a library with `evaluate(facts): decision`, integrated in the backend as module `tax-engine` (extractable later)

### PDF, Offline & Audit

- [ ] **PDF-01**: User can download and view a backend-rendered PDF (templates + TaxDecision text blocks; multilingual DE/EN)
- [ ] **OFFL-01**: User can work with recently used data offline (IndexedDB/SQLite) and sync when the connection returns
- [ ] **AUDT-01**: Each tax decision is persisted in `audit_logs`; application logs exist in the backend; monitoring can run as additional Coolify services (Grafana, Prometheus)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Tax Engine

- **TAX-03**: Extract tax engine as microservice (`POST /tax/evaluate`, `GET /tax/rules`)
- **TAX-04**: Additional country/industry rule modules (CH, UK, GCC, specialized tags) via RuleStore content, not engine rewrites

### Platform

- **REAL-01**: Optional WebSockets for live updates of background jobs
- **MAIL-01**: Emailversand queued with PDF generation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Electron desktop runtime | User locked Tauri |
| Supabase as v1 default BaaS | PRD optional alternative; custom backend is the primary path |
| Tax-engine microservice in v1 | PRD: start integrated (Variante 1) |
| Collision / priority-tie algorithm | SPEC points at PRD; PRD silent — do not invent |

## Intel slug mapping

| Intel slug | v1 ID |
|------------|-------|
| *(user mandate)* | UI-01 |
| REQ-desktop-client | DESK-01 |
| REQ-self-hosted-backend | BACK-01 |
| REQ-authentik-sso-rbac | AUTH-01 |
| REQ-entity-customer-management | ENT-01 |
| REQ-invoice-management | INV-01 |
| REQ-live-tax-evaluation | TAX-01 |
| REQ-tax-engine-modularity | TAX-02 |
| REQ-pdf-generation | PDF-01 |
| REQ-offline-capability | OFFL-01 |
| REQ-audit-and-monitoring | AUDT-01 |

DESK-01 is the Tauri runtime/shell. Rechnungs-UI, Entity-/Kundenverwaltung, Live-Tax-Vorschau, and PDF-Erzeugung from the intel desktop-client acceptance are delivered by INV-01, ENT-01, TAX-01, and PDF-01 — not duplicated here.

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 1 | Pending |
| DESK-01 | Phase 1 | Pending |
| BACK-01 | Phase 2 | Pending |
| AUTH-01 | Phase 2 | Pending |
| ENT-01 | Phase 3 | Pending |
| INV-01 | Phase 3 | Pending |
| TAX-01 | Phase 3 | Pending |
| TAX-02 | Phase 3 | Pending |
| PDF-01 | Phase 4 | Pending |
| OFFL-01 | Phase 4 | Pending |
| AUDT-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-19*
*Last updated: 2026-08-19 after new-project-from-ingest roadmap*
