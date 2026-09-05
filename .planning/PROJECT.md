# Clared

## What This Is

Clared is a commercial SaaS desktop app (macOS and Windows) that lets subscribed operators create B2B invoices, see live tax evaluation, and get a PDF. The client is Tauri (Rust + Web-UI). It talks over HTTPS and OIDC to the **vendor Coolify cluster** (Postgres, Redis, Authentik, API) — not a customer-run self-host, not open source, not a free tier.

## Core Value

Beautiful interactive invoice + live-tax + PDF loop on the desktop — create invoice, see live tax, get PDF — under 2 minutes.

## Business Context

- **Customer**: Subscribed operators who invoice global B2B (entities such as US LLC / EU-GmbH, customers/mandants)
- **Revenue model**: Subscription SaaS (paid). Vendor operates Coolify. No OSS distribution, no free product, no customer self-host of the backend.
- **Success metric**: Beautiful desktop app — create invoice, see live tax, get PDF — under 2 minutes
- **Strategy notes**: `.planning/intel/` (PRD + tax-engine SPECs); `.planning/INGEST-CONFLICTS.md`

## Requirements

### Validated

- ✓ **DESK-01**: Tauri desktop client on macOS and Windows — Phase 1 (Orca UAT + Windows CI)
- ✓ **UI-01** (Phase 1): Mockup-first invoice → tax → PDF shell shipped — still required on later UI-bearing phases
- ✓ **BACK-01**: Vendor Coolify backend (API, Postgres, Redis, Authentik) — Phase 2
- ✓ **AUTH-01**: Authentik SSO / OIDC with RBAC (Mandant: owner…viewer; Plattform: `clared-platform`) — Phase 2

### Active

- [ ] **UI-01**: Mockup-first UI — interactive mockups / UI-SPEC before implementation on every remaining UI-bearing phase
- [ ] **ENT-01**: Entity- and customer management
- [ ] **INV-01**: Invoice create / persist / retrieve with line items
- [ ] **TAX-01**: Live tax evaluation of TransactionFacts
- [ ] **TAX-02**: Modular tax engine as library `evaluate(facts): decision`
- [ ] **PDF-01**: PDF from invoice + TaxDecision text blocks (DE/EN)
- [ ] **OFFL-01**: Offline local store + sync when online
- [ ] **AUDT-01**: Application logs, tax-decision audit trail, Coolify monitoring

### Out of Scope

- Electron desktop runtime — user locked Tauri
- Open-source / free / customer self-host of Clared — product is paid SaaS on vendor Coolify
- Supabase self-hosted BaaS as v1 default — PRD optional alternative; custom backend is the primary path
- Tax-engine as a separate microservice in v1 — PRD: start integrated; extract later
- Collision / priority-tie algorithm — SPEC says PRD would describe it; PRD is silent; do not invent

## Context

Greenfield from ingest: PRD `docs/clared-app-prd.md` plus tax SPECs (architecture, VAT/USt decision matrix, Tax Rule JSON Schema). No ADR-classified docs. No DOC-classified context topics. GSD agent runtime: claude (Cursor).

Product lock (2026-08-20): Clared is **subscription SaaS**. Backend/Authentik/Postgres/Redis run on the **founder's Coolify**. Desktop clients authenticate against that cluster. Source is proprietary (`UNLICENSED`). Stripe/seats/multi-tenant billing is v2 (`SAAS-01`), not this milestone — but tokens already carry `clared-platform` plus Mandant-Gruppen.

Tax-engine contract: TransactionFacts in, TaxDecision out; RuleStore versioned; engine stateless. JSON Schema for TaxRule is SSOT. Decision-matrix in Markdown is the human/AI spec for test cases and rule classes.

Open gap (INFO, not a blocker): ExecutionEngine step 4 expects collision logic in the PRD; PRD has none.

## Constraints

