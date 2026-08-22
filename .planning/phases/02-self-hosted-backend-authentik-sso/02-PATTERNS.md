# Phase 2: Self-Hosted Backend & Authentik SSO - Pattern Map

**Mapped:** 2026-08-22
**Files analyzed:** 38 (create + modify)
**Analogs found:** 20 / 38

`apps/backend/` is greenfield. Nest/Prisma/OIDC/Redis/compose/blueprint have **no in-repo analog** — copy RESEARCH.md + official recipes. Desktop/Tauri/UI/tests copy Phase 1 files listed below.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/backend/package.json` | config | — | `apps/desktop/package.json` | role-match |
| `apps/backend/tsconfig.json` | config | — | `apps/desktop/tsconfig.json` | partial |
| `apps/backend/Dockerfile` | config | batch | none | — |
| `apps/backend/prisma/schema.prisma` | model | CRUD | none | — |
| `apps/backend/prisma.config.ts` | config | — | none | — |
| `apps/backend/prisma/migrations/` | migration | batch | none | — |
| `apps/backend/src/main.ts` | entry | request-response | `apps/desktop/src/main.tsx` | partial |
| `apps/backend/src/app.module.ts` | provider | request-response | none | — |
| `apps/backend/src/prisma/prisma.service.ts` | service | request-response | none | — |
| `apps/backend/src/redis/redis.service.ts` | service | request-response | none | — |
| `apps/backend/src/health/health.controller.ts` | controller | request-response | none | — |
| `apps/backend/src/auth/auth.controller.ts` | controller | request-response | none | — |
| `apps/backend/src/auth/auth.guard.ts` | middleware | request-response | none | — |
| `apps/backend/src/auth/oidc.ts` | service | request-response | none | — |
| `apps/backend/src/auth/rbac.ts` | utility | transform | none | — |
| `apps/backend/src/me/me.controller.ts` | controller | request-response | none | — |
| `apps/backend/src/auth/rbac.spec.ts` | test | transform | `apps/desktop/src/__tests__/invoice.test.tsx` | role-match |
| `apps/backend/test/health.e2e-spec.ts` | test | request-response | `apps/desktop/src/__tests__/routes.test.tsx` | role-match |
| `apps/backend/test/auth.e2e-spec.ts` | test | request-response | `apps/desktop/src/__tests__/demo-states.test.tsx` | role-match |
| `apps/backend/.env.example` | config | — | none | — |
| `compose.yml` | config | — | none (vendor wget) | — |
| `compose.clared.yml` | config | — | none | — |
| `blueprints/clared.yaml` | config | — | none | — |
| `apps/desktop/src/App.tsx` (modify) | component / router | request-response | self | exact |
| `apps/desktop/src/auth/login-gate.tsx` | component | request-response | `apps/desktop/src/components/invoice-empty-state.tsx` | exact |
| `apps/desktop/src/auth/session-provider.tsx` | provider | request-response | `apps/desktop/src/App.tsx` | role-match |
| `apps/desktop/src/auth/api.ts` | utility | request-response | none (no `fetch` in desktop) | — |
| `apps/desktop/src/components/session-chip.tsx` | component | request-response | `apps/desktop/src/App.tsx` + `create-disabled-button.tsx` | role-match |
| `apps/desktop/src/components/session-banner.tsx` | component | request-response | `apps/desktop/src/components/error-state.tsx` | exact |
| `packages/ui/src/components/badge.tsx` | component | — | `packages/ui/src/components/button.tsx` | exact |
| `packages/ui/src/components/dropdown-menu.tsx` | component | — | `packages/ui/src/components/button.tsx` | role-match |
| `apps/desktop/public/login-gate-hero.png` | static asset | — | `apps/desktop/public/empty-state-hero.png` | exact |
| `apps/desktop/src-tauri/src/lib.rs` (modify) | entry (Rust) | event-driven | self | exact |
| `apps/desktop/src-tauri/tauri.conf.json` (modify) | config | — | self | exact |
| `apps/desktop/src-tauri/Cargo.toml` (modify) | config | — | self | exact |
| `apps/desktop/src-tauri/capabilities/default.json` (modify) | config | — | self | exact |
| `apps/desktop/src-tauri/capabilities/login.json` | config | — | `apps/desktop/src-tauri/capabilities/default.json` | exact |
| `apps/desktop/package.json` (modify) | config | — | self | exact |
| `.github/workflows/ci.yml` (modify) | config | batch | self | exact |
| `apps/desktop/src/__tests__/auth-gate.test.tsx` | test | request-response | `apps/desktop/src/__tests__/routes.test.tsx` | exact |
| `apps/desktop/src/__tests__/session-chip.test.tsx` | test | request-response | `apps/desktop/src/__tests__/screens.test.tsx` | exact |
| `pnpm-workspace.yaml` | config | — | self — already `apps/*` | exact |

Do **not** create `packages/tax-engine`. Do **not** add invoice/entity Nest controllers (D-05 / D-10).

---

## Pattern Assignments

### `apps/desktop/src/App.tsx` (component / router, request-response) — MODIFY

**Analog:** self. Gate wraps `RouterProvider`; do not add a hash route. After `/me` 200 keep this router. Chip in sidebar `mt-auto`. Do not reorder `NAV_ITEMS`.

**Imports + nav list** (lines 1–27):

```tsx
import {
  Building2,
  Calculator,
  FileImage,
  FileText,
  Users,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  RouterProvider,
  createHashRouter,
} from "react-router";
import { useMemo } from "react";
// ... route screens ...

const NAV_ITEMS = [
  { to: "/", label: "Rechnung", icon: FileText },
  { to: "/entities", label: "Entities", icon: Building2 },
  { to: "/kunden", label: "Kunden", icon: Users },
  { to: "/tax", label: "Tax", icon: Calculator },
  { to: "/pdf", label: "PDF", icon: FileImage },
] as const;
```

**Shell layout** (lines 29–55) — insert chip as last child of `<nav>` with `mt-auto`. Keep `w-48`, `border-r`, `p-2`:

```tsx
export function AppShell() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-border p-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink /* ... existing className ... */>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
        {/* NEW: <div className="mt-auto"><SessionChip /></div> */}
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

