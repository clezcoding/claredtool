# Phase 2: Self-Hosted Backend & Authentik SSO - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning

<domain>
## Phase Boundary

The subscribed operator signs in through Authentik OIDC. The Tauri desktop talks HTTPS to the **vendor Coolify** backend (founder's cluster — not customer self-host). UI-SPEC for login and session exists before implementation. Postgres, Redis, Authentik, and the Nest API run on that Coolify; local mirrors run in OrbStack.

This phase delivers: `apps/backend/` (NestJS + Prisma), Authentik OIDC login (extra Tauri window + `clared://` ticket), opaque 24h Bearer session in Redis + OS keychain, `/health` `/health/ready` `/auth/*` `/me`, signed-out Dark gate + signed-in sidebar chip. RBAC groups land on `/me` so later phases can enforce them.

This phase does **not** deliver: invoice/entity CRUD (Phase 3), tax `evaluate` (Phase 3), PDF (Phase 4), offline sync (Phase 4), Stripe/seats/multi-tenant billing (`SAAS-01` v2), customer self-host, open-source distribution, or a free tier.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product / phase scope
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria (vendor Coolify, OIDC, RBAC groups).
- `.planning/REQUIREMENTS.md` — BACK-01, AUTH-01, UI-01; v2 `SAAS-01`; out of scope: OSS / free / customer self-host.
- `.planning/PROJECT.md` — SaaS + vendor Coolify + NestJS/Prisma locks; not Electron; tax library later.
- `docs/clared-app-prd.md` — §3 Coolify services, §5 Authentik OIDC (backend as OAuth2 client, callback URL). Product model: vendor cluster, paid SaaS.
- `LICENSE` — proprietary, not OSS.
- `CONTEXT.md` — German domain glossary (Entity, Kunde, Rechnung, …). Do not invent English UI terms.

### Auth / Authentik
- `https://github.com/goauthentik/authentik` — IdP product.
- `https://docs.goauthentik.io/install-config/install/docker-compose/` — local compose (test/small); ≥2 CPU / 2 GB; do not mount `/etc/localtime` in Authentik containers.
- `.planning/intel/requirements.md` — REQ-self-hosted-backend, REQ-authentik-sso-rbac (updated group catalog).
- `.planning/intel/constraints.md` — NestJS + Prisma 7, vendor Coolify service set.

### Desktop / UI (carry forward)
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-CONTEXT.md` — D-05 sidebar, D-07 native titlebar, D-09 dark-first, D-22 land on sample invoice **after** login, D-25 Higgsfield.
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-UI-SPEC.md` — existing shell; Phase 2 adds gate + chip + login window. Do not regress Phase 1 screens.
- `/Users/puzzless/.claude/skills/higgsfield-generate/SKILL.md` — gate hero generation.

### Tauri plugins (research must confirm current APIs)
- Tauri 2 `plugin-deep-link` — `clared://` scheme.
- Tauri 2 opener is **not** the login path (user chose extra window). Keychain plugin for D-27.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/desktop/src/App.tsx` — `AppShell` + `createHashRouter`. No auth route yet. Gate should wrap or replace shell when unsigned; after login keep hash routes.
- `apps/desktop/src/components/error-state.tsx` + `spinner.tsx` / `skeleton.tsx` — 401 banner vs network error (D-31).
- `@clared/ui` Button — gate CTA and chip menu.
- `apps/desktop/src-tauri/` — Tauri 2, `com.clared.app`, native decorations, Vite 5174. Add login window label + deep-link + keychain plugins here.
- Phase 1 Higgsfield empty-state asset pipeline — copy for the login-gate hero.

### Established Patterns
- React 19 + Vite 8 + Tauri 2 + hash router (tauri://localhost).
- Dark-first Tailwind / shadcn. Dense-but-calm.
- pnpm workspace `apps/*` + `packages/*`. `apps/backend` does not exist yet (Phase 1 D-04 deferred it here).
- No `fetch`/API client in the desktop app yet.
- Vitest on desktop; extend rather than a new test stack.

### Integration Points
- New `apps/backend` Nest app in the pnpm workspace; Dockerfile for Coolify.
- Desktop: gate screen, sidebar footer chip, second Tauri window, `clared://` handler, keychain, Bearer client to Coolify/OrbStack API.
- Authentik blueprint in-repo; Coolify one-click Authentik + Nest application env.
- Unauthenticated API calls must 401 (success criterion).

</code_context>

<specifics>
## Specific Ideas

- Extra login window is a **conscious WebView** (not system browser). Password managers/MFA may be weaker; compensate with allowlist + confidential client + one-time ticket.
- SaaS copy must never say open source, free, or “self-host Clared”.
- `clared-owner` = tenant company owner. `clared-platform` = you, the vendor. Do not collapse them.
- Local Authentik is for OIDC debugging; Coolify Authentik is canonical prod. Blueprint, not two apps on one server.

</specifics>

<deferred>
## Deferred Ideas

- **SAAS-01:** Stripe (or equivalent), seats/plans, tenant isolation, checkout UI. v2. `clared-platform` + `platform.billing` already on `/me`.
- Logout everywhere / session list UI.
- `platform.impersonate`.
- Invoice/entity CRUD, tax engine, PDF, offline (Phases 3–4).
- Collision / priority-tie algorithm — do not invent.
- Customer self-host of Clared; open-source release; free tier.

</deferred>

---

*Phase: 2-Self-Hosted Backend & Authentik SSO*
*Context gathered: 2026-08-20*
