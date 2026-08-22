# Phase 3: Entities, Invoices & Live Tax - Research

**Researched:** 2026-08-22
**Domain:** NestJS 11 + Prisma 7 product CRUD, pnpm workspace tax-engine library, Tauri desktop live tax
**Confidence:** HIGH (locked stack + in-repo contracts); MEDIUM on legal-form catalog contents, EU ISO set, money column type

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)
- Tax-engine **microservice** (`POST /tax/evaluate` as its own service) — `TAX-03` / v2. Phase 3 package boundary is the extract seam.
- **CH/UK** (and other) rule modules **not present** as rows in `docs/clared-tax-rule-matrix.md` — `TAX-04`. UAE/US/EU classes that **are** in the matrix are in scope (D-13).
- Invoice **issue / Stellen**, PDF, multilingual TaxDecision blocks on paper — Phase 4 (`PDF-01`).
- Persist each evaluation to `audit_logs` — Phase 4 (`AUDT-01`).
- Desktop-embedded engine / offline evaluate — Phase 4 (`OFFL-01`).
- Tax **override** UI (`tax.override`).
- „Überall abmelden“, Stripe/seats — already Phase 2 / `SAAS-01` deferred.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENT-01 | User can manage companies (US LLC, EU-GmbH etc.) and customers/mandants; only owner may create entities | Prisma `entities`/`customers`; `POST/GET /api/entities`, `POST/GET /api/customers`; `PermissionsGuard` on `entity.create` / `kunde.write`; desktop list+panel (D-01) + disabled Anlegen (D-04); country→legal-form catalog (D-03) |
| INV-01 | User can create, persist, and retrieve invoices including line items (`POST /api/invoices`, `GET /api/invoices/:id`) | Nested Prisma create of `invoices` + `invoice_items`; year+counter numbering (D-20); PATCH for autosave (D-05); list endpoint for header picker (D-08); draft-only (D-06) |
| TAX-01 | User sees live tax preview from tax-engine evaluation of a TransactionFacts structure (`POST /api/tax/evaluate`) | Backend maps invoice-shaped body → facts (D-18); desktop 600ms debounce (UI-SPEC); rail four fields + `/tax` nine (D-12); failure keeps last good (D-11); no engine in desktop (D-10) |
| TAX-02 | Tax engine is a library with `evaluate(facts): decision`, integrated in the backend as module `tax-engine` | New `packages/tax-engine`; Ajv2020 vs `docs/clared-tax-rule-dsl-schema.json`; 23 matrix JSON rules + tests; Nest imports compiled CJS; files win over `tax_rules` (D-14, D-15) |
| UI-01 | Interactive mockups / UI-SPEC before implementation (carry-forward) | Already shipped: `03-UI-SPEC.md` status `approved`. Planner implements against it — do not re-author |
</phase_requirements>

## Summary

Phase 3 turns the Phase 1 mock + Phase 2 auth shell into the product loop: persist entities, customers, and draft invoices, then show live tax from an in-process library. UI-SPEC is already approved (600ms shared debounce, list+panel create, invoice-shaped evaluate). Backend is NestJS 11.2.1 + Prisma 7.9.1 with an empty schema (datasource/generator only) and a catch-all that 401s unknown routes including `/api/invoices`. Desktop `apiFetch` does not yet attach Bearer on product calls, and `SessionContext` does not expose the token.

**Primary recommendation:** Scaffold `@clared/tax-engine` as a compiled CommonJS workspace package (`evaluate` + file RuleStore + Ajv2020). Add Prisma models mapped to `entities`, `customers`, `invoices`, `invoice_items`, `tax_rules`. Register Nest controllers **before** `CatchAllController`. Enforce the existing RBAC catalog with a `PermissionsGuard`. Primary live-tax path is `POST /api/tax/evaluate` with an invoice-shaped body (D-18). Collision/priority-tie: if match count ≠ 1, fail the evaluation — do not pick a winner.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Entity / customer CRUD | API / Backend | Database / Storage | Persist + RBAC; desktop is a form over HTTP |
| `entity.create` enforcement | API / Backend | Browser / Client | Server 403 is source of truth (D-04); UI disables Anlegen |
| Invoice draft create / autosave / get-by-id | API / Backend | Database / Storage | INV-01 contract; nested items in one transaction |
| Invoice number year+counter | Database / Storage | API / Backend | Atomic `ON CONFLICT` increment; not assigned in the client |
| Invoice picker + last-edited landing | Browser / Client | API / Backend | D-08 / D-17 need a list + `updatedAt` sort the PRD examples omit |
| Map invoice payload → TransactionFacts | API / Backend | — | D-18: desktop must not build engine internals |
| `evaluate(facts): decision` | API / Backend (library) | — | D-10 / D-15: in-process `packages/tax-engine`; not desktop, not microservice |
| TaxRule JSON validate + file SSOT | API / Backend | Database / Storage | Ajv vs schema; seed/reload into `tax_rules`; files win (D-14) |
| Live tax rail + `/tax` | Browser / Client | API `/api/tax/evaluate` | Display last good TaxDecision; debounce; no embedded engine |
| Country → legal form catalog | Browser / Client | — | Static JSON; two Comboboxes (D-03). Server re-validates country/form pair |
| Auth session / Bearer | Browser / Client + API | Redis | Already Phase 2; product fetches must attach the existing token |
| PDF peek | Browser / Client | — | Stay staged (Phase 4) |

## Project Constraints (from .cursor/rules/)