**Hash router** (lines 58–77) — keep `createHashRouter` + `useMemo`. Unsigned: do **not** render this; signed: keep it. Land on index `RechnungScreen` (sample invoice):

```tsx
export default function App() {
  const router = useMemo(
    () =>
      createHashRouter([
        {
          path: "/",
          element: <AppShell />,
          children: [
            { index: true, element: <RechnungScreen /> },
            { path: "entities", element: <EntitiesScreen /> },
            { path: "kunden", element: <KundenScreen /> },
            { path: "tax", element: <TaxScreen /> },
            { path: "pdf", element: <PdfScreen /> },
          ],
        },
      ]),
    [],
  );

  return <RouterProvider router={router} />;
}
```

**Auth wrap (new):** session provider outside router. Unsigned → `<LoginGate />`. Boot → `<Spinner />` full viewport. Signed → existing `RouterProvider`.

---

### `apps/desktop/src/auth/login-gate.tsx` (component, request-response)

**Analog:** `apps/desktop/src/components/invoice-empty-state.tsx`

**Hero + copy + CTA** (lines 1–24):

```tsx
const EMPTY_BODY =
  "Erstellen Sie Ihre erste Rechnung und sehen Sie sofort die Steuerberechnung. Der komplette Ablauf – vom Entwurf bis zum fertigen PDF – dauert unter 2 Minuten.";

export function InvoiceEmptyState({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <img
        src="/empty-state-hero.png"
        alt=""
        className="w-full max-w-xl rounded-md"
      />
      <h1 className="text-xl font-semibold">Noch keine Rechnung erstellt</h1>
      <p className="whitespace-normal break-words text-sm text-muted-foreground">
        {EMPTY_BODY}
      </p>
      <button
        type="button"
        onClick={onRestore}
        className="self-start text-sm text-primary underline"
      >
        Beispielrechnung anzeigen
      </button>
    </div>
  );
}
```

**Copy for gate (UI-SPEC, not empty-state copy):**

- `src="/login-gate-hero.png"` — never `/empty-state-hero.png`
- `h1` „Clared“
- body „Anmelden, um Rechnungen zu stellen.“
- CTA: `@clared/ui` `Button` (not underline link) — analog `create-disabled-button.tsx` lines 1–8
- Full viewport `bg-background`, centered column, no `AppShell`
- `autoFocus` on Anmelden; Enter activates

**Button import analog** (`apps/desktop/src/components/create-disabled-button.tsx` lines 1–8):

