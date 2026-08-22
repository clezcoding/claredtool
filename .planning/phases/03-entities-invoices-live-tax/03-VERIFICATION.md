---
phase: 03-entities-invoices-live-tax
verified: 2026-08-22T19:26:00Z
status: verified
score: 13/13
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Walk entity, customer, invoice, and live-tax screens against 03-UI-SPEC.md (E2–E8 surfaces)"
    expected: "Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract"
    result: pass
    evidence: "03-UAT.md test 1; commit eb0e0c2; vitest 43/43 + live Tauri/macOS"
  - test: "D-17 last-edited invoice landing"
    expected: "Two drafts; PATCH older to newest updatedAt; reload loads PATCHed draft; zero invoices → empty form"
    result: pass
    evidence: "03-UAT.md test 2; live prod API + Tauri reload RE-2026-001 f137b034…"
---

# Phase 3: Entities, Invoices & Live Tax Verification Report

**Phase Goal:** User sets up companies and customers, creates an invoice with line items, and sees live tax from a modular engine
**Verified:** 2026-08-22T19:26:00Z
**Status:** verified
**Re-verification:** Yes — UAT session 2026-08-22 post-deploy (03-UAT.md complete)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Interactive mockups / UI-SPEC for entity, customer, invoice, live-tax exist before implementation (ROADMAP SC1) | ✓ VERIFIED | `03-UI-SPEC.md` present, `status: approved`, reviewed 2026-08-22 |
| 2 | Owner can create and list entities and customers; non-owners cannot create entities; accountant can read invoices (ROADMAP SC2, ENT-01) | ✓ VERIFIED | `entities.controller.ts` `@RequirePermission`; `entities.e2e-spec.ts` owner 201 / viewer 403; `customers.e2e-spec.ts` entityId FK; `invoices.e2e-spec.ts` accountant GET 200; `phase03-entities.test.tsx` disabled Anlegen + hint |
| 3 | User can create invoice with line items and retrieve by id (ROADMAP SC3, INV-01) | ✓ VERIFIED | `invoices.controller.ts` POST/GET; `invoices.e2e-spec.ts` POST items + GET same items; PATCH replaces items |
| 4 | Live tax preview as facts change: rate, reverse charge, legal text, applied_rule_id (ROADMAP SC4, TAX-01) | ✓ VERIFIED | `rechnung.tsx` POST `/api/tax/evaluate` invoice-shaped body; `tax-rail.tsx` four canonical keys; `invoice.test.tsx` live rail values; `tax.e2e-spec.ts` canonical TaxDecision keys |
| 5 | Integrated `evaluate(facts): decision` library; 23 matrix classes with expected decisions; 0/2 match throws (ROADMAP SC5, TAX-02) | ✓ VERIFIED | `packages/tax-engine` 23 `rules/*.json`; `evaluate.spec.ts` `it.each(MATRIX_RULE_IDS)` + throw tests; `tax.controller.ts` imports `@clared/tax-engine`; Ajv in `store.ts` |
| 6 | Drafts autosave after 600ms pause; no required Save button (D-05, INV-01) | ✓ VERIFIED | `rechnung.tsx` `AUTOSAVE_DELAY_MS = 600`; `phase03-autosave.test.tsx` Speichert → Gespeichert |
| 7 | Tax re-evaluates on same 600ms pause; no calculate button; server-only evaluate (D-09, D-10) | ✓ VERIFIED | Shared debounce `useEffect` calls `evaluateDraftRef`; no desktop `@clared/tax-engine` import |
| 8 | On evaluate failure keep last good TaxDecision; rail error copy; typing enabled (D-11) | ✓ VERIFIED | `lastGoodTaxRef` + `phase03-tax-rail.test.tsx`; Copywriting error string in `tax-rail.tsx` |
| 9 | Entity/customer list+panel create; country→legal-form; EU VAT; disabled Anlegen hint (D-01–D-04, D-19) | ✓ VERIFIED | `entities.tsx` / `kunden.tsx` panel modes; `legal-forms.ts` + server `isValidLegalForm`; `CreateDisabledButton` + EU `ValidateIf` in DTOs |
| 10 | Draft only; header picker; Neue Rechnung empty form; no sample home (D-06–D-08, D-07) | ✓ VERIFIED | `status` default `draft`; Combobox picker in `rechnung.tsx`; `invoice.test.tsx` Neue Rechnung empty; no `Stellen` / `issued` in desktop |
| 11 | Rules JSON SSOT; Postgres seeded from files; files win (D-14) | ✓ VERIFIED | `rule-seed.ts` OnModuleInit upsert + delete orphans from `packages/tax-engine/rules` |
| 12 | Invoice number RE-{year}-{n} per entity; currency from entity default changeable (D-20) | ✓ VERIFIED | `invoices.service.ts` ON CONFLICT counter; e2e `number` matches `/^RE-\d{4}-\d{3}$/`; currency PATCH test |
| 13 | After login open last edited invoice; zero invoices → empty form (D-17) | ✓ VERIFIED | `03-UAT.md` test 2 pass: live PATCH older draft `f137b034…` RE-2026-001; Tauri reload lands on that row; zero-invoice `Noch keine Rechnung erstellt` |

