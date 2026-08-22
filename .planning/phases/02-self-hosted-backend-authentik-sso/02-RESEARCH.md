# Phase 2: Self-Hosted Backend & Authentik SSO - Research

**Researched:** 2026-08-22
**Domain:** NestJS 11 + Prisma 7 + Authentik OIDC + Tauri 2 desktop session
**Confidence:** HIGH (locked stack + official docs); MEDIUM on Coolify UI start-command and in-WebView `clared://` intercept

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Product / hosting
- **D-01:** Clared is **paid subscription SaaS**, proprietary (`UNLICENSED` / `LICENSE`). Not OSS, not free, not customer-self-hosted. — **Reversibility:** one-way — public positioning, license, and Coolify topology assume vendor-hosted SaaS.
- **D-02:** Production backend (API, Postgres `clared`/`clared_app`, Redis, Authentik) runs on the **founder's Coolify**. Desktop clients authenticate against that cluster.
- **D-03:** Local containers run in **OrbStack** (not Docker Desktop). Nest itself runs **natively via `pnpm`**; OrbStack hosts Postgres, Redis, Authentik.

### Backend stack
- **D-04:** Backend is **NestJS** in `apps/backend/`. Not Express, FastAPI, or Axum. Hundreds of users do not justify a second language; TAX-03 can extract CPU later. — **Reversibility:** costly — undoing rewrites `apps/backend` and Coolify deploy.
- **D-05:** Do **not** scaffold `packages/tax-engine` in this phase (Phase 3). No shared OpenAPI/types package; Nest Swagger (`/api/docs` + `openapi.json`), desktop uses typed fetch.
- **D-06:** ORM is **Prisma 7** (`provider = "prisma-client"`, required `output`). Not Prisma 6, Drizzle, or TypeORM. — **Reversibility:** costly — schema + client generation lock.
- **D-07:** `prisma migrate deploy` runs **before** Nest start (image entrypoint / Coolify start: migrate && node). Never `migrate dev` in prod.
- **D-08:** Coolify build uses a **Dockerfile** in `apps/backend/` (`pnpm` → `prisma generate` → `nest build`). Not Nixpacks.
- **D-09:** `/health` = process up. `/health/ready` = `SELECT 1` against Postgres.
- **D-10:** Phase-2 HTTP surface: `/health`, `/health/ready`, `/auth/*`, `/me`. Everything else **401**. No invoice/entity stubs, no CRUD.

