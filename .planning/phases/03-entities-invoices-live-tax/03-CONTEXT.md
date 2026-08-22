# Phase 3: Entities, Invoices & Live Tax - Context

**Gathered:** 2026-08-22
**Status:** Ready for planning

<domain>
## Phase Boundary

The subscribed operator creates companies (entities) and customers, writes a draft invoice with line items, and sees live tax from a modular in-process engine. Interactive mockups / UI-SPEC for entity, customer, invoice, and live-tax screens exist before implementation.

This phase delivers: Prisma models and APIs for entities, customers, invoices, invoice_items; RBAC enforcement (`entity.create` owner-only, invoice/tax permissions from Phase 2 catalog); `packages/tax-engine` library `evaluate(facts): decision`; `POST /api/tax/evaluate`; live tax rail + `/tax` wired to real decisions; RuleStore as JSON files seeded into Postgres.

This phase does **not** deliver: issued/final invoices, PDF (Phase 4), tax-decision `audit_logs` persistence (Phase 4), offline sync (Phase 4), tax override UI, tax-engine microservice (`TAX-03` v2), CH/UK rule modules that are not rows in the current decision matrix (`TAX-04`), Stripe/seats (`SAAS-01`).

</domain>

<decisions>
## Implementation Decisions

### Entity / customer create UX
- **D-01:** Create form is a **panel under the list**, same layout as the Phase 1 detail panel (writable now). Not a dialog, not a separate route. — **Reversibility:** costly — UI-SPEC, list+panel pattern, and tests assume this.
- **D-02:** A customer **always belongs to one entity** (the seller company). No orphan customers, no many-to-many.
- **D-03:** Legal form is a **long catalog, not US LLC + EU-GmbH only**. Picker is **country first, then only that country's forms**. Do not use a flat worldwide dump or free-text type.
- **D-04:** Non-owners still **see** „Anlegen“, **disabled**, with a short hint. Do not hide the button. Do not allow click-then-403 as the primary UX. Server still 403s if called.

### Invoice persist
- **D-05:** Drafts **autosave after a short pause** while typing. No required Save button. No per-field-blur save.
- **D-06:** This phase is **draft only**. No „Stellen“ / issued status. Final + PDF = Phase 4.
- **D-07:** „Neue Rechnung“ opens the **empty state / empty form**. Previous drafts stay in the picker. Do not copy the last invoice. Do not reset to the Phase 1 sample invoice.
- **D-08:** Past invoices are a **picker in the invoice header**, not a new sidebar item, not only via customer/entity screens.

### Live tax
- **D-09:** Re-evaluate **automatically after a short pause** when relevant fields change. No „Steuer berechnen“ button. Do not wait for an explicit save-only trigger (autosave and tax debounce may share the same pause).
- **D-10:** Evaluation runs **only on the server** (`POST /api/tax/evaluate`). Desktop must not embed the engine. Offline evaluation is Phase 4.
- **D-11:** On evaluate failure: **keep the last good TaxDecision** and show a small error in the tax rail. Do not blank the rail. Do not block typing.
- **D-12:** Invoice **rail shows the four Phase 1 fields** (`invoice_tax_rate`, `reverse_charge_flag`, `legal_reference`, `applied_rule_id`). `/tax` shows the **full TaxDecision**. Both update live.

### Tax engine / RuleStore
- **D-13:** v1 rule **content** = every rule class currently in `docs/clared-tax-rule-matrix.md` (EU / US / UAE / third-country classes in that table), each as TaxRule JSON + expected TaxDecision tests. Do **not** invent CH/UK (or other) classes that are not in that table. Collision / priority-tie algorithm stays unspecified — do not invent.
- **D-14:** Rules live in **repo JSON files and Postgres `tax_rules`**. Files are SSOT; DB is loaded from files. If they disagree, **files win** (reload/seed from files). — **Reversibility:** costly — seed path and runtime loader assume file primacy.
- **D-15:** Engine code lives in **`packages/tax-engine`**. Backend imports the library. Not an inlined-only backend folder. Not a microservice in this phase. — **Reversibility:** costly — package boundary and Nest import graph lock; this is the extract seam for later `TAX-03`.
- **D-16:** **No tax override UI.** Rail and `/tax` show engine output only. `tax.override` stays in the RBAC catalog unused in UI.

### Launch / facts / fields / numbering
- **D-17:** After login, open the **last edited invoice**. If none exist, empty form (D-07). This **replaces Phase 1 D-22** (filled sample as home) now that persist exists. Sample invoice data may remain as a fixture for tests, not the signed-in landing path.
- **D-18:** **Backend** maps invoice payload → `TransactionFacts`. Desktop sends invoice (draft) data, not tax-engine internals. — **Reversibility:** costly — API contract: evaluate takes invoice-shaped input, not a desktop-built facts object.
- **D-19:** Entity required fields: **name, country, legal form, address**. **VAT ID required when country is EU**. Customer fields follow the same identity bar except legal form (name, country, address; VAT ID if EU) unless a later UI-SPEC tightens this.
- **D-20:** Invoice **number is assigned automatically** (year + counter). **Currency defaults from the seller entity** and is **changeable per invoice**.