```tsx
import { Button } from "@clared/ui";

export function CreateDisabledButton() {
  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" disabled>
        Anlegen
      </Button>
```

Gate uses enabled `Button` `min-h-11 font-semibold`, not `disabled`.

---

### `apps/desktop/src/components/session-banner.tsx` (component, request-response)

**Analog:** `apps/desktop/src/components/error-state.tsx` (lines 1–23)

```tsx
import { Card, CardContent } from "@clared/ui";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div data-testid="error-state" className="flex max-w-xl flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-destructive">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder
            kontaktieren Sie den Support.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Erneut versuchen
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Reuse `ErrorState` unchanged for network errors (D-31).** New banner only for 401 / cancel:

| Trigger | `role` | Message | Button |
|---------|--------|---------|--------|
| 401 | `alert` | Sitzung abgelaufen. Bitte erneut anmelden. | Anmelden (`Button` from `@clared/ui`) |
| cancel/timeout | `status` | Anmeldung abgebrochen | Anmelden |

Sticky top of `<main>` when shell visible; top of gate column when signed out. Never overlay sidebar. Do not use toasts.

---

### `apps/desktop/src/components/session-chip.tsx` (component, request-response)

**Analog (layout):** `App.tsx` sidebar `nav` + `mt-auto`.
**Analog (Button):** `create-disabled-button.tsx`.
**Analog (new primitives):** shadcn `Badge` + `DropdownMenu` added to `packages/ui` the same way `Button` was.

**Button primitive** (`packages/ui/src/components/button.tsx` lines 1–17):

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

**Barrel** (`packages/ui/src/index.ts` lines 1–9) — add `Badge` and dropdown exports the same way:

```ts
export { cn } from "./lib/utils";
export { Button } from "./components/button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/card";
```

**shadcn add** (`packages/ui/components.json` lines 1–19): official registry only. Run from `packages/ui`, never `apps/desktop`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": false,
  "tsx": true,
  "aliases": {
    "components": "@clared/ui/components",
    "utils": "@clared/ui/lib/utils",
    "ui": "@clared/ui/components"
  }
}
```

Chip: `DropdownMenuTrigger asChild` wrapping `Button`; `Badge variant="secondary"` (not `default`); German labels from UI-SPEC. Menu: `side="top" align="start"`; items `Rolle: {label}` then `Abmelden`. No profile/billing.

---

### `apps/desktop/src/auth/session-provider.tsx` (provider, request-response)

**Analog:** `App.tsx` wrap + `main.tsx` dark class + `spinner.tsx` boot.

**App entry** (`apps/desktop/src/main.tsx` lines 1–12):

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Keep `dark` class. `index.html` already `lang="de"` — do not change.

**Silent boot spinner** (`apps/desktop/src/components/spinner.tsx` lines 1–10):

```tsx
export function Spinner() {
  return (
    <div
      role="status"
      data-testid="spinner"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"
    >
      <span className="sr-only">Wird geladen</span>
    </div>
  );
}
```

Reuse this component. Boot surface: full viewport, centered, `sr-only` „Wird geladen“. `prefers-reduced-motion: reduce` → drop `animate-spin`.

Cold start: keychain token → silent `GET /me`. 200 → shell. 401 → gate. Network → `ErrorState` (not gate, not login window).

---

### `apps/desktop/src/auth/api.ts` (utility, request-response)

**No desktop analog** — repo has zero `fetch` / `Authorization`. Follow RESEARCH CORS pitfall: origins `tauri://localhost`, `https://tauri.localhost`, `http://localhost:5174`.

**Vite port analog** (`apps/desktop/vite.config.ts` lines 17–21):

```ts
  server: {
    port: 5174,
    strictPort: true,
```

Bearer on every call after redeem. 401: keep shell, banner, open login window, **retry last request** after success. Network error: `ErrorState`, do not open login.

Env: `BACKEND_URL` (desktop). Never ship `SECRET`.

---

### `apps/desktop/src-tauri/src/lib.rs` (entry Rust, event-driven) — MODIFY

