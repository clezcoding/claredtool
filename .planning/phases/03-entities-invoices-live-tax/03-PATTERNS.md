# Phase 3: Entities, Invoices & Live Tax - Pattern Map

**Mapped:** 2026-08-22
**Files analyzed:** 42
**Analogs found:** 37 / 42

Planner copies excerpts below; do not invent Nest prefixes, collision ranking, or a second schema language.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/backend/src/auth/permissions.decorator.ts` | middleware | request-response | `apps/backend/src/auth/public.decorator.ts` | exact |
| `apps/backend/src/auth/permissions.guard.ts` | middleware | request-response | `apps/backend/src/auth/auth.guard.ts` | exact |
| `apps/backend/src/auth/permissions.guard.spec.ts` | test | request-response | `apps/backend/src/auth/rbac.spec.ts` | role-match |
| `apps/backend/src/entities/entities.module.ts` | config | request-response | `apps/backend/src/app.module.ts` | role-match |
| `apps/backend/src/entities/entities.controller.ts` | controller | CRUD | `apps/backend/src/me/me.controller.ts` + `auth.controller.ts` | role-match |
| `apps/backend/src/entities/entities.service.ts` | service | CRUD | `apps/backend/src/prisma/prisma.service.ts` | partial |
| `apps/backend/src/entities/dto/*.ts` | model | request-response | `apps/backend/src/auth/auth.controller.ts` `SessionDto` | exact |
| `apps/backend/src/customers/*` | controller/service | CRUD | same as entities | role-match |
| `apps/backend/src/invoices/*` | controller/service | CRUD | same as entities + Prisma nested write (RESEARCH) | role-match |
| `apps/backend/src/tax/tax.module.ts` | config | request-response | `apps/backend/src/app.module.ts` | role-match |
| `apps/backend/src/tax/tax.controller.ts` | controller | request-response | `apps/backend/src/auth/auth.controller.ts` | role-match |
| `apps/backend/src/tax/facts-mapper.ts` | utility | transform | — | none |
| `apps/backend/src/tax/rule-seed.ts` | service | batch | `apps/backend/src/redis/redis.service.ts` (`OnModuleDestroy`) | role-match |
| `apps/backend/prisma/schema.prisma` | model | CRUD | itself (extend; do not rewrite generator) | exact |
| `apps/backend/prisma/migrations/<new>_product/migration.sql` | migration | CRUD | `apps/backend/prisma/migrations/20260822014200_init/migration.sql` | role-match |
| `apps/backend/src/app.module.ts` | config | request-response | itself | exact |
| `apps/backend/src/prisma/prisma.service.ts` | service | CRUD | itself (`max: 1` → raise) | exact |
| `apps/backend/package.json` | config | — | itself (`"@clared/ui": "workspace:*"` analog in desktop) | exact |
| `apps/backend/Dockerfile` | config | — | itself | exact |
| `apps/backend/test/entities.e2e-spec.ts` | test | CRUD | `apps/backend/test/auth.e2e-spec.ts` | exact |
| `apps/backend/test/invoices.e2e-spec.ts` | test | CRUD | `apps/backend/test/auth.e2e-spec.ts` | exact |
| `apps/backend/test/tax.e2e-spec.ts` | test | request-response | `apps/backend/test/auth.e2e-spec.ts` | exact |
| `packages/tax-engine/package.json` | config | — | `packages/ui/package.json` | role-match |
| `packages/tax-engine/tsconfig.json` | config | — | `apps/backend/tsconfig.json` (CJS, not ui ESM) | role-match |
| `packages/tax-engine/src/index.ts` | utility | transform | — (contract: RESEARCH Pattern 4) | none |
| `packages/tax-engine/src/schema.ts` | model | transform | `docs/clared-tax-rule-dsl-schema.json` + `sample-invoice.ts` | partial |
| `packages/tax-engine/src/match.ts` | utility | transform | — | none |
| `packages/tax-engine/src/store.ts` | service | file-I/O | — | none |
| `packages/tax-engine/rules/*.json` | config | file-I/O | `docs/clared-tax-rule-matrix.md` ids | partial |
| `packages/tax-engine/src/evaluate.spec.ts` | test | transform | `apps/backend/src/auth/rbac.spec.ts` | role-match |
| `apps/desktop/src/auth/api.ts` | utility | request-response | itself (`fetchMe` Bearer) | exact |
| `apps/desktop/src/auth/session-provider.tsx` | provider | request-response | itself (`setOnUnauthorized`) | exact |
| `apps/desktop/src/data/legal-forms.ts` | config | transform | `apps/desktop/src/data/sample-invoice.ts` | role-match |
| `apps/desktop/src/data/eu-countries.ts` | config | transform | `apps/desktop/src/data/sample-invoice.ts` | role-match |
| `apps/desktop/src/routes/entities.tsx` | component | CRUD | itself (list + panel) | exact |
| `apps/desktop/src/routes/kunden.tsx` | component | CRUD | itself | exact |
| `apps/desktop/src/routes/rechnung.tsx` | component | CRUD | itself | exact |
| `apps/desktop/src/routes/tax.tsx` | component | request-response | itself | exact |
| `apps/desktop/src/components/tax-rail.tsx` | component | request-response | itself | exact |
| `apps/desktop/src/components/create-disabled-button.tsx` | component | request-response | itself | exact |
| `apps/desktop/src/components/invoice-empty-state.tsx` | component | request-response | itself | exact |
| `apps/desktop/src/components/line-item-card.tsx` | component | CRUD | itself | exact |
| `packages/ui/src/components/{input,label,select,combobox}.tsx` | component | request-response | `packages/ui/src/components/button.tsx` | role-match |
| `packages/ui/src/index.ts` | config | — | itself | exact |
| `apps/desktop/src/__tests__/auth-signed-in.ts` | test | — | itself (fill `permissions`) | exact |
| `apps/desktop/src/__tests__/invoice.test.tsx` | test | request-response | itself (rewrite landing) | exact |
| `apps/desktop/src/__tests__/screens.test.tsx` | test | request-response | itself | exact |
| `apps/desktop/src/__tests__/demo-states.test.tsx` | test | request-response | itself (delete Demo cases) | exact |

---

## Pattern Assignments

### `apps/backend/src/auth/permissions.decorator.ts` (middleware, request-response)

**Analog:** `apps/backend/src/auth/public.decorator.ts`

**Imports + SetMetadata** (lines 1-4):

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Copy this shape. RESEARCH names:

```typescript
export const PERMISSION_KEY = "permission";
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);
```

Do not invent a roles array decorator. One catalog string per route (`entity.create`, `kunde.write`, `invoice.write`, `invoice.read`, `tax.evaluate`).

---

### `apps/backend/src/auth/permissions.guard.ts` (middleware, request-response)

**Analog:** `apps/backend/src/auth/auth.guard.ts`

**Imports + Reflector.getAllAndOverride** (lines 1-27):

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { SessionUser } from "./session-user";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
```

**Auth pattern — session user already on request** (lines 28-43): AuthGuard attaches `request.user` with `permissions: string[]` (`session-user.ts` lines 1-10). PermissionsGuard runs **after** AuthGuard (both `APP_GUARD`). Skip when metadata missing (so `/me` / `/health` stay working). Return `false` when permission absent — Nest emits 403; do not throw `ForbiddenException` by hand.

**SessionUser shape** (`apps/backend/src/auth/session-user.ts` lines 1-10):

```typescript
export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  groups: string[];
  permissions: string[];
  primaryRole: string;
  iat?: number;
  hostname?: string;
};
```

**Catalog strings** (`apps/backend/src/auth/rbac.ts` lines 12-32) — reuse, do not duplicate:

```typescript
const TENANT_PERMISSIONS = [
  "entity.read",
  "entity.create",
  // ...
  "tax.evaluate",
  "tax.override",
  "tax.rules.write",
] as const;
```

Register in `app.module.ts` next to existing `APP_GUARD` (lines 26-30):

```typescript
{ provide: APP_GUARD, useClass: AuthGuard },
{
  provide: APP_PIPE,
  useValue: new ValidationPipe({ transform: true, whitelist: true }),
},
```

Add `{ provide: APP_GUARD, useClass: PermissionsGuard }` **after** AuthGuard so `request.user` exists.

---

### `apps/backend/src/entities/entities.controller.ts` + customers + invoices (controller, CRUD)

**Analog:** `apps/backend/src/me/me.controller.ts` (GET + AuthedRequest) and `apps/backend/src/auth/auth.controller.ts` (POST + DTO).

**Controller path — no global `/api` prefix.** Me controller (lines 1-18):

```typescript
import { Controller, Get, Req } from "@nestjs/common";
import { AuthedRequest } from "../auth/auth.guard";

@Controller("me")
export class MeController {
  @Get()
  me(@Req() request: AuthedRequest) {
    const user = request.user;
    return { /* ... permissions from session ... */ };
  }
}
```

Product controllers use `@Controller("api/entities")`, `@Controller("api/customers")`, `@Controller("api/invoices")`, `@Controller("api/tax")`. Leading slash mismatch with catch-all is a known pitfall.

**DTO + class-validator** (`auth.controller.ts` lines 15, 32-39, 98-101):

```typescript
import { IsOptional, IsString } from "class-validator";