- **Runtime**: Tauri (Rust + Web-UI) — user lock; not Electron
- **Platforms**: macOS and Windows desktop
- **UI**: Mockup-first — ALWAYS build interactive mockups / UI-SPEC before implementation on every UI-bearing phase
- **Deploy**: Vendor Coolify only — Postgres (`clared` / `clared_app`), Redis, Authentik, backend app; HTTPS. Local OrbStack mirrors that stack for development.
- **License**: Proprietary. Not OSS. Not free.
- **Auth protocol**: Authentik OIDC; backend OAuth2 client; scopes `openid profile email groups`; roles owner / accountant / viewer plus `clared-platform`
- **Tax contract**: Library `evaluate(facts): decision`; TaxRule JSON Schema is SSOT; types from schema
- **API (v1)**: `POST /api/invoices`, `GET /api/invoices/:id`, `POST /api/tax/evaluate`, `GET /api/entities`
- **Data**: Tables entities, customers, invoices, invoice_items, tax_rules (optional besides file-DSL), audit_logs
- **PDF**: Backend-rendered (templates in DB or filesystem); multilingual DE/EN; Redis queue for heavy jobs
- **Open**: Collision logic unspecified — do not invent an algorithm

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tauri desktop client (not Electron) | User lock; native-like macOS + Windows | ✓ Locked |
| Coolify: Postgres, Redis, Authentik, backend app | Vendor cluster (founder's Coolify), not customer self-host | ✓ Locked |
| Subscription SaaS, proprietary, not free, not OSS | User lock 2026-08-20 | ✓ Locked |
| Tax engine as library `evaluate(facts): decision`; JSON Schema is TaxRule SSOT | SPEC AI-Kodier-Contract + PRD Variante 1 for start | ✓ Locked |
| HTTPS + OIDC from desktop to backend | PRD Authentik OIDC flow | ✓ Locked |
| UI framework: React 19 + Vite + Tauri 2 | Phase 1 stack lock (not Vue) | ✓ Phase 1 |
| Backend: NestJS + Prisma 7 | Phase 2 discuss | ✓ Phase 2 (discuss) |
| Tax-engine integrated module vs later microservice | PRD: start integrated; extract later | — Pending |
| Collision logic (priority ties) | SPEC says PRD describes it; PRD silent | — Pending |
| Supabase self-hosted BaaS | Optional PRD alternative; not v1; vendor Nest+Postgres instead | ✓ Locked (out) |
| Kuma/Beszel/Grafana: app login, no Authentik in front (D-05/D-22) | Monitors stay up if Authentik is down | ✓ Phase 04.3 |
| Gotenberg internal-only Chromium HTML; no Gotenberg OTEL (D-16) | Invoice PDF pipe (superseded by 4.6 Takumi+pdfcn) | ✓ Phase 04.3; renderer retired in 04.6 |
| Takumi + pdfcn Invoice Minimal visual PDF; Gotenberg fully removed | JSX in-process Nest API; no Chrome, no PDF worker; e-invoice XML is 4.7 | Phase 04.6 in progress |
| PDF paper = Crafted oatmeal `#F7F7F5` in 4.6; Entity brand/paper color later | Founder UAT option 3 (2026-09-05); Kaneo #98 with Phase 6 logo | ✓ Locked for 4.6; backlog Phase 6+ |
| Factur-X/ZUGFeRD Comfort CII + XRechnung + PDF/A-3b embed | Same Takumi render path; no pdf-lib second pass | Phase 04.7 pending |
| Same Nest image, two processes: API migrate+main, worker `node dist/worker.js` | Coolify start_command is Nixpacks-only | ✓ Phase 04.3 |
| SQLCipher keychain + empty `_init` schema; no sync yet | OFFL-01 product sync is Phase 5 | ✓ Phase 04.3 |

---
*Last updated: 2026-09-05 after Phase 04.6 insert (Takumi+pdfcn cutover)*