**Score:** 13/13 truths verified

### Decision Coverage

All trackable CONTEXT.md decisions (20/20) honored by shipped artifacts (`check.decision-coverage-verify`).

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `packages/tax-engine/src/index.ts` | `evaluate(facts)` export | ✓ VERIFIED | CJS package; Nest + Jest consume it |
| `packages/tax-engine/rules/*.json` | 23 matrix rules, Ajv-valid | ✓ VERIFIED | 23 files; no CH/UK ids |
| `apps/backend/prisma/schema.prisma` | Entity, Customer, Invoice, InvoiceItem, TaxRule, InvoiceCounter | ✓ VERIFIED | Models + migrations `20260822155017_*`, `20260822180000_*` |
| `apps/backend/src/entities/entities.controller.ts` | GET list + POST create | ✓ VERIFIED | RBAC `entity.read` / `entity.create` |
| `apps/backend/src/customers/customers.controller.ts` | GET by entityId + POST | ✓ VERIFIED | `kunde.read` / `kunde.write` |
| `apps/backend/src/invoices/invoices.controller.ts` | POST, GET list, GET id, PATCH | ✓ VERIFIED | Wired to `InvoicesService` |
| `apps/backend/src/tax/tax.controller.ts` | POST evaluate | ✓ VERIFIED | `facts-mapper.ts` + `evaluate()` |
| `apps/desktop/src/data/legal-forms.ts` | Country→legal form catalog | ✓ VERIFIED | US LLC + DE GmbH etc. |
| `apps/desktop/src/routes/entities.tsx` | List+panel create | ✓ VERIFIED | POST `/api/entities` |
| `apps/desktop/src/routes/kunden.tsx` | Entity-bound customer create | ✓ VERIFIED | Entity Combobox required |
| `apps/desktop/src/routes/rechnung.tsx` | Autosave, picker, live evaluate | ✓ VERIFIED | Full draft workflow |
| `apps/desktop/src/components/tax-rail.tsx` | Four canonical rail fields | ✓ VERIFIED | Live values + error/retry |
| `apps/desktop/src/routes/tax.tsx` | Nine TaxDecision fields | ✓ VERIFIED | `tax-live-store` subscription |
| `apps/desktop/src/auth/api.ts` | Bearer on `apiFetch` | ✓ VERIFIED | `setSessionToken` from `session-provider` |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `session-provider.tsx` | `api.ts` | `setSessionToken` on applySession/logout | ✓ WIRED | Bearer header on product fetch |
| `entities.tsx` | `/api/entities` | `apiFetch` POST/GET | ✓ WIRED | Create panel persists |
| `rechnung.tsx` | `/api/invoices` | POST/PATCH autosave | ✓ WIRED | 600ms debounce |
| `rechnung.tsx` | `/api/tax/evaluate` | invoice-shaped JSON body | ✓ WIRED | Not TransactionFacts from desktop |
| `tax.controller.ts` | `@clared/tax-engine` | `evaluate(facts)` | ✓ WIRED | Desktop never imports package |
| `rule-seed.ts` | `tax_rules` table | OnModuleInit file glob | ✓ WIRED | Deletes DB rows not in files |
| `tax-rail.tsx` | `tax-live-store` | `setTaxLiveState` from evaluate | ✓ WIRED | `/tax` shares store |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `entities.tsx` list | `entities` | GET `/api/entities` → Prisma | Yes | ✓ FLOWING |
| `rechnung.tsx` rail | `railTax` / `lastGoodTaxRef` | POST `/api/tax/evaluate` → engine | Yes | ✓ FLOWING |
| `tax.tsx` | `taxDecision` | `tax-live-store` from evaluate | Yes | ✓ FLOWING |
| `pdf-paper.tsx` | `SAMPLE_INVOICE` | Static fixture | Staged only | ⚠️ STATIC | Phase 4 PDF scope; peek chrome unchanged per UI-SPEC |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Tax-engine 23-class matrix + throw paths | Orchestrator: `pnpm --filter @clared/tax-engine test` | 25 passed | ✓ PASS |
| Backend unit + guard | Orchestrator: `pnpm --filter backend test` | 21 passed | ✓ PASS |
| Desktop Vitest (11 files) | Orchestrator: `pnpm --filter desktop test` | 43 passed | ✓ PASS |
| No skipped phase03 tests | `grep describe.skip` in `apps/desktop`, `apps/backend/test` | No matches | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no phase-declared `probe-*.sh` scripts; not a migration/tooling probe phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| ENT-01 | 03-01, 03-02, 03-03, 03-06 | Companies/customers; owner-only entity create | ✓ SATISFIED | APIs + RBAC + list+panel UI + e2e/desktop tests |
| INV-01 | 03-01, 03-02, 03-05, 03-06 | Persist/retrieve invoices + line items | ✓ SATISFIED | POST/GET/PATCH + autosave + picker |
| TAX-01 | 03-01, 03-02, 03-05, 03-06 | Live tax from evaluate | ✓ SATISFIED | `/api/tax/evaluate` + rail + `/tax` live store |
| TAX-02 | 03-01, 03-02, 03-04 | Library `evaluate`; extractable module | ✓ SATISFIED | `packages/tax-engine` + 23 rules + Nest import |