| Rule | Directive for this phase |
|------|--------------------------|
| `ponytail.mdc` / `honey.mdc` | No new dep if stdlib/existing stack covers it. No lodash debounce, no Zod (class-validator already global), no `i18n-iso-countries` if a static JSON file is enough. One runnable check for non-trivial logic (engine matrix tests). |
| `karpathy-guidelines.mdc` | Surgical diffs. Do not invent collision logic. Do not re-theme the shell. |
| `authentik-mcp.mdc` | No Authentik admin UI / raw `/api/v3`. This phase does not change IdP groups; it **enforces** the catalog already on `/me`. |
| `coolify-mcp-cli.mdc` | Coolify deploys/logs/env via `user-coolify` MCP + `coolify` CLI — not SSH/dashboard. After schema migrate, redeploy the backend app. |
| `dbhub-coolify-postgres.mdc` | Coolify Clared Postgres reads/writes via `user-dbhub` only. Local OrbStack Postgres (`compose.clared.yml`) uses local Prisma/`psql`. Destructive SQL needs explicit confirm. |
| `caveman-activate.mdc` / `cavecrew-activate.mdc` | Agent prose; not a product constraint. |

Also: `config.json` has `workflow.nyquist_validation: true` and `security_enforcement: true` (ASVS L1). Include Wave 0 RED tests. Graphify is **disabled** — no graph.json this session.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| NestJS (`@nestjs/common` / `core` / `platform-express`) | 11.2.1 [VERIFIED: apps/backend/package.json:15-17] | HTTP API, guards, modules | Phase 2 lock; Express adapter already chosen |
| Prisma + `@prisma/client` + `@prisma/adapter-pg` | 7.9.1 [VERIFIED: apps/backend/package.json:20-21] | Models, migrate, nested writes | Phase 2 D-06; `provider = "prisma-client"` already in schema |
| `class-validator` + `class-transformer` | 0.15.1 / 0.5.1 [VERIFIED: apps/backend/package.json:22-23] | HTTP DTO validation | Global `ValidationPipe({ transform: true, whitelist: true })` already registered |
| React 19 + Vite 8 + react-router 8.3.0 + Tauri 2 | desktop package.json [VERIFIED: apps/desktop/package.json] | Signed-in shell | Phase 1 lock |
| `@clared/ui` + shadcn radix-nova | workspace; `style: "radix-nova"` [VERIFIED: packages/ui/components.json:3] | Input/Label/Select/Combobox this phase | UI-SPEC: add from `@shadcn` only |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ajv` | 8.20.0 [VERIFIED: npm registry 2026-08-22; Context7 `/ajv-validator/ajv`] | Draft 2020-12 TaxRule validation | `packages/tax-engine` only. Import `Ajv2020` from `ajv/dist/2020` |
| `ajv-formats` | 3.0.1 [VERIFIED: npm registry; Context7 `/ajv-validator/ajv-formats`] | `format: "date"` on `effective_from` / `effective_to` | `ajvFormats(ajv)` after constructing Ajv2020 |
| Jest 29 + ts-jest | already in backend | Nest unit + e2e | Keep; add `test/*.e2e-spec.ts` for product routes |
| Vitest 4.1.10 | already in desktop | UI tests | Keep; extend invoice/entities/tax tests |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Ajv2020 | Hand-rolled matcher | Forbidden by TaxRule SSOT contract; misses `additionalProperties: false` |
| Ajv2020 | Zod parse of rules | Second schema language; class-validator already covers HTTP; Zod would duplicate the JSON Schema |
| `evaluate` in `apps/backend/src/tax` | Workspace package | Violates D-15 extract seam for TAX-03 |
| Prisma `upsert` for invoice counters | `ON CONFLICT … RETURNING` | Upsert-create races raise P2002 [CITED: prisma.io unique key constraint errors on upserts] |
| `i18n-iso-countries` | Static JSON in repo | Extra dep for a catalog we own; ponytail: static file |
| lodash.debounce | `setTimeout` 600ms | UI-SPEC already pins 600ms; no extra dep |
| cmdk / Command palette Combobox | Official radix Combobox | UI-SPEC forbids third-party command kits |

**Installation:**

```bash
# tax-engine (new workspace package)
pnpm --filter @clared/tax-engine add ajv@8.20.0 ajv-formats@3.0.1

# desktop UI blocks (copy, not a runtime npm API)
npx shadcn add input label select combobox -c packages/ui

# backend already has Nest + Prisma + class-validator — add workspace dep only
# in apps/backend/package.json: "@clared/tax-engine": "workspace:*"
```

**Version verification:** `npm view ajv version` → `8.20.0`; `npm view ajv-formats version` → `3.0.1`; Prisma/Nest from lockfile as above. Publish dates: ajv created 2015, latest registry hit this session; ajv-formats last publish 2024-03-30.

Do **not** install `json-schema-to-typescript` — the TaxRule schema is small; hand-write types that match the quoted schema (Lever 1).

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| ajv | npm | since 2015-05-29 | ~370M/wk | github.com/ajv-validator/ajv | OK | Approved |
| ajv-formats | npm | since 2020-01-14 | ~124M/wk | github.com/ajv-validator/ajv-formats | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Postinstall scripts: none on either package (`npm view … scripts.postinstall` empty).

## Architecture Patterns

### System Architecture Diagram

```text
[Tauri WebView]
  login (Phase 2) ──Bearer──► [Nest API]
                                │
  Entities/Kunden list+panel ──► POST/GET /api/entities
                                 POST/GET /api/customers
                                │
  Rechnung canvas
    empty / last-edited (D-17)
    header picker (D-08)
    600ms autosave (D-05) ─────► POST /api/invoices
                                 PATCH /api/invoices/:id
                                 GET  /api/invoices
                                 GET  /api/invoices/:id
    600ms tax debounce (D-09) ─► POST /api/tax/evaluate  (invoice-shaped body, D-18)
                                      │
                                      ├─ mapDraftToFacts()
                                      └─ taxEngine.evaluate(facts)
                                            │
                                            ├─ load rules from files (SSOT)
                                            ├─ Ajv2020.validate(TaxRule)
                                            ├─ match conditions (0 or 1 only)
                                            └─ TaxDecision
                                      │
                                      └─ seed/upsert Postgres tax_rules (files win)
                                │
  Tax rail (4 fields) + /tax (9) ◄── TaxDecision JSON
  On 4xx/5xx: keep last good + rail error (D-11)

  CatchAllController (last) ── unauthenticated unknown path ── 401
```

### Recommended Project Structure

```
packages/tax-engine/
  package.json          # name @clared/tax-engine, main dist/index.js, type unset (CJS)
  tsconfig.json         # module: commonjs, declaration: true
  src/index.ts          # export function evaluate(facts: TransactionFacts): TaxDecision
  src/schema.ts         # types matching docs/clared-tax-rule-dsl-schema.json
  src/match.ts          # condition matcher; 0 or >1 matches → throw
  src/store.ts          # loadRules(dir) + validate each file with Ajv2020
  rules/*.json          # one file per matrix id (23)
  src/evaluate.spec.ts  # one test per matrix class

apps/backend/src/
  auth/permissions.decorator.ts
  auth/permissions.guard.ts
  entities/
  customers/
  invoices/
  tax/tax.module.ts     # imports evaluate from @clared/tax-engine
  tax/tax.controller.ts # POST api/tax/evaluate
  tax/facts-mapper.ts   # invoice-shaped DTO → TransactionFacts
  tax/rule-seed.ts      # OnModuleInit: files → tax_rules upsert
prisma/schema.prisma    # models + @@map table names
prisma/migrations/…     # new product migration (init is empty)

apps/desktop/src/
  auth/api.ts           # attach Bearer on apiFetch (gap)
  data/legal-forms.ts   # country → forms
  data/eu-countries.ts  # ISO set for VAT-required
  routes/entities.tsx / kunden.tsx / rechnung.tsx / tax.tsx
```

### Pattern 1: PermissionsGuard (Nest official RolesGuard shape)

**What:** `SetMetadata` + `Reflector.getAllAndOverride`; guard returns `false` → Nest throws 403.
**When to use:** Every product route. Skip when no metadata (keeps `/me` / `/health` working). Public routes still use existing `@Public()`.

```typescript
// Source: https://docs.nestjs.com/security/authorization + https://docs.nestjs.com/guards
import { SetMetadata } from "@nestjs/common";
export const PERMISSION_KEY = "permission";
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);

// Guard returning false → { "statusCode": 403, "message": "Forbidden resource", "error": "Forbidden" }
```

Catalog strings already in code (quote):

```12:32:apps/backend/src/auth/rbac.ts
const TENANT_PERMISSIONS = [
  "entity.read",
  "entity.create",
  "entity.update",
  "entity.delete",
  "kunde.read",
  "kunde.write",
  "kunde.delete",
  "invoice.read",
  "invoice.write",
  "invoice.issue",
  "invoice.export",
  "invoice.delete",
  "tax.evaluate",
  "tax.override",
  "tax.rules.write",
  "pdf.generate",
  "pdf.download",
  "audit.read",
  "org.settings",
] as const;
```

Use **`entity.create`** on `POST /api/entities` (owner + platform only). Use **`kunde.write`** on customer create. Use **`invoice.write`** on POST/PATCH invoices. Use **`invoice.read`** on GET. Use **`tax.evaluate`** on evaluate (all catalog roles including viewer). Do not enforce `invoice.issue` / `tax.override` in UI or routes this phase.

Register product controllers **before** catch-all:

```4:16:apps/backend/src/http/catch-all.controller.ts
@Public()
@Controller()
export class CatchAllController {
  @All("{*path}")
  unmatched(@Req() req: { url?: string }): never {
    const path = req.url?.split("?")[0] ?? "";
    if (path.startsWith("/api/docs") || path === "/openapi.json") {
      throw new NotFoundException();
    }
    throw new UnauthorizedException();
  }
}
```

No global `/api` prefix — that would break `/health` and `/auth`. Use `@Controller("api/invoices")` etc. Existing e2e already expects unauthenticated `GET /api/invoices` → 401 [VERIFIED: apps/backend/test/auth.e2e-spec.ts:48-50].

### Pattern 2: Prisma models + nested invoice write

Schema today is datasource + generator only:

```1:9:apps/backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}
```

Init migration is empty (`-- This is an empty migration.`). Add a **new** migrate, do not rewrite the empty init.

Use `String @id @default(uuid())` [CITED: prisma.io schema reference uuid()]. Json scalar → PostgreSQL jsonb [CITED: prisma.io Json default type mappings]. Nested `create` / `createMany` is one transaction [CITED: prisma.io relation-queries + transactions]. `@@map("entities")` etc. so physical names match PROJECT.md: `entities`, `customers`, `invoices`, `invoice_items`, `tax_rules`.

Recommended fields (planner may rename columns; tables must match that list):

- `Entity`: `name`, `country` (ISO alpha-2), `legalForm`, `address`, `vatId` optional, `currencyDefault` (for D-20), `createdAt`/`updatedAt`
- `Customer`: `entityId` required FK (D-02), `name`, `country`, `address`, `vatId` optional
- `Invoice`: `entityId`, `customerId` (nullable until first identity fill), `number` nullable until first persist, `date`, `dueDate`, `currency`, `supplyType` default `service` (not in UI — see Discretion), `updatedAt` for D-17
- `InvoiceItem`: `bezeichnung`, `menge`, `einzelpreis`, `netto` (server computes `menge * einzelpreis`)
- `TaxRule`: `ruleId` + `version` unique, `body Json`, optional `effectiveFrom`/`effectiveTo`
- Extra implementation table `invoice_counters` (`entityId`, `year`, `last`) — not in PROJECT.md list; see Assumptions

Customer cannot exist without `entityId` (DB FK + D-02).

### Pattern 3: Invoice number (per-entity year)

Discretion preference: per-entity year sequence. Do **not** use Prisma `upsert` as the only increment — concurrent creates of a missing counter row raise P2002 [CITED: prisma.io unique key constraint errors on upserts].

Use tagged `$queryRaw` inside `$transaction` [CITED: prisma.io raw queries — tagged template, not string concat]:

```sql
INSERT INTO invoice_counters (entity_id, year, last)
VALUES ($1, $2, 1)
ON CONFLICT (entity_id, year)
DO UPDATE SET last = invoice_counters.last + 1
RETURNING last;
```

[CITED: postgresql.org/docs/current/sql-insert.html — `ON CONFLICT DO UPDATE` + `RETURNING` sees inserted or updated row]

Format (discretion): `RE-{year}-{n}` padded to 3, matching fixture `RE-2026-001` [VERIFIED: apps/desktop/src/data/sample-invoice.ts:33]. Unique: `@@unique([entityId, number])`.

### Pattern 4: `evaluate(facts): decision` — match count must be 1

TaxRule SSOT required keys and effect enum [VERIFIED: docs/clared-tax-rule-dsl-schema.json:34-56]:

```json
"tax_liability_party": { "type": "string", "enum": ["supplier", "customer"] }
```

```json
"required": ["rule_id", "version", "conditions", "effect"]
```

```json
"additionalProperties": false
```

TransactionFacts minimum (architecture doc, conceptual — implement as TS types) [VERIFIED: docs/clared-tax-engine-architecture.md:15-31]: `supplier_entity_id`, `customer_entity_id`, `supplier_country`, `customer_country`, `supplier_is_business`, `customer_is_business`, `supplier_vat_registered`, `customer_vat_registered`, `supplier_vat_id`, `customer_vat_id`, `supply_type`, `channel`, `transaction_date`, `amount`, `currency`.

TaxDecision nine UI fields already in desktop [VERIFIED: apps/desktop/src/data/sample-invoice.ts:1-10]:

```ts
place_of_supply_country
tax_liability_party: "supplier" | "customer"
invoice_tax_rate
invoice_tax_shown
reverse_charge_flag
legal_reference
invoice_text_block_id
applied_rule_id
applied_rule_version
```

Architecture also lists `source_citation` and `audit_trace` [VERIFIED: docs/clared-tax-engine-architecture.md:48-49]. Include them on the object (empty arrays ok). Do **not** persist `audit_logs` this phase.

**Collision:** PRD silent; PROJECT.md: do not invent. Engine collects matches; **exactly one** → apply `effect`; **0 or >1** → throw typed error → HTTP 422. Tests must make each matrix fixture match exactly one JSON rule. Do not sort by `priority`. `priority` may be stored (schema has it) but unused for selection.

**Ambiguous matrix cells** (`local_rate`, `0_or_export`, `false_or_true`, `supplier_or_customer`, …): each JSON rule + test uses **one concrete exemplar** (e.g. AT domestic `invoice_tax_rate: 20`, intra-EU B2B service `0` + `reverse_charge_flag: true`). Do not encode `0_or_export` as a runtime union.

Matrix rule ids that MUST have JSON + tests (23 rows) [VERIFIED: docs/clared-tax-rule-matrix.md:33-53]:

`EU_DOMESTIC_B2B_SERVICE`, `EU_DOMESTIC_B2C_SERVICE`, `EU_INTRACOMM_B2B_SERVICE`, `EU_INTRACOMM_B2C_DIGITAL`, `EU_EXPORT_SERVICE_TO_THIRD`, `EU_EXPORT_GOODS_TO_THIRD`, `THIRD_TO_EU_B2B_SERVICE`, `THIRD_TO_EU_B2C_DIGITAL`, `US_TO_EU_B2B_SERVICE`, `US_TO_EU_B2C_DIGITAL`, `EU_TO_US_B2B_SERVICE`, `EU_TO_US_B2C_DIGITAL`, `UAE_TO_EU_B2B_SERVICE`, `UAE_TO_EU_B2B_DIGITAL`, `UAE_TO_EU_B2C_DIGITAL`, `EU_TO_UAE_B2B_SERVICE`, `EU_TO_UAE_B2B_DIGITAL`, `EU_TO_UAE_B2C_DIGITAL`, `EU_TO_EU_B2B_GOODS_INTRACOMM`, `EU_TO_EU_B2C_GOODS_INTRACOMM`, `DOMESTIC_SPECIAL_PROPERTY`, `DOMESTIC_SPECIAL_EVENT`, `THIRD_TO_THIRD_B2B_SERVICE`.

Ajv:

```javascript
// Source: https://github.com/ajv-validator/ajv (Ajv2020 + ajv-formats)
import Ajv2020 from "ajv/dist/2020"
import addFormats from "ajv-formats"
const ajv = new Ajv2020()
addFormats(ajv)
```

### Pattern 5: Desktop live tax + autosave

UI-SPEC debounce **600ms** for both [VERIFIED: .planning/phases/03-entities-invoices-live-tax/03-UI-SPEC.md:179 and :213]. Share one pause. `setTimeout` in `useEffect` cleanup — no debounce package.

Evaluate **body, not id** (D-18 + discretion). Incomplete identity (no seller/customer) → skip evaluate or 422; UI keeps em dash `—` until first success [VERIFIED: 03-UI-SPEC.md:216].

Rail four `dt` keys must stay canonical English [VERIFIED: apps/desktop/src/components/tax-rail.tsx:15-28]: `invoice_tax_rate`, `reverse_charge_flag`, `legal_reference`, `applied_rule_id`. `/tax` already enumerates all nine keys [VERIFIED: apps/desktop/src/routes/tax.tsx:3-13].

**Bearer gap:** `apiFetch` does not set `Authorization` unless the caller does [VERIFIED: apps/desktop/src/auth/api.ts:38-47]. `SessionContextValue` has `me` but not `token` [VERIFIED: apps/desktop/src/auth/session-provider.tsx:21-31, 252-263]. Planner: module-level `setSessionToken` from `applySession` (same pattern as `setOnUnauthorized`) so product `apiFetch` always sends `Bearer`. Do not put the token in visible UI.

**RBAC fixture gap:** `signedInOwner.permissions` is `[]` [VERIFIED: apps/desktop/src/__tests__/auth-signed-in.ts:10-17]. Owner UI tests must include `"entity.create"` / `"invoice.write"` / `"tax.evaluate"`.

### Pattern 6: Workspace CJS package + Docker

`pnpm-workspace.yaml` already has `packages/*` [VERIFIED: pnpm-workspace.yaml:1-3]. Nest `compilerOptions.module` is `"commonjs"` and `rootDir` is `./src` [VERIFIED: apps/backend/tsconfig.json:3, tsconfig.build.json:4]. Nest will **not** compile `packages/tax-engine/src`. Ship `dist/index.js` (CJS) and `"main": "./dist/index.js"`.

Dockerfile today copies only the backend package [VERIFIED: apps/backend/Dockerfile:11-16]:

```
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter ./apps/backend...
COPY apps/backend apps/backend
```

Planner **must** COPY `packages/tax-engine` (package.json before install, sources before build), build it, then `nest build`. Coolify image otherwise cannot resolve `@clared/tax-engine`. Copy `rules/*.json` into the image (files SSOT at runtime).

### Pattern 7: shadcn radix Combobox / Input / Label / Select

Install into `packages/ui` (`-c packages/ui`). Style is `radix-nova` [VERIFIED: packages/ui/components.json:3]. Official radix Combobox pieces: `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxEmpty`, `ComboboxList`, `ComboboxItem` [CITED: ui.shadcn.com/docs/components/radix/combobox]. `ComboboxInput disabled` for “Zuerst Land wählen” / “Zuerst Entity wählen”. Accessible name via `Label` + `htmlFor` — placeholder is not a name [CITED: shadcn accessibility]. Export new components from `packages/ui/src/index.ts`. Do **not** add Button CVA variants (UI-SPEC). Do **not** add Dialog/Sheet/toast.

List row hover: change live `hover:bg-accent` on entity/kunden rows to `hover:bg-muted` (UI-SPEC color correction).

### Anti-Patterns to Avoid

- **Desktop-built TransactionFacts:** violates D-18.
- **First-match / highest-priority wins:** invents collision logic.
- **Embedding engine in Tauri:** violates D-10; TAX-03 extract would fork.
- **Global Nest prefix `api`:** breaks `/health` `/auth` `/me`.
- **Prisma Float for money:** rounding; use `Decimal` or integer cents (see Assumptions).
- **Orphan customers:** no `entityId` (D-02).
- **Create dialog / `/entities/new`:** violates D-01.
- **Hide Anlegen for non-owners:** violates D-04.
- **Evaluate-by-id only:** races unsaved drafts.
- **Seed DB as SSOT:** files must overwrite (D-14).
- **CH/UK rule files:** TAX-04 / D-13.
- **`tax.override` UI or `invoice.issue`:** deferred.
- **Rewrite empty init migration:** add a new dated migration.
- **`json-schema-to-typescript` / Zod / lodash:** extra deps for solved problems.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON Schema 2020-12 validate | Custom walker | `Ajv2020` + `ajv-formats` | Draft 2020-12 vocab + `format: date` |
| HTTP DTO validation | Manual ifs | existing `ValidationPipe` + class-validator | Already global whitelist |
| Permission 403 | Ad-hoc if in each controller | Nest `SetMetadata` + guard | Official 403 when guard returns false |
| UUID primary keys | `crypto.randomUUID` per model | Prisma `@default(uuid())` | ORM default |
| Invoice counter under concurrency | `MAX(number)+1` without lock | `INSERT ON CONFLICT DO UPDATE RETURNING` | Atomic in Postgres |
| Debounce | lodash | `setTimeout` 600ms | UI-SPEC |
| Combobox search | custom filter popover | shadcn radix Combobox | UI-SPEC + a11y |
| Country names | new npm locale pack | static JSON (DE labels, ISO stored) | Catalog is product data |

**Key insight:** The expensive custom piece is the **condition matcher + 23 fixtures**, not infrastructure. Keep the engine a pure function over validated JSON.

## Common Pitfalls

### Pitfall 1: Nest cannot compile the workspace package
**What goes wrong:** `Cannot find module '@clared/tax-engine'` at `node dist/main.js`, or tsc `rootDir` errors.
**Why:** `tsconfig.build.json` `rootDir` is `./src`.
**How to avoid:** Prebuild CJS `dist`; Dockerfile COPY + build tax-engine first.
**Warning signs:** Coolify start crash after adding the workspace dep.

### Pitfall 2: Catch-all still 401s new routes
**What goes wrong:** Authenticated `POST /api/invoices` returns 401.
**Why:** `CatchAllController` is `@Public()` and registered last — if it is not last, or path mismatch, it swallows.
**How to avoid:** Controllers array: product controllers, then CatchAll. Keep `@Controller("api/invoices")` without a leading slash mismatch.
**Warning signs:** e2e 401 with a valid Bearer.

### Pitfall 3: Prisma upsert P2002 on first invoice of the year
**What goes wrong:** Two “Neue Rechnung” in parallel → unique violation on counters.
**Why:** upsert checks existence then create.
**How to avoid:** `ON CONFLICT DO UPDATE RETURNING`.
**Warning signs:** 500 on first two drafts same entity/year.

### Pitfall 4: PrismaService `max: 1`
**What goes wrong:** Autosave + evaluate + list serialize; interactive transaction waits then times out (default 5s).
**Why:** Phase 2 pool is `max: 1` [VERIFIED: apps/backend/src/prisma/prisma.service.ts:13-18].
**How to avoid:** Raise pool for product traffic (e.g. `max: 10`) when adding writes. Mention in the Prisma task.
**Warning signs:** Random 500s under two in-flight requests.

### Pitfall 5: Signed-in path still shows SAMPLE_INVOICE tax
**What goes wrong:** D-17 / UI-SPEC fail; tests still assert `eu-b2b-reverse-charge` on boot.
**Why:** `RechnungScreen` / `TaxRail` / `TaxScreen` read `SAMPLE_INVOICE` today.
**How to avoid:** Sample stays a **test fixture only**. Landing = last `updatedAt` or empty form. Remove Demo: Bereit/Laden/Fehler and „Beispielrechnung anzeigen“.
**Warning signs:** `invoice.test.tsx` / `demo-states.test.tsx` still green without API mocks.

### Pitfall 6: `supply_type` missing from UI but required by engine
**What goes wrong:** Every evaluate is wrong or 422.
**Why:** Line cards are four fields only (Bezeichnung, Menge, Einzelpreis, Netto) [VERIFIED: apps/desktop/src/components/line-item-card.tsx:24-40]. Architecture `supply_type` is on facts. Root CONTEXT.md says tax **per Position**; Phase 3 D-12 is **document-level**. Honor D-12.
**How to avoid:** Persist invoice-level `supplyType` default `"service"`; mapper copies it. Do not add per-line tax on cards (Phase 1 D-18).
**Warning signs:** Engine tests pass with explicit facts; live preview never matches intra-EU goods.

### Pitfall 7: Facts mapper treats missing VAT as B2B
**What goes wrong:** B2C digital rules never fire.
**How to avoid:** `customer_is_business` / `customer_vat_registered` = VAT ID present; entity with legal form is always supplier business; `supplier_vat_registered` = entity VAT ID present. EU VAT ID required in DTO when country ∈ EU set.
**Warning signs:** Domestic B2C fixture never selected.

### Pitfall 8: Files vs DB drift
**What goes wrong:** Operator edits `tax_rules` in Postgres; evaluate uses stale or mixed rules.
**How to avoid:** `OnModuleInit` reload from `rules/*.json` (upsert by `rule_id`+`version`, delete DB rows not in files). No rules-write UI (`tax.rules.write` unused).
**Warning signs:** Tests pass on files; production evaluate differs.

## Code Examples

### Nested invoice create

```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries
const invoice = await prisma.invoice.create({
  data: {
    entityId,
    currency,
    items: {
      createMany: {
        data: items.map((row) => ({
          bezeichnung: row.bezeichnung,
          menge: row.menge,
          einzelpreis: row.einzelpreis,
          netto: row.menge * row.einzelpreis,
        })),
      },
    },
  },
  include: { items: true },
});
```

PATCH: `$transaction` → `invoiceItem.deleteMany({ invoiceId })` + `createMany` + `invoice.update`. Last-write-wins; no If-Match this phase (YAGNI).

### Interactive transaction

```ts
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
await prisma.$transaction(async (tx) => {
  const rows = await tx.$queryRaw<{ last: number }[]>`…ON CONFLICT… RETURNING last`;
  return tx.invoice.create({ data: { number: format(year, rows[0].last), … } });
});
```

### Evaluate public API

```ts
// Contract: docs/clared-tax-engine-architecture.md §7 + TAX-02
export function evaluate(facts: TransactionFacts): TaxDecision {
  const rules = loadRules(rulesDir); // Ajv-validated
  const matched = rules.filter((rule) => matches(rule.conditions, facts));
  if (matched.length !== 1) {
    throw new EvaluateError("no_unique_match");
  }
  return decisionFrom(matched[0], facts);
}
```

### Desktop debounce (aligned)

```ts
// UI-SPEC 600ms; D-05 + D-09
useEffect(() => {
  const t = window.setTimeout(() => {
    void saveDraft(draft);
    void postEvaluate(draft);
  }, 600);
  return () => window.clearTimeout(t);
}, [draft]);
```

Skip evaluate until seller + customer present; still autosave partial drafts.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma 6 `prisma-client-js` | Prisma 7 `provider = "prisma-client"` + adapter-pg | Phase 2 | Keep; do not revert |
| Tax engine later / microservice | Integrated library Variante 1 | PRD + D-15 | `packages/tax-engine` now |
| cmdk Command combobox | shadcn radix Combobox | shadcn current docs | UI-SPEC radix-nova |
| Ajv default draft-07 | `Ajv2020` from `ajv/dist/2020` | Ajv 8 | Required by schema `$schema` draft/2020-12 |
| Phase 1 filled sample home | Last edited draft / empty | D-17 replaces D-22 | Landing + tests change |

**Deprecated/outdated:**
- RESEARCH aliases `rate` / `reverse_charge` / `legal_text` — never use; canonical names above.
- Demo: Bereit / Laden / Fehler — remove (UI-SPEC).
- „Wird in Phase 3 aktiviert“ / „Beispielrechnung anzeigen“ — replace with RBAC hints / remove.
- Phase 2 D-05 “do not scaffold packages/tax-engine” — **do it now**.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | EU VAT-required set = current EU-27 ISO alpha-2 (no CH/UK/NO) | D-19 / Discretion | Wrong countries hide or require USt-IdNr. Confirm list in legal-forms data file. |
| A2 | Legal-form catalog = common forms per ISO country (DE GmbH/UG/AG, US LLC/C-Corp/S-Corp, AE LLC, …) | D-03 | User may want a longer official register. Ship searchable JSON; extend later without engine changes. |
| A3 | Extra table `invoice_counters` is allowed besides PROJECT.md list | Pattern 3 | If forbidden, store `lastInvoiceSeq` on Entity per year as JSON — worse. Prefer counters table. |
| A4 | No `tenant_id` — instance-global rows; RBAC is capability not row-level (SAAS-01 deferred) | ENT/INV | Multi-tenant leak if two customers share one Coolify later. v2 problem. |
| A5 | Money columns `Decimal(12,2)` (Prisma Decimal) not integer cents | Invoice items | If planner prefers cents, keep one type only — never Float. |
| A6 | Invoice-level `supplyType` default `"service"`; not shown in UI | Pitfall 6 | Goods/property/digital live preview needs a later field. Document-level tax stays. |
| A7 | `channel` facts default `"direct"` | Facts mapper | Marketplace/saas_subscription rules unused until UI exists. |
| A8 | Number format `RE-{year}-{n}` zero-padded 3 | D-20 / SAMPLE | User may want no prefix; change format in one formatter. |
| A9 | PATCH `/api/invoices/:id` + GET list are in scope though PRD examples only show POST create + GET by id | INV-01 / D-05 / D-08 | Strict reading of PRD would block autosave and picker. Discretion: add them. |
| A10 | Evaluate 422 on 0 or >1 match is not a “collision algorithm” | TAX-02 | If discuss-phase later defines priority, replace the throw. Do not pre-implement. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Exact country → legal-form rows**
   - What we know: D-03 two-step picker; ISO stored; German display names (UI-SPEC).
   - What's unclear: official form names per jurisdiction.
   - Recommendation: ship a static JSON covering EU-27 + US + AE + a generic “Sonstige” per other ISO country; planner does not scrape government registers.

2. **GET/PATCH surface vs PRD examples**
   - What we know: PRD lists `POST /api/invoices`, `GET /api/invoices/:id`, `POST /api/tax/evaluate`, `GET /api/entities`.
   - What's unclear: list + update + customers + entity create paths are required by D-01/D-05/D-08 but not named.
   - Recommendation: add `POST /api/entities`, `GET /api/entities/:id`, `POST /api/customers`, `GET /api/customers?entityId=`, `GET /api/invoices`, `PATCH /api/invoices/:id`. Keep PRD four as the documented core.

3. **Root glossary vs Phase 3 tax grain**
   - What we know: `CONTEXT.md` says TaxDecision **pro Position**; Phase 1/3 UI is document-level (D-12).
   - What's unclear: when per-line tax returns.
   - Recommendation: honor D-12 this phase; do not add Leistungsart on line cards.

4. **Prisma pool size**
   - What we know: `max: 1` today.
   - Recommendation: raise in the schema/product plan (not a user-facing decision).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Nest + Vite | ✓ | v26.7.0 | — |
| pnpm | workspace | ✓ | 11.15.1 | — |
| Prisma CLI | migrate | ✓ | 7.9.1 | — |
| PostgreSQL (local OrbStack /tmp:5432) | Prisma migrate + e2e | ✓ | accepting | compose.clared.yml `postgres:16-alpine` |
| Redis | sessions (existing) | ioredis in app; `redis-cli` missing | — | MemoryStore in AUTH_TEST_MODE (existing e2e) |
| Docker / OrbStack | local DB | ✓ | Engine 29.7.2, context orbstack | — |
| Coolify CLI | prod deploy | ✗ (`coolify` not on PATH) | — | `user-coolify` MCP |
| Authentik | login (existing) | MCP `user-authentik` | — | no IdP work this phase |
| Higgsfield | empty-state art | reuse Phase 1 PNG | — | UI-SPEC: do not generate new art |

**Missing dependencies with no fallback:** none for local implementation.

**Missing dependencies with fallback:** Coolify CLI → MCP; redis-cli → app ioredis / test MemoryStore.

Step 2.5 Runtime State Inventory: **omitted** (not a rename/refactor/migration-of-names phase). New tables only. Coolify prod schema is still auth-only empty init — first product migrate via `prisma migrate deploy` on next Coolify start.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Backend: Jest 29 + ts-jest (Nest); tax-engine: Jest in the package or `node:test` — prefer Jest to match backend. Desktop: Vitest 4.1.10 |
| Config file | `apps/backend/jest.config.cjs`, `apps/backend/test/jest-e2e.json`; desktop `vitest` via `apps/desktop/package.json` `"test": "vitest run"` |
| Quick run command | `pnpm --filter backend test -- rbac.spec.ts` / `pnpm --filter desktop test -- src/__tests__/invoice.test.tsx` |
| Full suite command | `pnpm --filter backend test && pnpm --filter backend test:e2e && pnpm --filter @clared/tax-engine test && pnpm --filter desktop test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENT-01 | Owner POST entity 201; viewer 403; list GET | e2e | `pnpm --filter backend test:e2e -- entities` | ❌ Wave 0 |
| ENT-01 | Customer requires entityId; 400 if missing | e2e | same | ❌ Wave 0 |
| ENT-01 | Anlegen disabled without `entity.create`; hint copy | unit (vitest) | `pnpm --filter desktop test -- entities` | ❌ Wave 0 (button exists, wrong copy) |
| INV-01 | POST invoice + items; GET by id returns items | e2e | `pnpm --filter backend test:e2e -- invoices` | ❌ Wave 0 (only unauth 401 exists) |
| INV-01 | Number assigned per entity/year; unique | e2e | same | ❌ Wave 0 |
| TAX-01 | POST /api/tax/evaluate invoice body → canonical TaxDecision | e2e | `pnpm --filter backend test:e2e -- tax` | ❌ Wave 0 |
| TAX-01 | Desktop keeps last good on 422; shows error copy | unit (vitest) | `pnpm --filter desktop test -- tax-rail` | ❌ Wave 0 |
| TAX-02 | `evaluate(facts)` matches each of 23 matrix classes | unit | `pnpm --filter @clared/tax-engine test` | ❌ Wave 0 |
| TAX-02 | 0 matches and 2 matches throw (no silent pick) | unit | same | ❌ Wave 0 |
| UI-01 | UI-SPEC already approved | manual/n/a | — | ✅ `03-UI-SPEC.md` |

Existing tests that **must be rewritten** (will go red when Demo/sample landing dies): `apps/desktop/src/__tests__/demo-states.test.tsx`, `invoice.test.tsx` (sample tax on Rechnung), `screens.test.tsx` (sample `/tax`), `CreateDisabledButton` copy assertions if any.

### Sampling Rate

- **Per task commit:** targeted Jest or Vitest file (`-x` / file path)
- **Per wave merge:** backend unit + e2e (AUTH_TEST_MODE) + tax-engine unit + desktop vitest
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/backend/test/entities.e2e-spec.ts` — ENT-01
- [ ] `apps/backend/test/invoices.e2e-spec.ts` — INV-01
- [ ] `apps/backend/test/tax.e2e-spec.ts` — TAX-01
- [ ] `packages/tax-engine/src/evaluate.spec.ts` — TAX-02 (23 classes + no unique match)
- [ ] Desktop vitest for create panel, disabled Anlegen, autosave status, tax error keep-last
- [ ] `PermissionsGuard` unit spec next to `rbac.spec.ts`
- [ ] Framework install: none — Jest/Vitest already present; add `ajv` inside tax-engine

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (existing) | Bearer session; product routes behind `AuthGuard` |
| V3 Session Management | yes (existing) | Redis opaque 24h token; no new session type |
| V4 Access Control | **yes — this phase** | `PermissionsGuard` + catalog strings; UI disable is not sufficient |
| V5 Input Validation | yes | class-validator DTOs (`whitelist: true`); Ajv on TaxRule files; ISO country + legal-form allowlist |
| V6 Cryptography | no new | no extra hashing/JWT |

### Known Threat Patterns for Nest + Prisma + tax JSON

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Missing permission on create | Elevation of privilege | Guard on `entity.create` / `invoice.write`; e2e 403 for viewer |
| Mass assignment on PATCH | Tampering | ValidationPipe whitelist; forbid issued/status fields |
| SQL injection in counter SQL | Tampering | Prisma tagged `$queryRaw` only — never string concat |
| Untrusted TaxRule JSON | Tampering | Ajv2020 vs SSOT schema; `additionalProperties: false` on root; no operator UI |
| IDOR across tenants | Information disclosure | No tenant_id this phase (A4); all signed-in users share instance data — accepted until SAAS-01 |
| Tax decision spoof from client | Tampering | Desktop cannot send `TaxDecision`; server evaluates; no override UI |
| XSS via legal_reference | Tampering | React text nodes (existing `String(tax[field])`); do not `dangerouslySetInnerHTML` |

## Sources

### Primary (HIGH confidence — in-repo Read this session)

- `docs/clared-tax-rule-dsl-schema.json` — TaxRule required keys, effect enum, additionalProperties
- `docs/clared-tax-rule-matrix.md:33-53` — 23 rule class ids
- `docs/clared-tax-engine-architecture.md` — facts/decision/`evaluate` contract
- `apps/backend/src/auth/rbac.ts` — permission catalog
- `apps/backend/prisma/schema.prisma` — empty models
- `apps/desktop/src/data/sample-invoice.ts` — nine StagedTaxDecision fields
- `03-CONTEXT.md`, `03-UI-SPEC.md` (approved), Phase 2 CONTEXT/RESEARCH, PROJECT.md, PRD §3 endpoints
- `apps/backend/Dockerfile`, `tsconfig.json`, `app.module.ts`, `catch-all.controller.ts`, `api.ts`, `session-provider.tsx`

### Secondary (MEDIUM confidence — Context7 / official docs)

- `/websites/prisma_io` — nested writes, Json→jsonb, `$transaction`, uuid(), P2002 upsert race, tagged `$queryRaw`
- `/nestjs/docs.nestjs.com` — RolesGuard, SetMetadata, 403 when guard returns false, ValidationPipe whitelist
- `/ajv-validator/ajv` — Ajv2020 + ajv-formats
- `/websites/ui_shadcn` — radix Combobox pieces
- https://www.postgresql.org/docs/current/sql-insert.html — ON CONFLICT DO UPDATE + RETURNING
- https://pnpm.io/workspaces — workspace linking (`packages/*` already enabled)

### Tertiary (LOW confidence)

- Exact legal-form strings per country (A2)
- EU-27 membership list without fetching an official table this session (A1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions from lockfile + npm view + Phase 2 already shipped
- Architecture: HIGH — D-01–D-20 + UI-SPEC + existing Nest/Prisma/Tauri seams; MEDIUM on extra routes (A9) and counters table (A3)
- Pitfalls: HIGH — Dockerfile, catch-all, Bearer gap, sample-invoice landing, pool max:1 verified in source

**Research date:** 2026-08-22
**Valid until:** 2026-09-21 (30 days; Ajv/Nest/Prisma stable)

## Discretion recommendations (planner should lock these in PLAN.md)

1. Debounce **600ms** both (UI-SPEC).
2. Evaluate **invoice-shaped body only** (not id).
3. Invoice numbers **per entity + calendar year**, format `RE-{year}-{padded 3}`.
4. No email/notes on customers (UI-SPEC: mock does not show them).
5. Reuse `empty-state-hero.png`; no Higgsfield.
6. Match count ≠ 1 → 422, keep last good TaxDecision in UI.
7. `supplyType` default `service`, hidden.
8. Raise Prisma pool above 1 when enabling writes.