### Authentik / compose
- **D-11:** Identity is **goauthentik/authentik**. Coolify one-click **and** a local Authentik in OrbStack. Same image tags. Authentik uses its **own** Postgres — never `clared_app`.
- **D-12:** Two compose files: official Authentik `compose.yml` (vendor file, don't fork) + `compose.clared.yml` (Clared Postgres, Redis, optional backend image).
- **D-13:** **One OAuth application named `clared` per Authentik instance** (local vs prod). Same **blueprint** in the repo applied to both. Nest env: `AUTHENTIK_URL`, `CLIENT_ID`, `SECRET` per environment. Laptop never sees the prod secret.
- **D-14:** Login WebView navigation allowlist = `BACKEND_URL` + `AUTHENTIK_URL` from the same env.

### OIDC login
- **D-15:** Login UI is an **extra Tauri window** (WebView), not the system browser. Label distinct from `main`. Tight CSP. Authentik/MFA run in that WebView. — **Reversibility:** costly — window labels, deep-link, and UI-SPEC assume this chrome.
- **D-16:** Nest is the **confidential OAuth2 client** (client secret only on the server). Desktop opens `GET /auth/login` in the login window. Secret never ships in the `.app`.
- **D-17:** After Authentik → backend callback, backend redirects to **`clared://auth?ticket=`**. Desktop `POST /auth/session` with the ticket. Scheme `clared`; bundle id stays `com.clared.app`. — **Reversibility:** costly — OS protocol registration.
- **D-18:** Ticket is **one-time, 60 seconds**. Cold start: if the app launches from `clared://` and the ticket is still valid, redeem it; else show the gate.
- **D-19:** Login window: ~480×640, **native OS titlebar** (Phase 1 D-07), title „Anmelden“, dark, no sidebar. Authentik fills the content.
- **D-20:** Cancel/timeout: main-app banner „Anmeldung abgebrochen“, button to retry. No auto-loop.
- **D-21:** Logout: destroy local session/API key **and** Authentik `end_session` in the login window.

### RBAC
- **D-22:** Authentik **groups** are the source of truth. Nest maps groups → permissions. No second role table in Postgres in this phase. Rights **union** if a user is in multiple groups. `primaryRole` = highest group for UI badges.
- **D-23:** Precedence: `platform` > `owner` > `admin` > `accountant` > `tax` > `clerk` > `auditor` > `viewer`.
- **D-24:** Groups (blueprint creates all eight, same names local and prod):

| Group | Who |
|---|---|
| `clared-platform` | Product operator (founder). All tenant rights plus `platform.*`. Not a tenant `owner`. |
| `clared-owner` | Tenant owner. **Only tenant group** that may `entity.create` (AUTH-01). |
| `clared-admin` | Org settings; no entity create. |
| `clared-accountant` | Invoices including export (AUTH-01). |
| `clared-clerk` | Draft invoices; no export; no tax override. |
| `clared-tax` | Live tax, rules, Lernfeedback, audit. |
| `clared-auditor` | Read including audit; no writes. |
| `clared-viewer` | Read, **no** audit (AUTH-01). |

- **D-25:** Permission catalog (code, stable). `✓` = allowed. `clared-platform` has **all tenant ✓ plus** platform rows. AUTH-01 three roles remain on the token; extras are real groups.

| Permission | owner | admin | accountant | tax | clerk | auditor | viewer |
|---|---|---|---|---|---|---|---|
| `entity.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `entity.create` | ✓ | — | — | — | — | — | — |
| `entity.update` | ✓ | ✓ | — | — | — | — | — |
| `entity.delete` | ✓ | — | — | — | — | — | — |
| `kunde.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `kunde.write` | ✓ | ✓ | ✓ | — | ✓ | — | — |
| `kunde.delete` | ✓ | ✓ | — | — | — | — | — |
| `invoice.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `invoice.write` | ✓ | — | ✓ | — | ✓ | — | — |
| `invoice.issue` | ✓ | — | ✓ | — | — | — | — |
| `invoice.export` | ✓ | — | ✓ | — | — | — | — |
| `invoice.delete` | ✓ | — | ✓ | — | — | — | — |
| `tax.evaluate` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `tax.override` | ✓ | — | — | ✓ | — | — | — |
| `tax.rules.write` | ✓ | ✓ | — | ✓ | — | — | — |
| `pdf.generate` | ✓ | — | ✓ | — | ✓ | — | — |
| `pdf.download` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `audit.read` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| `org.settings` | ✓ | ✓ | — | — | — | — | — |
| `platform.tenants.read` | — | — | — | — | — | — | — |
| `platform.tenants.write` | — | — | — | — | — | — | — |
| `platform.billing` | — | — | — | — | — | — | — |
| `platform.support` | — | — | — | — | — | — | — |

`clared-platform`: every tenant permission ✓, plus all four `platform.*`. **`platform.impersonate` is out** (too dangerous for v1). Phase 2 `/me` exposes the catalog; entity-create **enforcement** is Phase 3. User invite / MFA / group assignment stay in Authentik.

### Session
- **D-26:** After ticket exchange, desktop holds an **opaque Bearer** session token (`Authorization: Bearer`). Not a JWT in the client, not an httpOnly cookie. — **Reversibility:** costly — Coolify, Redis, and the Tauri client assume this.
- **D-27:** Token lives in the **OS keychain** (Tauri plugin). Not WebView `localStorage`, not RAM-only.
- **D-28:** **One token, 24 hours absolute from login**, no refresh. After 24h the token is dead even if the user is clicking.
- **D-29:** Session store is **Redis** (user id, `iat`, device hostname). Not Postgres hot-path, not stateless JWT. Logout this device = delete that Redis key.
- **D-30:** Many sessions per user, **no cap** in this phase. Logout kills **this device only**. „Überall abmelden“ is later.
- **D-31:** **401:** shell stays, banner, login window, **retry the last request** after success. **Network error:** Phase-1 error-state + retry, **not** login. Offline sync is Phase 4.
- **D-32:** `/me` returns `sub`, `email`, `name`, `groups[]`, `permissions[]`, `primaryRole`. No subscription/plan fields (SAAS-01).

### Login / session UI
- **D-33:** Signed-out: **full-screen dark gate** — no sidebar, no invoice mock. One button „Anmelden“ opens the login window. Paid SaaS; do not show the product unsigned. UI-SPEC before implementation (UI-01).
- **D-34:** Gate copy (DE): title „Clared“, one line „Anmelden, um Rechnungen zu stellen.“, button „Anmelden“. No OSS/free language.
- **D-35:** Gate **Higgsfield hero** like the invoice empty state (Phase 1 D-25: `higgsfield` CLI, GPT Image 2). Not stock, not Cursor GenerateImage.
- **D-36:** Signed-in identity: **sidebar footer chip** — name, `primaryRole` badge, click opens mini-menu (role read-only + Logout). No profile page, no billing UI.
- **D-37:** Launch with keychain token: **silent `/me`**. OK → shell on filled sample invoice (Phase 1 D-22). 401 → gate.
- **D-38:** 401 banner copy: „Sitzung abgelaufen. Bitte erneut anmelden.“ + button „Anmelden“.
- **D-39:** Keyboard: gate focus on „Anmelden“, Enter starts login window; chip/logout reachable from keyboard. No global accidental login shortcut.

### Claude's Discretion
- Nest HTTP adapter (Express vs Fastify) — pick the Nest default unless Fastify is free.
- Exact Redis key layout, ticket entropy, CSRF/state on `/auth/login`.
- Exact Higgsfield prompt and gate image size (follow empty-state 16:9 2k unless the gate layout needs a different crop).
- Precise login-window pixels around 480×640.
- Prisma seed data for local Authentik-linked users (if any).
- How `/me` maps Authentik group claim path (`groups` vs `https://...`).

### Deferred Ideas (OUT OF SCOPE)
- **SAAS-01:** Stripe (or equivalent), seats/plans, tenant isolation, checkout UI. v2. `clared-platform` + `platform.billing` already on `/me`.
- Logout everywhere / session list UI.
- `platform.impersonate`.
- Invoice/entity CRUD, tax engine, PDF, offline (Phases 3–4).
- Collision / priority-tie algorithm — do not invent.
- Customer self-host of Clared; open-source release; free tier.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BACK-01 | Desktop connects over HTTPS and OIDC/OAuth2 to the **vendor Coolify** backend (Backend-App, Postgres, Redis, Authentik on the founder's cluster — not customer self-host) | Nest in `apps/backend/` + Dockerfile (not Nixpacks) + OrbStack compose for Postgres/Redis/Authentik; desktop typed `fetch` with Bearer; CORS for Tauri origins; `/health` + `/health/ready` |
| AUTH-01 | User authenticates via Authentik OIDC (SSO/MFA); backend validates token and creates session/API-key; Mandant-Gruppen plus `clared-platform`; AUTH-01 minimum roles owner, accountant, viewer remain on the token | Confidential `openid-client` code flow; extra Tauri `login` window; `clared://auth?ticket=` one-time redeem; Redis opaque 24h session; blueprint groups + Nest RBAC map on `/me` |
| UI-01 | Interactive mockups / UI-SPEC before implementation (carry-forward) | Already shipped: `02-UI-SPEC.md` (status Ready / STATE: Phase 2 UI-SPEC approved). Planner implements against it — do not re-author the contract |
</phase_requirements>

## Summary

Phase 2 adds `apps/backend/` (NestJS 11 + Prisma 7) and wires the existing Tauri desktop to Authentik via a **confidential** authorization-code flow. The desktop never holds the client secret. Nest redirects the login WebView to Authentik, exchanges the code, mints a 60s one-time ticket, redirects to `clared://auth?ticket=`, then `POST /auth/session` returns an opaque Redis Bearer stored in the **OS keychain** (`keyring` crate — official Tauri Stronghold is not OS keychain). UI-SPEC for gate, login window, chip, and banners already exists.

**Primary recommendation:** Scaffold Nest with the **Express default adapter** (Fastify is not free: extra package + Helmet/Swagger CSP). Prisma 7 **requires** `provider = "prisma-client"`, required `output`, `prisma.config.ts`, and `@prisma/adapter-pg`. Authentik vendor `compose.yml` tag is `2026.8.0` and **has no Redis** — Clared Redis stays in `compose.clared.yml`. Request OIDC scopes `openid profile email groups` (groups mapping is not in Authentik's default three scopes; AUTH-01 otherwise ships empty `groups[]`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| OIDC authorize + token exchange | API / Backend | Authentik (external IdP) | Confidential client; secret never in `.app` (D-16) |
| Ticket mint / one-time redeem | API / Backend | Redis | 60s NX key; desktop only posts the ticket |
| Opaque session + 24h TTL | Database / Storage (Redis) | API / Backend | D-29 hot-path; logout = `DEL` that key |
| `/me` RBAC projection | API / Backend | — | Groups from IdP; permission union + `primaryRole` in code; no role table (D-22) |
| `/health` process-up | API / Backend | — | D-09: no I/O |
| `/health/ready` `SELECT 1` | Database / Storage (Postgres) | API / Backend | Terminus `PrismaHealthIndicator` |
| Login WebView + allowlist | Browser / Client (Tauri WebView) | API `/auth/login` | Extra window label `login`; D-14 hosts only |
| `clared://` intercept + OS protocol | Browser / Client (Tauri) | OS | Deep-link plugin + in-WebView `on_navigation` |
| Bearer in OS keychain | Browser / Client (Tauri Rust) | OS Keychain / Credential Manager | D-27; not Stronghold, not `localStorage` |
| Signed-out gate / chip / banners | Browser / Client (React) | API `/me` | UI-SPEC; hash router stays after login |
| Authentik IdP + MFA + groups | External (Authentik on Coolify/OrbStack) | — | Invite/MFA/group assignment stay in Authentik |
| Coolify HTTPS terminate | CDN / reverse proxy (Coolify) | API | Desktop talks HTTPS to vendor cluster |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nestjs/core` `@nestjs/common` `@nestjs/platform-express` | 11.2.1 | HTTP API | Locked D-04; Express is Nest default. Fastify needs `@nestjs/platform-fastify` + Helmet CSP exceptions for Swagger. [VERIFIED: npm registry 2026-08-14; CITED: docs.nestjs.com techniques/performance] |
| `prisma` `@prisma/client` `@prisma/adapter-pg` | 7.9.1 | ORM + migrate | Locked D-06. Prisma 7 requires driver adapter. [VERIFIED: npm registry 2026-08-17/20; CITED: prisma.io ORM 7 + Nest prisma recipe] |
| `pg` | 8.23.0 | Postgres driver for adapter | Required by `@prisma/adapter-pg`. [VERIFIED: npm registry] |
| `openid-client` | 6.8.7 | OIDC confidential client | Panva library; `discovery` + `ClientSecretPost` + PKCE. [VERIFIED: npm registry; CITED: github.com/panva/openid-client README] |
| `ioredis` | 5.11.1 | Redis sessions/tickets | Pin 5.x — 6.0.0 shipped 2026-07-31; Context7 docs match v5 `set(key, val, "EX", n, "NX")`. [VERIFIED: npm registry 5.11.1] |
| `@nestjs/swagger` | 11.4.7 | `/api/docs` + OpenAPI JSON | D-05. [VERIFIED: npm registry] |
| `@nestjs/terminus` | 11.1.1 | Health checks | `PrismaHealthIndicator.pingCheck` runs `$queryRawUnsafe('SELECT 1')` on SQL. [VERIFIED: npm registry; CITED: github.com/nestjs/terminus prisma.health.ts] |
| `@nestjs/config` | 4.0.4 | Env (`AUTHENTIK_URL`, `CLIENT_ID`, `SECRET`, `DATABASE_URL`, `REDIS_URL`) | [VERIFIED: npm registry; legitimacy OK] |
| `@tauri-apps/plugin-deep-link` | 2.4.9 | OS `clared://` | Official plugin. [VERIFIED: npm registry; CITED: v2.tauri.app/plugin/deep-linking] |
| `tauri-plugin-single-instance` (crate) | 2.4.3 | Windows/Linux deep-link into running app | Official; **register first**; feature `deep-link`. [VERIFIED: crates.io] |
| `keyring` (crate) | 4.1.6 | OS keychain | Official Tauri plugin is Stronghold (password vault), not keychain. Wrap 3 commands. [VERIFIED: crates.io] |
| Authentik image | `ghcr.io/goauthentik/server:2026.8.0` | IdP | Vendor compose default tag. [VERIFIED: docs.goauthentik.io/compose.yml] |
| Authentik Postgres | `docker.io/library/postgres:16-alpine` | Authentik's own DB | Vendor compose. Never `clared_app`. [VERIFIED: docs.goauthentik.io/compose.yml] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nestjs/cli` | 11.0.24 | `nest new` / generate | Scaffold `apps/backend` once |
| `helmet` | 8.3.0 | HTTP headers | `app.use(helmet())` on Express |
| `class-validator` `class-transformer` | 0.15.1 / 0.5.1 | DTO for `POST /auth/session` | Global `ValidationPipe` |
| `dotenv` | 17.4.2 | Prisma CLI `prisma.config.ts` | `import "dotenv/config"` |
| `@nestjs/testing` | 11.2.1 | Unit/e2e | Nest test harness |
| `supertest` | (current OK) | HTTP e2e | 401 + health |
| `@tauri-apps/plugin-os` | ^2 | Device hostname for Redis session | D-29; or one Rust `gethostname` command — prefer plugin to match opener |
| shadcn `badge` + `dropdown-menu` | official `@shadcn` registry | Chip + mini-menu | UI-SPEC Registry Safety — no third-party registry |
| `higgsfield` CLI | 1.1.23 (local) | Gate hero PNG | UI-SPEC: GPT Image 2, 16:9 2k → `apps/desktop/public/login-gate-hero.png` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Express (Nest default) | Fastify | Faster at scale; Helmet/Swagger CSP extra work. Discretion: default unless free — **not free**. Use Express. |
| `keyring` crate wrap | Official Stronghold | Stronghold needs a vault password — contradicts D-27 OS keychain. |
| `keyring` crate wrap | Community `tauri-plugin-keyring` | Unofficial; skip. |
| `openid-client` | `@nestjs/passport` + `passport-openidconnect` | Extra Passport session machinery; we do not want cookies. |
| `ioredis` 5.11.1 | `ioredis` 6.0.0 | Major just shipped; stay on documented 5.x. |
| Terminus Prisma indicator | Hand-rolled `$queryRaw` | Terminus already runs `SELECT 1`. |

**Installation (backend workspace package):**

```bash
pnpm --filter ./apps/backend add @nestjs/common@11.2.1 @nestjs/core@11.2.1 @nestjs/platform-express@11.2.1 @nestjs/config@4.0.4 @nestjs/swagger@11.4.7 @nestjs/terminus@11.1.1 @prisma/client@7.9.1 @prisma/adapter-pg@7.9.1 pg@8.23.0 openid-client@6.8.7 ioredis@5.11.1 helmet@8.3.0 class-validator@0.15.1 class-transformer@0.5.1
pnpm --filter ./apps/backend add -D prisma@7.9.1 @nestjs/cli@11.0.24 @nestjs/testing@11.2.1 dotenv@17.4.2
```

**Desktop:**

```bash
pnpm --filter ./apps/desktop add @tauri-apps/plugin-deep-link@2.4.9 @tauri-apps/plugin-os@2
# in apps/desktop/src-tauri:
#   cargo add tauri-plugin-deep-link@2
#   cargo add tauri-plugin-single-instance@2 --features deep-link
#   cargo add keyring@4
#   cargo add tauri-plugin-os@2
```

**Version verification (this session):** `npm view` 2026-08-22 as table above. Prisma engines: `node: '^20.19 || ^22.12 || >=24.0'` — local Node v26.7.0 satisfies. Nest engines: `node: '>= 20'`.

## Package Legitimacy Audit

> Seam flagged several **latest patches** of long-lived official packages `SUS` / `too-new` (Nest 11.2.1 published 2026-08-14, Prisma 7.9.1 2026-08-20). Weekly downloads are millions; repos are official. **Treat as Approved.** Do not insert `checkpoint:human-verify` for these. Community Tauri keyring plugins were **not** selected.

| Package | Registry | Age / published | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------------|-----------|-------------|---------|-------------|
| `@nestjs/core` 11.2.1 | npm | 2026-08-14 patch | ~11.9M/wk | github.com/nestjs/nest | seam SUS/too-new | Approved (official + Context7) |
| `@nestjs/common` 11.2.1 | npm | 2026-08-14 | ~13.4M/wk | nestjs/nest | seam SUS/too-new | Approved |
| `@nestjs/platform-express` 11.2.1 | npm | 2026-08-14 | ~8.3M/wk | nestjs/nest | seam SUS/too-new | Approved |
| `@nestjs/swagger` 11.4.7 | npm | 2026-08-17 | ~6.4M/wk | nestjs/swagger | seam SUS/too-new | Approved |
| `@nestjs/config` 4.0.4 | npm | 2026-04-09 | ~7.1M/wk | nestjs/config | OK | Approved |
| `@nestjs/terminus` 11.1.1 | npm | 2026-02-18 | ~2.3M/wk | nestjs/terminus | OK | Approved |
| `prisma` `@prisma/client` `@prisma/adapter-pg` 7.9.1 | npm | 2026-07-27 / 08-20 | 4–14M/wk | prisma/prisma | seam SUS/too-new | Approved (D-06 + official docs) |
| `pg` 8.23.0 | npm | 2026-08-08 | ~39M/wk | brianc/node-postgres | seam SUS/too-new | Approved |
| `openid-client` 6.8.7 | npm | 2026-08-20 | ~10.7M/wk | panva/openid-client | seam SUS/too-new | Approved (Context7) |
| `ioredis` 5.11.1 | npm | 5.x line | (use 5.11.1 not 6.0.0) | redis/ioredis | 6.0.0 was SUS/too-new | Pin **5.11.1** Approved |
| `@tauri-apps/plugin-deep-link` 2.4.9 | npm | 2026-05-02 | ~365k/wk | tauri-apps/plugins-workspace | OK | Approved |
| `class-validator` `class-transformer` `helmet` `dotenv` `supertest` | npm | established | millions | official | OK | Approved |
| Community `tauri-plugin-keyring*` | crates/npm | n/a | n/a | unofficial | not selected | REMOVED from stack |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** seam false-positives on official latest patches — planner does **not** gate install. Only a community keyring plugin would need a human checkpoint; we do not install one.

*No postinstall scripts on the listed packages (`npm view scripts.postinstall` empty this session).*

## Architecture Patterns

### System Architecture Diagram

```
Desktop main (label "main")
  │  cold start: keychain token? → GET /me
  │  no token / 401 → Gate (UI-SPEC)
  │  "Anmelden" → Rust async command opens window "login"
  ▼
Login WebView (label "login", 480×640, decorations true)
  GET {BACKEND_URL}/auth/login
  │  Nest: random state + PKCE verifier → Redis oauth:{state} EX 600
  │  302 Authentik /application/o/authorize/ (scopes openid profile email groups)
  ▼
Authentik (OrbStack or Coolify)  MFA / password
  302 {BACKEND_URL}/auth/callback?code=&state=
  │  Nest: authorizationCodeGrant (openid-client)
  │        mint ticket → Redis ticket:{id} EX 60 NX
  │        302 clared://auth?ticket={id}
  ▼
on_navigation: scheme clared → extract ticket, close login, emit to main
  (+ OS deep-link / getCurrent for cold start; Windows: single-instance)
  ▼
POST /auth/session { ticket, hostname }
  │  GETDEL ticket (one-time); SET session:{token} EX 86400
  │  200 { token }
  ▼
keyring set → GET /me → AppShell + chip
  Bearer on all later calls
  unauthenticated routes except health/auth → 401
```

### Recommended Project Structure

```
apps/backend/
  Dockerfile                 # Coolify; build context = repo root
  prisma/
    schema.prisma            # provider postgresql; generator prisma-client; NO business models this phase
    migrations/              # empty/init only — no User/Role tables (D-22)
  prisma.config.ts           # datasource.url = env("DATABASE_URL")
  src/
    main.ts                  # helmet, ValidationPipe, enableCors, Swagger setup('api/docs')
    app.module.ts
    prisma/prisma.service.ts # PrismaClient({ adapter: new PrismaPg(...) })
    health/                  # GET /health (no DB); GET /health/ready (Terminus Prisma ping)
    auth/
      auth.controller.ts     # GET /auth/login, GET /auth/callback, POST /auth/session, POST /auth/logout
      auth.guard.ts          # Bearer → Redis; @Public() for health + auth
      rbac.ts                # groups → permissions union + primaryRole (pure)
      oidc.ts                # openid-client discovery + grants
    me/me.controller.ts      # GET /me
    redis/redis.service.ts   # ioredis
  test/
    health.e2e-spec.ts
    auth.guard.e2e-spec.ts
    rbac.spec.ts
compose.yml                  # wget from docs.goauthentik.io — do not fork
compose.clared.yml           # clared Postgres + Redis (+ optional backend)
blueprints/clared.yaml       # groups + OAuth app `clared` + groups scope mapping
apps/desktop/src-tauri/
  src/lib.rs                 # plugins: single-instance FIRST, deep-link, opener; keyring commands; open_login_window
  capabilities/              # main vs login (login: no keychain IPC)
apps/desktop/src/
  auth/                      # gate, session provider, bearer fetch, 401 retry
  components/session-chip.tsx
```

`pnpm-workspace.yaml` already has `apps/*` — creating `apps/backend` is enough. Do not add `packages/tax-engine` (D-05).

### Pattern 1: Confidential OIDC (Nest = RP)

**What:** Desktop opens Nest `/auth/login`. Nest is the OAuth2 client. Authentik never talks to the `.app` with a secret.
**When to use:** Always (D-16).
**Example:**

```typescript
// Source: https://github.com/panva/openid-client/blob/main/README.md
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

Discovery issuer: `https://<authentik>/application/o/clared/` (per-provider issuer is Authentik default). [CITED: docs.goauthentik.io/add-secure-apps/providers/oauth2/]

Callback:

```typescript
// Source: https://github.com/panva/openid-client/blob/main/README.md
let tokens = await client.authorizationCodeGrant(config, getCurrentUrl(), {
  pkceCodeVerifier: code_verifier,
  expectedState: state,
})
```

Redirect after minting ticket: `clared://auth?ticket=` (D-17). End-session (D-21): `https://<authentik>/application/o/clared/end-session/` [CITED: docs.goauthentik.io OAuth 2.0 endpoints table].

### Pattern 2: Opaque Redis session

**What:** After ticket GETDEL, `crypto.randomBytes(32).toString('base64url')` Bearer. Redis `SET session:{token} <json> EX 86400`. Logout this device: `DEL`.
**When to use:** Always (D-26–D-30).

```javascript
// Source: https://github.com/redis/ioredis/blob/main/examples/basic_operations.js
redis.set("key", 100, "EX", 10)
redis.get("foo")
redis.del("foo")
```

Recommended keys (discretion):

| Key | TTL | Value |
|-----|-----|-------|
| `oauth:{state}` | 600s | `{ code_verifier }` |
| `ticket:{id}` | 60s NX | `{ sub, email, name, groups }` |
| `session:{token}` | 86400s | `{ sub, email, name, groups, permissions, primaryRole, iat, hostname }` |

Ticket redeem: `GET` then `DEL` (or GETDEL). Missing/expired → 401. Do not store Authentik access tokens in Redis beyond the callback.

### Pattern 3: Prisma 7 Nest service

**What:** Generator `prisma-client` + required `output`; URL in `prisma.config.ts`; adapter at runtime.

```prisma
// Source: https://github.com/nestjs/docs.nestjs.com/blob/master/content/recipes/prisma.md
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

```typescript
// Source: https://www.prisma.io/docs (Prisma 7 adapter)
import { PrismaClient } from "./generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

```typescript
// Source: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
import "dotenv/config"
import { defineConfig, env } from "prisma/config"
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
})
```

**No User/Role models this phase** (D-22). Init migration may be empty aside from Prisma's migration table. Health still pings Postgres.

Prod start (D-07): `prisma migrate deploy && node dist/main.js`. Never `migrate dev` in the image.

### Pattern 4: Login window + deep link

Existing window [VERIFIED: apps/desktop/src-tauri/tauri.conf.json:15-20]:

```json
"label": "main",
"title": "Clared",
"width": 1280,
"height": 800,
"resizable": true,
"decorations": true
```

Identifier [VERIFIED: apps/desktop/src-tauri/tauri.conf.json:5]: `"identifier": "com.clared.app"`

UI-SPEC login window [VERIFIED: 02-UI-SPEC.md:130-131]: label `login`, 480×640 default **and** min, title `Anmelden`.

```json
// Source: https://v2.tauri.app/plugin/deep-linking/
{
  "plugins": {
    "deep-link": {
      "desktop": { "schemes": ["clared"] }
    }
  }
}
```

```javascript
// Source: https://v2.tauri.app/reference/javascript/deep-link/
import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link'
const urls = await getCurrent()
await onOpenUrl((urls) => { /* redeem ticket */ })
```

Windows/Linux: OS spawns a **new process**. Register `tauri-plugin-single-instance` **first**, with `deep-link` feature. [CITED: v2.tauri.app/plugin/deep-linking/]

Create the login window from an **async** Tauri command — sync `WebviewWindowBuilder::new` **deadlocks on Windows** (wry#583). [CITED: docs.rs/tauri WebviewWindowBuilder]

`on_navigation`: allow only `BACKEND_URL` + `AUTHENTIK_URL` hosts (D-14). If `url.scheme() == "clared"`, emit ticket to `main`, close `login`, return `false`.

Capabilities: `login` window must **not** have keychain IPC. `main` has keychain + deep-link.

### Pattern 5: Gate wraps the hash router

[VERIFIED: apps/desktop/src/App.tsx:21-27, 58-77] `createHashRouter` with `AppShell` as layout and five children. Gate is **not** a hash route — wrap `RouterProvider` (or replace `element: <AppShell />`) when unsigned so Phase 1 routes do not flash. After `/me` 200, keep hash routes; land on sample invoice (Phase 1 D-22). Chip in sidebar `mt-auto` footer; do not change `NAV_ITEMS` order.

### Anti-Patterns to Avoid

- **Fastify "because performance":** Discretion says Nest default unless free. Helmet/Swagger CSP is extra. Hundreds of users — Express.
- **Prisma 6 `prisma-client-js` / URL in schema:** Breaks Prisma 7 generate.
- **JWT in the desktop:** D-26 opaque Bearer.
- **Stronghold for the session token:** Not OS keychain.
- **Fork Authentik `compose.yml`:** D-12. Overlay volumes via extra compose file only.
- **Authentik on `clared`/`clared_app` Postgres:** D-11.
- **Nixpacks:** D-08.
- **`packages/tax-engine` or invoice stubs:** D-05 / D-10.
- **Requesting only `openid profile email`:** Authentik's default three scopes do **not** include groups. AUTH-01 needs the groups mapping + `groups` scope. [CITED: docs.goauthentik.io endpoint-devices: "three default Selected Scopes"; Grafana `groups[*]`]
- **Mounting `/etc/localtime` in Authentik:** Official warning — breaks OAuth. [CITED: docs.goauthentik.io/install-config/install/docker-compose/]
- **Creating login window in a sync command on Windows.**
- **Giving the login WebView default capabilities** (keychain leak via XSS in Authentik page).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OIDC code+PKCE+ID token verify | Custom JWT parse | `openid-client` 6 | Discovery, PKCE, state, client auth |
| SQL health ping | Ad-hoc controller | `@nestjs/terminus` `PrismaHealthIndicator` | Already `SELECT 1` |
| OS keychain | AES file next to the app | `keyring` 4.1.6 | macOS Keychain / Windows Credential Manager |
| Deep links | Manual Info.plist / registry | `@tauri-apps/plugin-deep-link` | macOS must be in config |
| Windows second instance | Custom mutex | `tauri-plugin-single-instance` + `deep-link` | Documented pairing |
| HTTP headers | DIY | `helmet` | Express `app.use(helmet())` |
| OpenAPI | Hand-written YAML | `@nestjs/swagger` | D-05 `/api/docs` + JSON |
| Redis protocol | net.Socket | `ioredis` 5.11.1 | `SET EX NX` typed |
| Gate/chip visuals | New design system | `@clared/ui` Button + shadcn badge/dropdown-menu | UI-SPEC registry lock |
| Gate hero | GenerateImage / stock | `higgsfield` GPT Image 2 | D-35 / UI-SPEC |

**Key insight:** The expensive bugs in this phase are protocol/OS, not CRUD. Use Panva + Terminus + official Tauri plugins; wrap `keyring` in ~30 lines of Rust instead of a community plugin.

## Common Pitfalls

### Pitfall 1: Prisma 7 generate / adapter missing
**What goes wrong:** `prisma generate` fails (no `output`); runtime cannot connect (no adapter); `url` still in `schema.prisma`.
**Why:** Prisma 7 moved URL to `prisma.config.ts` and requires a driver adapter.
**How to avoid:** Copy Nest recipe generator + `PrismaPg` exactly. Run `prisma generate` in Docker **before** `nest build`.
**Warning signs:** "output is required"; "adapter is required".

### Pitfall 2: Empty `groups[]` on `/me`
**What goes wrong:** AUTH-01 roles never appear; chip badge wrong.
**Why:** Authentik default selected scopes are openid/profile/email only. Groups is a separate scope mapping; claim path is `groups` (Grafana `groups[*]`), not a URL-namespaced claim.
**How to avoid:** Blueprint attaches OpenID `'groups'` mapping; Nest requests `groups` scope; map `clared-*` names from CONTEXT D-24. Fallback: `userinfo` if ID token lacks `groups`.
**Warning signs:** `/me.groups` is `[]` after a user in `clared-owner` logs in.

### Pitfall 3: `clared://` swallowed or double-opens
**What goes wrong:** Ticket never redeems; or a second Clared window on Windows.
**Why:** In-WebView custom schemes are not the same as OS protocol handlers. Windows/Linux spawn a new process unless single-instance is first.
**How to avoid:** Intercept in `on_navigation` **and** handle `getCurrent`/`onOpenUrl`. Single-instance plugin first. Ticket 60s (D-18).
**Warning signs:** Login window stuck on blank; two docks icons.

### Pitfall 4: Windows login-window deadlock
**What goes wrong:** App freezes when clicking Anmelden.
**Why:** `WebviewWindowBuilder::new` in a sync command/event (wry#583).
**How to avoid:** `#[tauri::command] async fn open_login_window`.
**Warning signs:** Freeze only on Windows CI / Windows VM.

### Pitfall 5: CORS vs Tauri origin
**What goes wrong:** `/me` fails from `main` even with a token.
**Why:** Origins differ: `tauri://localhost` (macOS), `https://tauri.localhost` (Windows WebView2), `http://localhost:5174` (dev).
**How to avoid:** `app.enableCors({ origin: env CORS_ORIGINS.split(',') })` including those three. Bearer (not cookies) — `credentials` not required.
**Warning signs:** Browser console CORS; network tab OPTIONS 404.

### Pitfall 6: Authentik timezone mount
**What goes wrong:** OAuth/SAML "invalid time" / failed login.
**Why:** Official: do not mount `/etc/localtime` or `/etc/timezone`.
**How to avoid:** Vendor compose as-is.
**Warning signs:** GitHub authentik#3005 symptoms.

### Pitfall 7: Secret in the desktop / login WebView XSS
**What goes wrong:** Client secret or session token stolen.
**Why:** Confidential client forgotten; or login window has keychain capability.
**How to avoid:** Secret only in Nest env. Login capability = navigation only. Token only via main-window keychain commands.

### Pitfall 8: Catch-all 401 missed
**What goes wrong:** `GET /api/invoices` 404 instead of 401 (success criterion).
**Why:** No global guard; 404 from missing controller looks "open".
**How to avoid:** Global `AuthGuard` + `@Public()` on health/auth. Unmatched routes still run the guard first (or a middleware that 401s if no public). Tests: `GET /api/invoices` → 401.

## Code Examples

### Swagger (D-05)

```typescript
// Source: https://docs.nestjs.com/openapi/introduction + security.md
const document = SwaggerModule.createDocument(
  app,
  new DocumentBuilder().setTitle('Clared').setVersion('0.1.0').addBearerAuth().build(),
)
SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'openapi.json' })
```

Executor **must curl** `/api/docs` and the JSON URL — Nest's default sibling path is `/api-json` unless `jsonDocumentUrl` is set. D-05 wants `/openapi.json`. Verify; do not assume.

### Terminus ready (D-09)

```typescript
// Source: github.com/nestjs/terminus lib/health-indicator/database/prisma.health.ts
// pingCheck(key, prismaClient) → $queryRawUnsafe('SELECT 1') on SQL
@Get('ready')
@HealthCheck()
@Public()
ready() {
  return this.health.check([() => this.prismaHealth.pingCheck('postgres', this.prisma)])
}
```

`GET /health` is a separate handler that returns 200 without Prisma (D-09).

### CORS + Helmet + Validation

```typescript
// Source: https://docs.nestjs.com/security/cors + helmet.md + techniques/validation
app.use(helmet())
app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') ?? true })
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
```

### RBAC (pure; test without Nest)

Precedence [VERIFIED: 02-CONTEXT.md:51]: `platform` > `owner` > `admin` > `accountant` > `tax` > `clerk` > `auditor` > `viewer`.

Group names [VERIFIED: 02-CONTEXT.md:56-63]: `clared-platform`, `clared-owner`, `clared-admin`, `clared-accountant`, `clared-clerk`, `clared-tax`, `clared-auditor`, `clared-viewer`.

`/me` fields [VERIFIED: 02-CONTEXT.md D-32]: `sub`, `email`, `name`, `groups[]`, `permissions[]`, `primaryRole`.

Strip `clared-` prefix to match precedence keys. Union permissions. `clared-platform` = all tenant ✓ plus four `platform.*`. Unknown groups ignored. `primaryRole` = first match in precedence order among the user's groups; if none, `viewer` is **not** implied — return a value the chip can still render (UI-SPEC: unknown `primaryRole` shows the raw value). Recommendation: `primaryRole: "viewer"` only if `clared-viewer` is present; if groups empty, use empty string / omit and let the chip show email only — **prefer** `"viewer"` only when that group exists. If Authentik user has no Clared groups, `primaryRole` empty string and badge shows raw empty → UI-SPEC unknown raw. Planner: empty groups → `primaryRole: ""`, permissions `[]`.

### Keychain commands (Rust)

```rust
// keyring 4.x — service "com.clared.app", account "session"
let entry = keyring::Entry::new("com.clared.app", "session")?;
entry.set_password(&token)?;
let token = entry.get_password()?;
entry.delete_credential()?;
```

### Higgsfield gate hero

UI-SPEC locked [VERIFIED: 02-UI-SPEC.md:256-269]: CLI `higgsfield`, model `gpt_image_2`, `--aspect_ratio 16:9 --resolution 2k --quality high`, output `apps/desktop/public/login-gate-hero.png` 2688×1520, prompt as in UI-SPEC. Skill: `higgsfield generate create` with `--wait`. Do not reuse `empty-state-hero.png`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma 6 `prisma-client-js` + URL in schema | Prisma 7 `prisma-client` + `prisma.config.ts` + adapter | ORM 7 | Dockerfile and Nest `PrismaService` must follow 7 |
| Authentik compose with Redis | Official compose 2026.8.0: Postgres + server + worker only | vendor compose.yml this session | Do not add Redis to Authentik; Clared Redis is separate |
| Implicit OAuth in a public desktop client | Authorization code + confidential Nest + PKCE | OAuth BCP (RFC 9700) | Matches D-16; Authentik docs warn against implicit |
| Tauri Stronghold for secrets | OS keychain via `keyring` | D-27 | Stronghold is the official plugin but wrong threat model |
| Default three OIDC scopes | Add `groups` mapping + scope | AUTH-01 | Without this, RBAC is empty |

**Deprecated/outdated:**
- Nest Fastify as "the" 2024 default — still opt-in.
- Prisma `migrate dev` in production images.
- Storing session JWT in `localStorage`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Authentik ID token claim is `groups` (string names) when OpenID groups mapping is attached; must **request** scope `groups` in addition to D-13's three | AUTH-01 / OIDC | Empty RBAC; chip wrong. Confirm on first local login via `/me` |
| A2 | Coolify Dockerfile pack runs image `CMD` as-is; put `migrate && node` in Dockerfile rather than undocumented UI "start command" | D-07/D-08 | Docs page returned title-only (JS spa). Verify on first Coolify deploy |
| A3 | `WebviewWindowBuilder` exposes `on_navigation` analog to plugin `Builder::on_navigation` | Login window | If missing, intercept via `on_page_load` + OS deep-link only |
| A4 | Pin `ioredis@5.11.1` not 6.0.0 | Stack | If 6 is drop-in, bump later |
| A5 | No Prisma business models in Phase 2 | Schema | Fine; Phase 3 adds entities/invoices |
| A6 | Hostname via `@tauri-apps/plugin-os` or `gethostname` in Rust | D-29 | Cosmetic in Redis payload |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

A1 and A2 need executor verification, not a discuss-phase reopen, unless `/me.groups` is empty after blueprint apply.

## Open Questions (RESOLVED)

1. **Prod URLs and Coolify env**
   - What we know: Nest env names `AUTHENTIK_URL`, `CLIENT_ID`, `SECRET`; desktop `BACKEND_URL`. Laptop never sees prod secret (D-13).
   - What's unclear: Actual hostnames (`https://…`).
   - Recommendation: `.env.example` with local OrbStack defaults; Coolify env in UI. Planner does not invent production FQDNs. **RESOLVED**

2. **Swagger JSON exact path**
   - What we know: D-05 wants `/api/docs` + `openapi.json`. Nest `jsonDocumentUrl` is configurable.
   - What's unclear: Whether Nest prefixes the setup path.
   - Recommendation: Wave 0 curl both; adjust `jsonDocumentUrl` until `/openapi.json` 200. **RESOLVED**

3. **Authentik Coolify one-click vs compose tag**
   - What we know: Local OrbStack uses vendor `compose.yml` `AUTHENTIK_TAG:-2026.8.0`. D-11 same image tags local and prod.
   - What's unclear: Coolify template tag may lag.
   - Recommendation: Pin `2026.8.0` (or the downloaded compose tag) in Coolify image field. **RESOLVED**

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Nest + Prisma 7 | ✓ | v26.7.0 | — (meets `>=24.0`) |
| pnpm | workspace | ✓ | 11.15.1 | — |
| Rust/cargo | Tauri plugins | ✓ | rustc 1.97.1 / cargo 1.97.1 | — |
| Docker | OrbStack compose | ✓ | 29.7.2 | — |
| OrbStack | Local Postgres/Redis/Authentik | ✓ | 2.2.3 | — |
| `higgsfield` | Gate hero | ✓ | 1.1.23 | — (auth login if session expired) |
| `psql` | Manual DB debug | ✓ | 14.24 | docker exec |
| `redis-cli` | Manual Redis debug | ✗ | — | `docker exec` into clared Redis |
| Coolify CLI | Optional remote | ✓ | 1.7.0 | Coolify UI |
| ctx7 CLI | Docs fallback | ✗ | — | Context7 MCP (used) |
| graphify | Cross-doc graph | disabled | — | skipped |

**Missing dependencies with no fallback:** none for this phase.

**Missing dependencies with fallback:** `redis-cli` → container exec.

Step 2.6: probed this session. Graphify disabled — no graph queries.

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework (desktop) | Vitest 4.1.10 + Testing Library (existing) |
| Config file (desktop) | `apps/desktop/vitest.config.ts` (jsdom, `src/__tests__/setup.ts`) |
| Quick run (desktop) | `pnpm --filter ./apps/desktop test` |
| Framework (backend) | Nest `@nestjs/testing` 11.2.1 + `supertest` (Nest default; do not add a second runner on desktop) |
| Config file (backend) | none yet — Wave 0 `apps/backend/package.json` script `test` |
| Quick run (backend) | `pnpm --filter ./apps/backend test` |
| Full suite | `pnpm --filter ./apps/desktop test && pnpm --filter ./apps/backend test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BACK-01 | `GET /health` 200 without DB | e2e | `pnpm --filter ./apps/backend test:e2e -- health` | ❌ Wave 0 |
| BACK-01 | `GET /health/ready` 200 with Postgres (or 503 if down) | e2e | same | ❌ Wave 0 |
| BACK-01 | Unauthenticated `GET /me` and `GET /api/invoices` → 401 | e2e | `pnpm --filter ./apps/backend test:e2e -- auth` | ❌ Wave 0 |
| AUTH-01 | Group union + `primaryRole` precedence | unit | `pnpm --filter ./apps/backend test -- rbac` | ❌ Wave 0 |
| AUTH-01 | Ticket one-time: second `POST /auth/session` 401 | e2e (fake Redis) | `pnpm --filter ./apps/backend test:e2e -- auth` | ❌ Wave 0 |
| AUTH-01 | Session EX 86400 / logout DEL | e2e (fake Redis) | `pnpm --filter ./apps/backend test:e2e -- auth` | ❌ Wave 0 |
| UI-01 / D-33 | Gate copy + Anmelden; no shell | unit (jsdom) | `pnpm --filter ./apps/desktop test` | ❌ Wave 0 (extend desktop tests) |
| D-36 | Chip badge German labels | unit | same | ❌ Wave 0 |
| D-31 | 401 banner vs `ErrorState` network | unit | same | ❌ Wave 0 |
| D-37 | Silent boot spinner `sr-only` „Wird geladen“ | unit | reuse `Spinner` [VERIFIED: spinner.tsx:8] | partial ✅ component exists |

Existing desktop tests (`routes.test.tsx`) assert nav `["Rechnung", "Entities", "Kunden", "Tax", "PDF"]` and land on `RE-2026-001` — **must stay green** when gate wrapping is added (signed-in fixture).

### Sampling Rate

- **Per task commit:** `pnpm --filter ./apps/desktop test` and/or `pnpm --filter ./apps/backend test` for the touched app
- **Per wave merge:** both
- **Phase gate:** both green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/backend/` Nest app + `package.json` `test` script
- [ ] `apps/backend/src/auth/rbac.spec.ts` — AUTH-01 catalog + D-23 precedence
- [ ] `apps/backend/test/health.e2e-spec.ts` — BACK-01
- [ ] `apps/backend/test/auth.e2e-spec.ts` — 401 catch-all + ticket
- [ ] Desktop tests: gate, chip, banners, signed-in fixture so Phase 1 route tests still pass
- [ ] Fake Redis in unit tests (in-memory Map behind a tiny interface) — do **not** add `ioredis-mock` unless needed

OIDC against live Authentik is **manual-only** this phase (MFA/WebView). Automate Nest with mocked `authorizationCodeGrant`.

## Security Domain

`security_enforcement` enabled, ASVS level 1, `security_block_on: high`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Authentik OIDC; Nest confidential client; PKCE + `state` even though confidential |
| V3 Session Management | yes | Opaque Bearer in Redis 24h absolute; logout `DEL`; no refresh (D-28) |
| V4 Access Control | yes | Groups → permissions on `/me`; **enforcement of `entity.create` is Phase 3** — still expose catalog |
| V5 Input Validation | yes | `ValidationPipe` whitelist on `POST /auth/session`; ticket entropy `randomBytes(32)` |
| V6 Cryptography | yes | Do not hand-roll JWT; `openid-client` verifies tokens; OS keychain |

### Known Threat Patterns for Nest + Tauri + Authentik

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| OAuth CSRF | Spoofing | `state` in Redis, checked in `authorizationCodeGrant` |
| Authorization code replay / ticket replay | Spoofing | Code one-time at Authentik; ticket GETDEL 60s NX |
| Client-secret leak | Information disclosure | Secret only on Nest/Coolify env; never in Tauri bundle |
| Token in WebView storage | Information disclosure | Keychain via Rust; login window has no keychain IPC |
| Open redirect / WebView to evil host | Spoofing | `on_navigation` allowlist `BACKEND_URL` + `AUTHENTIK_URL` |
| Unauthenticated API | Elevation of privilege | Global guard; unmatched routes 401 |
| XSS in Authentik page talking to Tauri IPC | Elevation of privilege | Login capability stripped |
| Session fixation | Tampering | New random Bearer at redeem; old ticket dead |
| Implicit grant in public client | Information disclosure | Forbidden by Authentik BCP + D-16 |

## Project Constraints (from .cursor/rules/)

- **Caveman / Honey / Ponytail:** minimum code; reuse `@clared/ui`, `ErrorState`, `Spinner`; no new design system; no extra test framework on desktop.
- **Karpathy:** no speculative Prisma models; no Fastify "flexibility"; surgical desktop edits (gate wrap, chip, plugins).
- **YAGNI:** no Stripe, no tax-engine package, no invoice CRUD, no Stronghold, no community keyring plugin.
- **TDD skill (project):** test at public seams (`/health`, `/me`, `rbac.ts`, gate). Red-green on RBAC catalog before wiring HTTP.
- **UI-SPEC:** German copy locked; shadcn official registry only (`badge`, `dropdown-menu`); Higgsfield not GenerateImage.

## Sources

### Primary (HIGH / MEDIUM per classify-confidence seam)

- `/nestjs/docs.nestjs.com` — Fastify opt-in, Prisma recipe (`provider = "prisma-client"`), Terminus, CORS, Helmet, Swagger, ValidationPipe
- `/websites/prisma_io` — Prisma 7 adapter, `prisma.config.ts`, `migrate deploy`
- `https://docs.goauthentik.io/install-config/install/docker-compose/` — compose install, no `/etc/localtime`
- `https://docs.goauthentik.io/compose.yml` — image `ghcr.io/goauthentik/server:2026.8.0`, postgres 16, **no Redis**
- `https://docs.goauthentik.io/add-secure-apps/providers/oauth2/` — endpoints, confidential code flow, end-session, PKCE, implicit discouraged
- `https://docs.goauthentik.io/customize/blueprints/` + `v1/structure/` — YAML `version: 1`, atomic apply
- `/panva/openid-client` — discovery, PKCE, `authorizationCodeGrant`, `ClientSecretPost`
- `/tauri-apps/plugins-workspace` + `https://v2.tauri.app/plugin/deep-linking/` — schemes, `getCurrent`/`onOpenUrl`, single-instance
- `https://github.com/nestjs/terminus/.../prisma.health.ts` — `SELECT 1`
- In-repo: `02-CONTEXT.md`, `02-UI-SPEC.md`, `apps/desktop/src-tauri/tauri.conf.json`, `App.tsx`, `error-state.tsx`, `spinner.tsx`

### Secondary (MEDIUM)

- Grafana Authentik snippet: `groups[*]` claim path; "three default Selected Scopes"
- Coolify Dockerfile pack URL exists; body was title-only (JS)

### Tertiary (LOW)

- In-WebView `clared://` intercept details (A3)
- Coolify start-command UI (A2)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `npm view` + official docs + locked D-04/D-06
- Architecture: HIGH — CONTEXT flow is specific; libraries match
- Pitfalls: HIGH for Prisma 7 / groups scope / Windows deadlock / CORS; MEDIUM for in-WebView scheme

**Research date:** 2026-08-22
**Valid until:** 2026-09-21 (30 days; Authentik image tags move faster — re-check compose.yml if past 14 days)

**Graph:** `.planning/graphs/graph.json` absent; graphify disabled.

**UI-SPEC:** already approved — implementation phase, not another design pass.