**Traceability note:** `.planning/REQUIREMENTS.md` traceability table still marks ENT-01–TAX-02 as Pending — documentation lag; code and tests satisfy all four IDs.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `evaluate.spec.ts` | TAX-02 | 25 | 0 | No — hand fixtures | Value + behavioral | ✓ OK |
| `entities.e2e-spec.ts` | ENT-01 | All | 0 | No | Behavioral (HTTP) | ✓ OK |
| `invoices.e2e-spec.ts` | INV-01 | All | 0 | No | Behavioral | ✓ OK |
| `tax.e2e-spec.ts` | TAX-01 | All | 0 | No | Value (canonical keys) | ✓ OK |
| `phase03-autosave.test.tsx` | INV-01 | 1 | 0 | No | Behavioral | ✓ OK |
| `phase03-tax-rail.test.tsx` | TAX-01 | 1 | 0 | No | Behavioral | ✓ OK |
| `phase03-entities.test.tsx` | ENT-01 | 2 | 0 | No | Behavioral | ✓ OK |
| `invoice.test.tsx` | INV-01/TAX-01 | 6 | 0 | No | Behavioral | ✓ OK |

**Disabled tests on requirements:** 0  
**Circular patterns detected:** 0  
**Insufficient assertions:** 0 (edge concurrency truths lack dedicated tests — advisory, not blocking)

### Prohibitions (plan flagged-unverified)

| Prohibition | Status | Evidence |
| ----------- | ------ | -------- |
| MUST NOT embed tax engine in desktop | ✓ Verified | No `@clared/tax-engine` import in `apps/desktop` |
| MUST NOT invent collision/priority winner | ✓ Verified | `evaluate.spec.ts` 0/2-match throws; no priority sort in engine |
| MUST NOT add CH/UK rule modules | ✓ Verified | 23 rules match matrix only |
| MUST NOT add entity/customer delete UI | ✓ Verified | No delete/Löschen in entity/customer routes |
| MUST NOT add customer email/notes | ✓ Verified | Customer forms omit those fields |
| MUST NOT present as open source / self-hosted | ✓ Verified | No matching copy in desktop |
| MUST NOT add Dialog/Sheet/toast variants | ✓ Verified | Routes use panel pattern; no Dialog/Sheet imports in routes |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `pdf-paper.tsx` | 1–4 | `SAMPLE_INVOICE` static | ℹ️ Info | Expected — PDF live data is Phase 4 |

No `TBD`/`FIXME`/`XXX` debt markers in phase product paths.

### Human Verification (completed 2026-08-22)

Both checkpoints passed in `03-UAT.md` (status: complete, commit `eb0e0c2`). See UAT test 1 (UI-SPEC E2–E8) and test 2 (D-17 multi-draft reload).

### Gaps Summary

No blocking gaps. Phase 3 goal delivered and UAT-complete. `.planning/REQUIREMENTS.md` Pending flags should be updated when milestone closes.

---

_Verified: 2026-08-22T19:26:00Z_
_Verifier: agent UAT session + gsd-verifier baseline_