### Claude's Discretion
- Debounce duration for autosave and tax (keep them aligned; hundreds of ms to ~1s is enough).
- Exact country → legal-form table (ISO countries + common forms per jurisdiction; searchable within the country step).
- Invoice-number uniqueness scope (prefer per-entity year sequence) and padding.
- Whether `/api/tax/evaluate` accepts a full draft body vs invoice id after autosave — pick one primary path so live tax does not race an unsaved draft; invoice-shaped body is consistent with D-18.
- Customer extra fields (email, notes) if the mock already shows them; do not block create on them.
- Prisma table/column names as long as they match PROJECT.md data list: entities, customers, invoices, invoice_items, tax_rules.
- Higgsfield only if a new empty-state illustration is required; reuse Phase 1 empty-state art when it still fits D-07.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product / phase scope
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria (entities, invoice CRUD, live tax, modular `evaluate`).
- `.planning/REQUIREMENTS.md` — ENT-01, INV-01, TAX-01, TAX-02; PDF-01 / AUDT-01 / OFFL-01 are Phase 4; TAX-03 / TAX-04 / SAAS-01 are v2.
- `.planning/PROJECT.md` — tax library contract; API v1; tables; collision logic must not be invented; vendor Coolify SaaS.
- `docs/clared-app-prd.md` — §3 endpoints (`POST /api/invoices`, `GET /api/invoices/:id`, `POST /api/tax/evaluate`, `GET /api/entities`); tax engine Variante 1 (integrated library).
- `CONTEXT.md` — German domain glossary (Entity, Kunde, Rechnung). Do not invent English UI terms.

### Tax engine (implement in this phase)
- `docs/clared-tax-engine-architecture.md` — `evaluate(facts): decision`, RuleStore, TaxDecision shape, stateless engine.
- `docs/clared-tax-rule-matrix.md` — rule classes that MUST have JSON + tests (D-13). Human/AI spec; not a collision algorithm.
- `docs/clared-tax-rule-dsl-schema.json` — TaxRule SSOT. Types and stored JSON MUST validate against this schema.

### Carry forward
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-CONTEXT.md` — D-14–D-21 invoice canvas; D-29 list+panel; D-18 no per-line tax on cards. D-22 landing is superseded by Phase 3 D-17. D-31 disabled Anlegen is superseded by Phase 3 D-04 (still disabled for non-owners, enabled for owners).
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-UI-SPEC.md` — existing screens; Phase 3 UI-SPEC extends, does not regress dark-first dense shell.
- `.planning/phases/02-self-hosted-backend-authentik-sso/02-CONTEXT.md` — D-22–D-25 RBAC catalog and `entity.create`; D-31 401 retry; Nest + Prisma 7; Bearer session. Phase 2 D-05 forbade scaffolding `packages/tax-engine` then — **do it now** (Phase 3 D-15). Phase 2 D-10 catch-all 401 for unknown routes: replace with real invoice/entity/tax routes, keep unauthenticated 401.

### UI-01
- Mockup-first: UI-SPEC for entity create panel, customer create panel, invoice header picker, live tax error, empty new invoice — before implementation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/desktop/src/routes/entities.tsx` / `kunden.tsx` — list + detail panel + `CreateDisabledButton`; enable for `entity.create` / `kunde.write`, put the form in the same panel slot (D-01).
- `apps/desktop/src/components/tax-rail.tsx` — four staged fields from `SAMPLE_INVOICE`; swap for live TaxDecision + error (D-11, D-12).
- `apps/desktop/src/routes/tax.tsx` — nine StagedTaxDecision fields; wire to the same evaluate result.
- `apps/desktop/src/data/sample-invoice.ts` — test fixture / demo data, not signed-in home (D-17).
- `apps/desktop/src/components/invoice-empty-state.tsx` — D-07 empty new invoice.
- `apps/backend/src/auth/rbac.ts` — permission catalog; enforce on new routes. `apps/backend/prisma/schema.prisma` has **no business models yet** (datasource + generator only).
- Phase 2 typed fetch / Bearer client on desktop — extend for invoices, entities, customers, tax evaluate.

### Established Patterns
- React 19 + Vite 8 + Tauri 2 + hash router; dark-first shadcn; dense-but-calm.
- NestJS + Prisma 7 in `apps/backend`; `prisma migrate deploy` before start.
- Authenticated API; unauthenticated → 401. RBAC groups from Authentik via `/me`.
- Line items = compact cards (Phase 1 D-17–D-21). Tax is document-level, not per line.

### Integration Points
- New `packages/tax-engine` in the pnpm workspace; Nest module imports `evaluate`.
- Prisma models + migrations for entities, customers, invoices, invoice_items, tax_rules; seed tax_rules from JSON files.
- Desktop Rechnung screen: autosave + header invoice picker + live evaluate.
- Coolify/OrbStack Postgres already exists; schema was auth-only — this phase adds the product tables.

</code_context>

<specifics>
## Specific Ideas

- Country → legal form is a **two-step picker**, not a 200-row combo of every form on earth.
- Files win over DB so git remains the rule review path; Postgres is for runtime listing/version rows, not a second authoring UI in this phase.
- Live tax should feel like the mock rail, just no longer staged numbers.
- First-run (zero invoices) should feel like „Neue Rechnung“, not the old filled EU-GmbH sample home.

</specifics>

<deferred>
## Deferred Ideas

- Tax-engine **microservice** (`POST /tax/evaluate` as its own service) — `TAX-03` / v2. Phase 3 package boundary is the extract seam.
- **CH/UK** (and other) rule modules **not present** as rows in `docs/clared-tax-rule-matrix.md` — `TAX-04`. UAE/US/EU classes that **are** in the matrix are in scope (D-13).
- Invoice **issue / Stellen**, PDF, multilingual TaxDecision blocks on paper — Phase 4 (`PDF-01`).
- Persist each evaluation to `audit_logs` — Phase 4 (`AUDT-01`).
- Desktop-embedded engine / offline evaluate — Phase 4 (`OFFL-01`).
- Tax **override** UI (`tax.override`).
- „Überall abmelden“, Stripe/seats — already Phase 2 / `SAAS-01` deferred.

</deferred>

---

*Phase: 3-Entities, Invoices & Live Tax*
*Context gathered: 2026-08-22*