class SessionDto {
  @IsString()
  ticket!: string;

  @IsOptional()
  @IsString()
  hostname?: string;
}

@Public()
@Post("session")
@HttpCode(HttpStatus.OK)
async session(@Body() body: SessionDto): Promise<{ token: string }> {
```

Product DTOs: same `class-validator` decorators, **not Zod**. Entity: required `name`, `country`, `legalForm`, `address`; `vatId` required when country ∈ EU set (custom `@ValidateIf` or class-validator `ValidateIf`). Customer: required `entityId`. Invoice PATCH: whitelist only draft fields; never `status` / issued.

**Error handling** — Nest HTTP exceptions already used (`UnauthorizedException`, `InternalServerErrorException` in auth.controller). Product routes: `NotFoundException` for missing id, `ForbiddenException` only if guard is skipped (prefer guard 403), `UnprocessableEntityException` (422) for tax no-unique-match. Do not wrap every handler in try/catch.

**Catch-all stays last** (`app.module.ts` lines 15-21):

```typescript
controllers: [
  HealthController,
  AuthController,
  MeController,
  DocsController,
  CatchAllController,
],
```

Insert `EntitiesController`, `CustomersController`, `InvoicesController`, `TaxController` **before** `CatchAllController`. Catch-all (`catch-all.controller.ts` lines 4-14) is `@Public()` and 401s unknown `/api/*` — existing e2e (`auth.e2e-spec.ts` lines 48-50) already asserts unauthenticated `GET /api/invoices` → 401; keep that case green.

---

### `apps/backend/src/entities/entities.service.ts` + customers + invoices (service, CRUD)

**Analog:** `apps/backend/src/prisma/prisma.service.ts` (inject PrismaClient). No existing domain service — first product write.

**Prisma 7 adapter client** (lines 1-21):

```typescript
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    super({
      adapter: new PrismaPg({
        connectionString,
        connectionTimeoutMillis: 400,
        idleTimeoutMillis: 200,
        max: 1,
        allowExitOnIdle: true,
      }),
    });
  }
```

**Must change this file:** raise `max` (RESEARCH: `max: 10`) in the same constructor. Do not spawn a second Prisma client.

Inject `PrismaService` into entity/customer/invoice services. Nested invoice create (RESEARCH Pattern 2 — no in-repo analog; copy this shape):

```typescript
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

PATCH: `$transaction` → `invoiceItem.deleteMany({ invoiceId })` + `createMany` + `invoice.update`. Last-write-wins.

**Invoice number** — tagged `$queryRaw` inside `$transaction` (no Prisma `upsert`). Analog for tagged SQL: none in repo; RESEARCH Pattern 3. Unique `@@unique([entityId, number])`. Format `RE-{year}-{n}` padded 3 (`sample-invoice.ts` line 33: `"RE-2026-001"`).

---

### `apps/backend/prisma/schema.prisma` (model, CRUD)

**Analog:** itself (lines 1-9). Keep generator; **add models; do not rewrite empty init migration**.

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}
```

`@@map("entities")`, `@@map("customers")`, `@@map("invoices")`, `@@map("invoice_items")`, `@@map("tax_rules")`. Extra `invoice_counters` allowed (RESEARCH A3). IDs: `String @id @default(uuid())`. Money: `Decimal(12,2)` never `Float`. Customer `entityId` required FK (D-02). New dated migration only — init SQL is `-- This is an empty migration.`

Config analog: `apps/backend/prisma.config.ts` — leave as-is (`schema`, `migrations.path`, `datasource.url`).

---

### `apps/backend/src/tax/tax.controller.ts` (controller, request-response)

**Analog:** `auth.controller.ts` POST JSON body + HttpCode.

`@Controller("api/tax")` + `@Post("evaluate")` + `@RequirePermission("tax.evaluate")`. Body = invoice-shaped DTO (D-18), **not** `TransactionFacts`. Map via `facts-mapper.ts` then `evaluate` from `@clared/tax-engine`. 422 on `EvaluateError("no_unique_match")`. Viewer has `tax.evaluate` (`rbac.ts` lines 42-48).

---

### `apps/backend/src/tax/rule-seed.ts` (service, batch)

**Analog:** Nest lifecycle in `redis.service.ts` lines 61-65 (`OnModuleDestroy`). Use `OnModuleInit` the same way:

```typescript
@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(KEY_VALUE_STORE) private readonly store: KeyValueStore,
  ) {}
```

Seed: load `packages/tax-engine/rules/*.json`, upsert `tax_rules` by `ruleId`+`version`, delete DB rows not in files (D-14 files win). No `tax.rules.write` route.

---

### `packages/tax-engine/*` (utility, transform + file-I/O)

**Package.json analog:** `packages/ui/package.json` for workspace name/`private` — **not** for module type. UI is `"type": "module"` + `"exports"` to `src`. Tax-engine must be **CJS compiled** because Nest `tsconfig.json` line 3 `"module": "commonjs"` and `tsconfig.build.json` `"rootDir": "./src"` will not compile `packages/tax-engine/src`.

```json
{
  "name": "@clared/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
```

Tax-engine instead: `"name": "@clared/tax-engine"`, **omit** `"type": "module"`, `"main": "./dist/index.js"`, `"types": "./dist/index.d.ts"`. Backend dep: `"@clared/tax-engine": "workspace:*"` — same string as desktop `"@clared/ui": "workspace:*"` (`apps/desktop/package.json` line 14).

**tsconfig analog:** `apps/backend/tsconfig.json` lines 2-12 (`module: commonjs`, `declaration: true`, `outDir: dist`). Do **not** copy `packages/ui/tsconfig.json` (`module: ESNext`, `noEmit: true`).

**Workspace:** `pnpm-workspace.yaml` already has `packages/*` — no edit.

**Public API** (no in-repo analog — RESEARCH Pattern 4):

```typescript
export function evaluate(facts: TransactionFacts): TaxDecision {
  const rules = loadRules(rulesDir);
  const matched = rules.filter((rule) => matches(rule.conditions, facts));
  if (matched.length !== 1) {
    throw new EvaluateError("no_unique_match");
  }
  return decisionFrom(matched[0], facts);
}
```

Ajv (no in-repo analog):

```javascript
import Ajv2020 from "ajv/dist/2020"
import addFormats from "ajv-formats"
const ajv = new Ajv2020()
addFormats(ajv)
```

**Types analog:** `apps/desktop/src/data/sample-invoice.ts` lines 1-11 (`StagedTaxDecision` nine fields). Engine TaxDecision must include those plus `source_citation` / `audit_trace` (empty arrays ok). Schema SSOT: `docs/clared-tax-rule-dsl-schema.json` (`required`: `rule_id`, `version`, `conditions`, `effect`; `additionalProperties: false` on root). Do not add `priority` to match selection.

**23 rule ids** (must exist as JSON + tests): `EU_DOMESTIC_B2B_SERVICE` … `THIRD_TO_THIRD_B2B_SERVICE` (RESEARCH lines 391). No CH/UK files.

**Unit test analog:** `apps/backend/src/auth/rbac.spec.ts` — Jest `describe`/`it`/`expect`, colocated `*.spec.ts`. `jest.config.cjs` `rootDir: src` `testRegex: ".spec.ts$"` — tax-engine needs its own jest config or package script; do not rely on backend `rootDir: src` to pick up the package.

---

### `apps/backend/Dockerfile` (config)

**Analog:** itself lines 11-22. Today:

```
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter ./apps/backend...
COPY apps/backend apps/backend
WORKDIR /app/apps/backend
RUN pnpm exec prisma generate && pnpm exec nest build && test -f dist/main.js
```

Must also COPY `packages/tax-engine/package.json` before install, COPY sources + `rules/*.json` before build, `pnpm --filter @clared/tax-engine build` before `nest build`. CMD already `prisma migrate deploy && node dist/main.js` (line 30) — keep.

---

### `apps/backend/test/*.e2e-spec.ts` (test, CRUD)

**Analog:** `apps/backend/test/auth.e2e-spec.ts` lines 1-50.

```typescript
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://prisma-test:unused@127.0.0.1:5432/clared";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.listen(0);
    // seed tickets via RedisService
  });
  afterAll(async () => { await app.close(); }, 15000);

  it("GET /api/invoices without Authorization returns 401", () => {
    return request(app.getHttpServer()).get("/api/invoices").expect(401);
  });
```

Copy: `AUTH_TEST_MODE`, ticket seed → `POST /auth/session` → Bearer on product routes. Owner groups `["clared-owner"]` (lines 13-18). Viewer 403: session with `["clared-viewer"]` then `POST /api/entities`. Health e2e (`health.e2e-spec.ts`) is the thinner `AppModule` bootstrap if no Redis tickets needed. Config: `test/jest-e2e.json` `testRegex: ".e2e-spec.ts$"` — new files picked up automatically.

---

### `apps/desktop/src/auth/api.ts` (utility, request-response)

**Analog:** itself. Gap: `apiFetch` (lines 38-47) does **not** attach Bearer; `fetchMe` / `logoutSession` / `replayLastRequest` do.

```typescript
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  lastRequest = { path, init };
  const res = await fetch(`${BASE}${path}`, init);
  if (res.status === 401) {
    onUnauthorized?.();
  }
  return res;
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
```

Copy `setOnUnauthorized` module-level setter (lines 11-16) as `setSessionToken`. Inside `apiFetch`, `headers.set("Authorization", \`Bearer ${token}\`)` when token present — same as `replayLastRequest` lines 22-26. Product calls use `apiFetch("/api/invoices", { method: "POST", ... })`. `ApiError` class (lines 29-36) for non-OK.

---

### `apps/desktop/src/auth/session-provider.tsx` (provider, request-response)

**Analog:** itself. `applySession` (lines 82-88) already holds the token in React state + `tokenRef` but **does not export it** (`SessionContextValue` lines 21-31 has `me`, not `token`). Do not put token on context for UI. Call `setSessionToken(nextToken)` from `applySession` (and clear on logout lines 240-244) — same pattern as `setOnUnauthorized` in the existing `useEffect` (lines 185-198).

Owner tests: `apps/desktop/src/__tests__/auth-signed-in.ts` lines 10-17 currently `permissions: []`. Fill `"entity.create"`, `"kunde.write"`, `"invoice.write"`, `"invoice.read"`, `"tax.evaluate"` so Anlegen enables.

---

### `apps/desktop/src/routes/entities.tsx` + `kunden.tsx` (component, CRUD)

**Analog:** themselves. List + panel under list (D-01). Do not add a dialog or `/entities/new`.

```tsx
import { Card, CardContent } from "@clared/ui";
import { useState } from "react";
import { CreateDisabledButton } from "../components/create-disabled-button";

export function EntitiesScreen() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold">Entities</h1>
        <CreateDisabledButton />
      </header>
      <ul>… row button data-testid="entity-row" …</ul>
      {selectedId ? (
        <Card data-testid="entity-detail" className="max-w-xl">
          <CardContent>… Name / Adresse / USt-IdNr. …</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
```

Create form **replaces** the detail `Card` slot (same `max-w-xl` panel). Keep `data-testid="entity-row"` / `entity-detail` / `kunden-row` / `kunden-detail`. Change row hover `hover:bg-accent` (entities.tsx line 25, kunden.tsx line 25) to `hover:bg-muted`.

**CreateDisabledButton analog** (`create-disabled-button.tsx` lines 1-12):

```tsx
import { Button } from "@clared/ui";

export function CreateDisabledButton() {
  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" disabled>
        Anlegen
      </Button>
      <p className="text-xs text-muted-foreground">Wird in Phase 3 aktiviert</p>
    </div>
  );
}
```

D-04: keep visible disabled + hint for non-owners. When `me.permissions` includes `entity.create` / `kunde.write`, render enabled Anlegen that opens the panel form. Replace hint copy `"Wird in Phase 3 aktiviert"` (screens.test.tsx line 43 asserts this — rewrite). Server still 403s.

Kunden: customer always needs entity (D-02). Combobox entity first, then form. No email/notes (discretion).

---

### `apps/desktop/src/routes/rechnung.tsx` (component, CRUD)

**Analog:** itself. Keep layout: canvas left + `TaxRail` right (`!empty && demo === "ready"` today line 172). Remove Demo: Bereit/Laden/Fehler (lines 50-70, 91-111) and `demo` state. D-17 landing = last `updatedAt` invoice or empty form — not `SAMPLE_INVOICE`.

**Empty state analog** (`invoice-empty-state.tsx` lines 1-24): reuse `/empty-state-hero.png`. Remove `onRestore` / „Beispielrechnung anzeigen“. „Neue Rechnung“ (rechnung.tsx lines 112-118) opens empty form; previous drafts stay in **header picker** (new `<select>`/`Combobox` in the header `Card`, not a nav item).

**Line items analog** (`line-item-card.tsx` + `BLANK_LINE` lines 13-18). Four fields only. Make cards writable (`input`/`Input`) so autosave has diffs. Server computes `netto`. No per-line tax (Phase 1 D-18).

**Debounce** — no lodash, no existing debounce helper. RESEARCH + UI-SPEC 600ms:

```ts
useEffect(() => {
  const t = window.setTimeout(() => {
    void saveDraft(draft);
    void postEvaluate(draft);
  }, 600);
  return () => window.clearTimeout(t);
}, [draft]);
```

Skip evaluate until seller + customer present; still autosave partial drafts. Number is server-assigned — header Rechnungsnummer input (lines 124-130) becomes read-only once assigned. Currency defaults from entity, changeable.

---

### `apps/desktop/src/components/tax-rail.tsx` + `routes/tax.tsx` (component, request-response)

**Analog:** themselves. Canonical `dt` keys stay English.

Rail four fields (`tax-rail.tsx` lines 14-29): `invoice_tax_rate`, `reverse_charge_flag`, `legal_reference`, `applied_rule_id`.

`/tax` nine keys (`tax.tsx` lines 3-13):

```typescript
const TAX_FIELDS: (keyof StagedTaxDecision)[] = [
  "place_of_supply_country",
  "tax_liability_party",
  "invoice_tax_rate",
  "invoice_tax_shown",
  "reverse_charge_flag",
  "legal_reference",
  "invoice_text_block_id",
  "applied_rule_id",
  "applied_rule_version",
];
```

Swap `SAMPLE_INVOICE.taxDecision` for last-good evaluate result. On 4xx/5xx: keep last good; small error in rail — **do not** reuse full-page `ErrorState` (`error-state.tsx` blocks typing). Until first success, em dash `—`. Render with `String(tax[field])` text nodes; no `dangerouslySetInnerHTML`. PDF peek `Link to="/pdf"` stays staged.

---

### `apps/desktop/src/data/legal-forms.ts` + `eu-countries.ts` (config, transform)

**Analog:** `apps/desktop/src/data/sample-invoice.ts` — static typed export, ISO stored (`buyer.country: "US"` line 44). German display labels. Two-step: country then forms for that country. Server re-validates the pair. EU-27 ISO list for VAT-required (no CH/UK/NO). Sample stays a **test fixture**, not landing data.

---

### `packages/ui/src/components/{input,label,select,combobox}.tsx` (component)

**Analog:** `packages/ui/src/components/button.tsx` lines 1-17:

```tsx
import * as React from "react";
import { cn } from "../lib/utils";

function Button({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export { Button };
```

Install via `npx shadcn add input label select combobox -c packages/ui` (style already `"radix-nova"` in `packages/ui/components.json` line 3). Export from `packages/ui/src/index.ts` the same way Button/Card are exported (lines 1-27). `ComboboxInput disabled` for “Zuerst Land wählen”. `Label` + `htmlFor` — placeholder is not a name. Do not add Dialog/Sheet/toast or Button CVA variants.

---

### Desktop tests (test, request-response)

**Analog:** `apps/desktop/src/__tests__/invoice.test.tsx` + `screens.test.tsx`.

```tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(() => { cleanup(); });

async function renderRechnung() {
  window.location.hash = "#/";
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
}
```

Keep `data-testid` hooks. Rewrite cases that assume sample tax on boot, Demo buttons, and „Beispielrechnung anzeigen“. New: create panel, disabled Anlegen hint, autosave status, tax error keep-last. Script: `"test": "vitest run"` (`apps/desktop/package.json` line 11).

---

## Shared Patterns

### Authentication (Bearer + AuthGuard)

**Source:** `apps/backend/src/auth/auth.guard.ts` lines 28-43; desktop `fetchMe` `apps/desktop/src/auth/api.ts` lines 65-72
**Apply to:** All product controllers (no `@Public()`), all desktop `apiFetch` product calls

```typescript
const header = request.headers.authorization;
if (!header || !header.startsWith("Bearer ")) {
  throw new UnauthorizedException();
}
```

Unknown routes stay 401 via catch-all. Do not add a global Nest prefix `api` (`main.ts` has none — `/health` `/auth` `/me` would break).

### RBAC catalog + PermissionsGuard

**Source:** `apps/backend/src/auth/rbac.ts` + new guard modeled on `public.decorator.ts` / `auth.guard.ts`
**Apply to:** `POST /api/entities` → `entity.create`; customer write → `kunde.write`; invoice POST/PATCH → `invoice.write`; invoice GET → `invoice.read`; evaluate → `tax.evaluate`. Do **not** enforce `invoice.issue` or `tax.override` this phase.

### ValidationPipe whitelist

**Source:** `apps/backend/src/app.module.ts` lines 27-30
**Apply to:** All POST/PATCH DTOs. `transform: true, whitelist: true` already global. class-validator only — no Zod.

### Prisma 7 client

**Source:** `apps/backend/src/prisma/prisma.service.ts` + `schema.prisma` generator `prisma-client` CJS
**Apply to:** All new models. Import from `../generated/prisma/client`. Tagged `$queryRaw` for counters. Raise pool `max`.

### HTTP errors

**Source:** Nest exceptions in `auth.controller.ts` / `catch-all.controller.ts`
**Apply to:** 401 unauthenticated, 403 missing permission (guard `false`), 404 missing resource, 422 tax no unique match / invalid country-form pair. No ad-hoc `{ error: string }` wrappers.

### Desktop fetch + 401 replay

**Source:** `api.ts` `setOnUnauthorized` + `replayLastRequest` (lines 14-27)
**Apply to:** Product autosave/evaluate. Same last-request replay; do not invent a second client.

### UI shell

**Source:** `App.tsx` NAV_ITEMS lines 27-33 — do not add a sidebar item for invoice history. Dark-first `bg-background`. `@clared/ui` Card/Button. German UI copy (Entities/Kunden/Rechnung/Anlegen already in routes).

### Testing

**Backend unit:** Jest `*.spec.ts` next to source (`jest.config.cjs`).
**Backend e2e:** `test/*.e2e-spec.ts`, `AUTH_TEST_MODE`, supertest, 15s `afterAll`.
**Desktop:** Vitest + testing-library, hash router `#/`, `data-testid` from Phase 1.
**Tax-engine:** one test per matrix class + 0-match + 2-match throw.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `packages/tax-engine/src/index.ts` | utility | transform | No `evaluate(facts)` / RuleStore in repo. Use RESEARCH Pattern 4 + architecture doc. |
| `packages/tax-engine/src/match.ts` | utility | transform | No condition matcher. Exactly one match or throw; do not rank `priority`. |
| `packages/tax-engine/src/store.ts` | service | file-I/O | No Ajv2020 usage. Load JSON files, validate vs `docs/clared-tax-rule-dsl-schema.json`. |
| `apps/backend/src/tax/facts-mapper.ts` | utility | transform | No invoice→facts mapper. D-18: VAT present ⇒ business + vat_registered; entity legal form ⇒ supplier business; `supplyType` default `"service"`; `channel` default `"direct"`. |
| `invoice_counters` SQL | service | CRUD | No `$queryRaw` in repo. RESEARCH Pattern 3 `ON CONFLICT DO UPDATE RETURNING`. |

Planner: for those five, copy RESEARCH.md Code Examples, not a guessed analog.

---

## Metadata

**Analog search scope:** `apps/backend/src` (excl. `generated/prisma`), `apps/backend/test`, `apps/backend/prisma`, `apps/desktop/src`, `packages/ui/src`, `docs/clared-tax-rule-dsl-schema.json`, `pnpm-workspace.yaml`
**Files scanned:** ~55 source files (19 backend src + 36 desktop src + 8 ui + tests/docker/schema)
**Pattern extraction date:** 2026-08-22
**Strong analogs used (3–5 core):** `auth.guard.ts` + `public.decorator.ts`, `auth.controller.ts`/`me.controller.ts`, `app.module.ts` + catch-all, desktop list+panel routes + `api.ts`, `packages/ui` button barrel