**Analog:** self (lines 1–7):

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Keep opener.** Register **single-instance first**, then deep-link, then opener (RESEARCH Pattern 4). Add async command `open_login_window` (sync `WebviewWindowBuilder::new` deadlocks on Windows — wry#583).

Keychain wrap (RESEARCH, no in-repo analog):

```rust
// keyring 4.x — service "com.clared.app", account "session"
let entry = keyring::Entry::new("com.clared.app", "session")?;
entry.set_password(&token)?;
let token = entry.get_password()?;
entry.delete_credential()?;
```

Expose three Tauri commands. Capability: **main only**. Login window must not have keychain IPC.

---

### `apps/desktop/src-tauri/tauri.conf.json` (config) — MODIFY

**Analog:** self (lines 1–38). Keep `identifier: "com.clared.app"`, main window 1280×800 `decorations: true`. Add plugin + do **not** put login window in static `windows[]` (spawn from async command):

```json
{
  "identifier": "com.clared.app",
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Clared",
        "width": 1280,
        "height": 800,
        "resizable": true,
        "decorations": true
      }
    ],
    "security": {
      "csp": null
    }
  }
}
```

**Add** (RESEARCH Pattern 4):

```json
"plugins": {
  "deep-link": {
    "desktop": { "schemes": ["clared"] }
  }
}
```

Login window at runtime: label `login`, 480×640 default **and** min, title `Anmelden`, `decorations: true`. Tight CSP on that WebView. `on_navigation`: allow only `BACKEND_URL` + `AUTHENTIK_URL` hosts; `scheme == "clared"` → extract ticket, emit to `main`, close `login`, return `false`.

---

### `apps/desktop/src-tauri/Cargo.toml` (config) — MODIFY

**Analog:** self (lines 1–19):

```toml
[package]
name = "clared"
version = "0.1.0"
edition = "2021"

[lib]
name = "clared_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**Add (do not replace opener):**

```
cargo add tauri-plugin-deep-link@2
cargo add tauri-plugin-single-instance@2 --features deep-link
cargo add keyring@4
cargo add tauri-plugin-os@2
```

Do **not** add Stronghold. Register `tauri_plugin_os::init()`; `os:allow-hostname` on `default.json` (main) only.

---

### `apps/desktop/src-tauri/capabilities/default.json` + `login.json`

**Analog:** `default.json` lines 1–10:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default"
  ]
}
```

**main (`default.json`):** add deep-link + custom keychain commands + `os:allow-hostname`. Keep `windows: ["main"]`.
**login (`login.json`):** `windows: ["login"]`, `core:default` only (navigation). **No** keychain, **no** opener-to-arbitrary, **no** default capability leak (RESEARCH Pitfall 7).

---

### `apps/desktop/package.json` (config) — MODIFY

**Analog:** self (lines 1–38). Add `@tauri-apps/plugin-deep-link@2.4.9` and `@tauri-apps/plugin-os@2` for hostname (D-29). Keep `"test": "vitest run"`. Do not add a second test runner.

---

### Desktop tests (test, request-response)

**Analog:** `apps/desktop/src/__tests__/routes.test.tsx` (lines 1–41) + `setup.ts` + `vitest.config.ts`.

**Config** (`vitest.config.ts` lines 1–11):

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
```

**Route tests must stay green** with a **signed-in fixture** (keychain/`/me` mocked). Existing assertions:

```ts
expect(labels).toEqual(["Rechnung", "Entities", "Kunden", "Tax", "PDF"]);
expect(screen.getByText("RE-2026-001")).toBeTruthy();
```

**Error vs 401 split analog** (`demo-states.test.tsx` lines 30–48): exact German copy, retry restores. Network banner = existing `ErrorState` copy. 401 banner = new copy, not `error-state`.

**Screen helper analog** (`screens.test.tsx` lines 10–19): `openScreen` + `cleanup`/`afterEach`. Gate tests: unsigned fixture, no nav, heading „Clared“, button „Anmelden“. Chip tests: German badge map.

TDD seams (project skill): public UI (`LoginGate`, chip, banners) + `/health` `/me` `rbac.ts`. Do not mock internals of `openid-client`.

---

### `apps/desktop/public/login-gate-hero.png` (static asset)

**Analog:** Phase 1 Higgsfield pipeline for `empty-state-hero.png` (`01-04-PLAN.md` / RESEARCH L605).

```
higgsfield generate create gpt_image_2 \
  --aspect_ratio 16:9 --resolution 2k --quality high --wait
# save → apps/desktop/public/login-gate-hero.png (2688×1520)
```

Check `higgsfield account status` first. Do not reuse `empty-state-hero.png`. Do not use Cursor GenerateImage. Prompt locked in `02-UI-SPEC.md` L269.

---

### `apps/backend/package.json` (config)

**Analog:** `apps/desktop/package.json` workspace package shape (private, scripts, `pnpm --filter`).

```json
{
  "name": "desktop",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "test": "vitest run"
  }
}
```

Backend: `"name": "backend"` (or `@clared/backend`), `"test"` via Nest/`jest` or `supertest` as RESEARCH — **do not** add Vitest to backend. `pnpm-workspace.yaml` already:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Creating `apps/backend/` is enough. Root `package.json` license `UNLICENSED` — keep.

**Install (RESEARCH):**

```bash
pnpm --filter ./apps/backend add @nestjs/common@11.2.1 @nestjs/core@11.2.1 @nestjs/platform-express@11.2.1 @nestjs/config@4.0.4 @nestjs/swagger@11.4.7 @nestjs/terminus@11.1.1 @prisma/client@7.9.1 @prisma/adapter-pg@7.9.1 pg@8.23.0 openid-client@6.8.7 ioredis@5.11.1 helmet@8.3.0 class-validator@0.15.1 class-transformer@0.5.1
pnpm --filter ./apps/backend add -D prisma@7.9.1 @nestjs/cli@11.0.24 @nestjs/testing@11.2.1 dotenv@17.4.2
```

Express default. No Fastify. Pin `ioredis@5.11.1` not 6.

---

### `apps/backend/src/main.ts` (entry, request-response)

**No Nest analog.** Copy RESEARCH L547–581.

**Helmet + CORS + ValidationPipe:**

```typescript
app.use(helmet())
app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') ?? true })
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
```

CORS origins must include `tauri://localhost`, `https://tauri.localhost`, `http://localhost:5174`. Bearer — `credentials` not required.

**Swagger (D-05):**

```typescript
const document = SwaggerModule.createDocument(
  app,
  new DocumentBuilder().setTitle('Clared').setVersion('0.1.0').addBearerAuth().build(),
)
SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'openapi.json' })
```

Executor must curl `/api/docs` and `/openapi.json` — do not assume Nest’s default `/api-json`.

Global `AuthGuard`; `@Public()` on health + `/auth/*`. Unmatched routes still 401 (not 404) — test `GET /api/invoices` → 401.

---

### `apps/backend/src/prisma/prisma.service.ts` + `schema.prisma` + `prisma.config.ts`

**No analog.** Prisma 7 recipe (RESEARCH Pattern 3). **No User/Role models** (D-22).

**schema.prisma:**

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

**Runtime:**

```typescript
import { PrismaClient } from "./generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

**prisma.config.ts:**

```typescript
import "dotenv/config"
import { defineConfig, env } from "prisma/config"
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
})
```

Never put `url` in schema. Image CMD: `prisma migrate deploy && node dist/main.js`. Never `migrate dev` in prod.

---

### `apps/backend/src/health/health.controller.ts` (controller, request-response)

**No analog.** Terminus (RESEARCH L559–572):

```typescript
@Get('ready')
@HealthCheck()
@Public()
ready() {
  return this.health.check([() => this.prismaHealth.pingCheck('postgres', this.prisma)])
}
```

`GET /health` = 200, no Prisma I/O (D-09). `GET /health/ready` = `SELECT 1` via `PrismaHealthIndicator`.

---

### `apps/backend/src/auth/*` + `me/me.controller.ts`

**No analog.** Confidential OIDC (RESEARCH Pattern 1). Nest is RP; desktop never holds secret.

**Authorize (openid-client 6):**

```typescript
let config = await client.discovery(
  new URL(process.env.AUTHENTIK_URL!),
  process.env.CLIENT_ID!,
  undefined,
  client.ClientSecretPost(process.env.SECRET!),
)
let code_verifier = client.randomPKCECodeVerifier()
let code_challenge = await client.calculatePKCECodeChallenge(code_verifier)
let state = client.randomState()
let redirectTo = client.buildAuthorizationUrl(config, {
  redirect_uri,
  scope: 'openid profile email groups',
  code_challenge,
  code_challenge_method: 'S256',
  state,
})
```

Issuer: `https://<authentik>/application/o/clared/`. Scopes **must** include `groups` (Authentik default three do not).

**Callback:** `authorizationCodeGrant` → mint ticket → `302 clared://auth?ticket=`.
**Session:** `POST /auth/session` `{ ticket, hostname }` DTO via `class-validator` whitelist.
**Logout:** Redis `DEL` this session + Authentik `end_session` URL in login window.

**Redis keys (discretion, RESEARCH Pattern 2):**

| Key | TTL | Value |
|-----|-----|-------|
| `oauth:{state}` | 600s | `{ code_verifier }` |
| `ticket:{id}` | 60s NX | `{ sub, email, name, groups }` |
| `session:{token}` | 86400s | `{ sub, email, name, groups, permissions, primaryRole, iat, hostname }` |

Ticket: GETDEL. Second redeem → 401. Bearer = `crypto.randomBytes(32).toString('base64url')`. Do not store Authentik access tokens past callback. `ioredis` 5: `set(key, val, "EX", n, "NX")`.

**Guard:** Bearer → Redis GET. Missing/expired → 401. `@Public()` health + auth login/callback/session.

**`/me` (D-32):** `sub`, `email`, `name`, `groups[]`, `permissions[]`, `primaryRole`. No plan/subscription fields.

**`rbac.ts`:** pure function, unit-test without Nest. Precedence `platform > owner > admin > accountant > tax > clerk > auditor > viewer`. Strip `clared-` prefix. Union permissions. Unknown groups ignored. Empty groups → `primaryRole: ""`, `permissions: []` — do **not** imply viewer.

---

### `apps/backend/Dockerfile` (config, batch)

**No analog.** Build context = **repo root** (pnpm workspace). Sequence: `pnpm` → `prisma generate` → `nest build`. CMD `prisma migrate deploy && node dist/main.js`. Not Nixpacks.

---

### `compose.yml` + `compose.clared.yml` + `blueprints/clared.yaml`

**No analog.** `compose.yml` = wget official Authentik file, tag `2026.8.0`, **do not fork**. Do not mount `/etc/localtime`. Authentik Postgres is **not** `clared_app`. Official compose has **no Redis**.

`compose.clared.yml`: Clared Postgres + Redis (+ optional backend). Local Nest runs via `pnpm` (D-03).

Blueprint: one OAuth app named `clared`; eight groups D-24; OpenID `groups` scope mapping. Same file local and prod.

---

### `.github/workflows/ci.yml` (config) — MODIFY

**Analog:** self (lines 15–32):

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 26
          cache: pnpm
      - run: pnpm install
      - run: pnpm --filter ./apps/desktop exec tsc --noEmit
      - run: pnpm --filter ./apps/desktop test
```

**Add** `pnpm --filter ./apps/backend test` (and backend `tsc` if present). Keep Node 26. Do not merge into `desktop-build.yml` (that is Tauri bundle only).

---

## Shared Patterns

### Workspace / package layout
**Source:** `pnpm-workspace.yaml`, `apps/desktop/package.json`, `packages/ui/package.json`
**Apply to:** `apps/backend/`
- `apps/*` glob already includes backend.
- Filter: `pnpm --filter ./apps/backend`.
- UI package name `@clared/ui`, barrel `src/index.ts`. Desktop already depends `workspace:*`.
- Root license `UNLICENSED` — SaaS copy never says OSS/free/self-host.

### Dark-first German UI
**Source:** `apps/desktop/src/main.tsx` L6; `index.html` L2; `error-state.tsx`; UI-SPEC copy table
**Apply to:** gate, chip, banners, login window title
- `document.documentElement.classList.add("dark")` stays.
- `lang="de"`. Copy verbatim from UI-SPEC. No English Logout / Profile / Billing.

### `@clared/ui` + official shadcn
**Source:** `packages/ui/components.json`, `button.tsx`, `create-disabled-button.tsx`
**Apply to:** gate CTA, chip, banners
- Import `{ Button, Card, CardContent } from "@clared/ui"`.
- Add `badge` + `dropdown-menu` via official registry inside `packages/ui` only.
- Reuse `ErrorState` / `Spinner` / `Skeleton` — do not restyle.

### Hash router stays after login
**Source:** `App.tsx` L58–77; `routes.test.tsx`
**Apply to:** session provider
- Gate is **not** a hash route.
- Signed-in tests must still land on `RE-2026-001` and nav order.

### 401 vs network
**Source:** `error-state.tsx` + CONTEXT D-31
**Apply to:** `api.ts`, banners, boot
- 401 → shell stays, 401 banner, login window, retry last request.
- Network → existing `ErrorState` + retry, **not** login.
- Do not collapse failed `/me` into invoice empty state.

### Tauri window + capabilities
**Source:** `tauri.conf.json`, `capabilities/default.json`, `lib.rs`
**Apply to:** login window + keychain
- Main label `main` unchanged. Login label `login`. Native decorations.
- Identifier `com.clared.app`. Scheme `clared`.
- Split capabilities: keychain IPC on `main` only.

### Tests
**Source:** `vitest.config.ts`, `routes.test.tsx`, `demo-states.test.tsx`, TDD skill
**Apply to:** desktop auth tests; Nest uses `@nestjs/testing` + `supertest` (new stack, do not share Vitest)
- `afterEach(cleanup)`; `window.location.hash = "#/"`.
- Exact German strings, not regex soup.
- Backend: fake Redis as in-memory Map — do not add `ioredis-mock` unless needed.
- Live Authentik OIDC = manual only.

### Auth / secrets
**Source:** RESEARCH Security Domain (no in-repo auth)
**Apply to:** all Nest auth + Tauri
- Confidential client: `SECRET` only Nest/Coolify env.
- PKCE + `state` in Redis even though confidential.
- Ticket 60s NX GETDEL. Session 86400 absolute, no refresh.
- Login WebView allowlist `BACKEND_URL` + `AUTHENTIK_URL`.

---

## No Analog Found

| File | Role | Data Flow | Reason | Use instead |
|------|------|-----------|--------|-------------|
| `apps/backend/src/**` (Nest modules) | controller / service / middleware | request-response | No Nest/Express/FastAPI in repo | RESEARCH Patterns 1–3, Nest Prisma recipe, Terminus, Swagger |
| `apps/backend/prisma/**` | model / migration | CRUD | No ORM in repo; Phase 2 has no business models | Prisma 7 `prisma-client` + adapter; empty init migration |
| `apps/backend/Dockerfile` | config | batch | No Dockerfile | RESEARCH D-08 sequence; context = repo root |
| `apps/backend/src/auth/oidc.ts` | service | request-response | No OIDC client | `openid-client` 6 README (discovery, PKCE, `ClientSecretPost`) |
| `apps/backend/src/redis/redis.service.ts` | service | request-response | No Redis | `ioredis` 5.11.1 `SET EX NX` |
| `apps/backend/src/auth/rbac.ts` | utility | transform | No permission catalog | CONTEXT D-23–D-25 tables; pure fn + `rbac.spec.ts` |
| `compose.yml` | config | — | Vendor file | wget docs.goauthentik.io `compose.yml` tag `2026.8.0`; do not fork |
| `compose.clared.yml` | config | — | No compose overlay | Clared Postgres + Redis only; Authentik DB stays vendor |
| `blueprints/clared.yaml` | config | — | No Authentik blueprint | Authentik blueprint v1; app `clared`; eight groups; `groups` scope |
| `apps/desktop/src/auth/api.ts` | utility | request-response | Zero `fetch` in desktop | RESEARCH CORS pitfall 5; Bearer header |
| Keychain Rust commands | utility | file-I/O (OS) | No `keyring` usage | RESEARCH L593–601; not Stronghold |
| Deep-link / single-instance | middleware | event-driven | Only opener plugin exists | RESEARCH Pattern 4; register single-instance **first** |

---

## Metadata

**Analog search scope:** `apps/desktop/**`, `packages/ui/**`, `.github/workflows/**`, `pnpm-workspace.yaml`, root `package.json`, `.planning/phases/01-*/01-PATTERNS.md`
**Files scanned:** 33 under `apps/`, 7 under `packages/ui`, 2 workflows, phase 01 pattern map
**Pattern extraction date:** 2026-08-22
**Stopped after:** 5 strong desktop analogs (`App.tsx`, `invoice-empty-state.tsx`, `error-state.tsx`, Tauri `lib.rs`/`tauri.conf.json`/`capabilities`, `@clared/ui` + Vitest). Backend is uniformly no-analog.

**Planner notes:**
- Copy desktop patterns from line-cited files above.
- Copy Nest/OIDC/Prisma/Redis from RESEARCH.md excerpts in this file — do not invent a second HTTP framework.
- UI-SPEC (`02-UI-SPEC.md`) is approved — implement against it; do not re-author.
- Success tests: `GET /health` 200; `GET /me` and `GET /api/invoices` unauthenticated → 401; desktop route tests still green with signed-in fixture.
