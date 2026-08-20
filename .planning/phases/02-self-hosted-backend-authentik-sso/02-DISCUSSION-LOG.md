# Phase 2: Self-Hosted Backend & Authentik SSO - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-20
**Phase:** 2-Self-Hosted Backend & Authentik SSO
**Areas discussed:** Backend-Framework, OIDC-Login-Fenster, Session nach Token, Login- und Session-UI

---

## Backend-Framework

| Option | Description | Selected |
|--------|-------------|----------|
| NestJS | TypeScript, PRD, same language as desktop | ✓ |
| Express | Same Node ceiling, less structure | |
| FastAPI | Python; third language | |
| Axum | Best per-instance perf; slow OIDC/RBAC | |

**User's choice:** NestJS after a long-term scale discussion (hundreds of users). Axum/Python rejected as premature; TAX-03 remains the CPU escape hatch.
**Notes:** Repo `apps/backend/` only; Prisma 7; Nest Swagger without a types package; two compose files; Nest via `pnpm`, OrbStack for containers; `migrate deploy` before start; Dockerfile; `/health` + `/health/ready`; API `/health` `/auth/*` `/me` else 401.

---

## Authentik topology

| Option | Description | Selected |
|--------|-------------|----------|
| Coolify one-click + local Authentik in OrbStack | Same product, two instances | ✓ |
| Coolify only + localhost redirect | Fewer containers | |
| Local only | Prod later | |

**User's choice:** Coolify one-click **and** local Authentik; all local containers in OrbStack; goauthentik/authentik. One OAuth app per instance + blueprint (avoid duplicate apps on one server).
**Notes:** User asked whether local Authentik is necessary; rec was yes for Phase 2 OIDC debug. Authentik DB must not be `clared_app`.

---

## OIDC-Login-Fenster

| Option | Description | Selected |
|--------|-------------|----------|
| System browser (`plugin-opener`) | Safer for MFA/password managers | |
| Embedded WebView | Roadmap-allowed; XSS/cookie risk | |
| Extra Tauri window | Still a WebView, dedicated chrome | ✓ |

**User's choice:** Extra Tauri login window (1c, against the system-browser rec). Backend confidential client; `clared://auth?ticket=`; 60s one-time; ~480×640 native titlebar; cancel banner; cold-start redeems ticket.
**Notes:** Conscious WebView. Allowlist backend+Authentik origins.

---

## RBAC

| Option | Description | Selected |
|--------|-------------|----------|
| Three AUTH-01 roles only | owner / accountant / viewer | |
| Seven groups + permission matrix | Job-shaped bundles | |
| Eight groups including `clared-platform` | Matrix + vendor operator | ✓ |

**User's choice:** Full matrix plus `clared-platform` for the founder. SaaS subscription later (`SAAS-01`). Impersonate off.
**Notes:** Union of permissions; `primaryRole` = highest. Docs updated: vendor Coolify, proprietary, not free, not OSS.

---

## Session nach Token

| Option | Description | Selected |
|--------|-------------|----------|
| Opaque Bearer + Redis | Revocable | ✓ |
| JWT in client | Hard to revoke | |
| httpOnly cookie | Poor fit for extra login window | |
| Keychain | OS store | ✓ |
| 15min + 7d refresh | Rec | |
| 24h single token, no refresh | Simpler | ✓ |
| 401 keep shell + retry last request | | ✓ |
| Many device sessions, logout this device | | ✓ |
| Absolute 24h; Redis stores user/`iat`/device; no cap; `/me` full | | ✓ |

**User's choice:** Opaque Bearer, keychain, **24h hard TTL** (3b, not refresh), Redis sessions, 401 retry, multi-device, logout this device only. Item 3 without a letter taken as 3a.
**Notes:** Network errors ≠ 401.

---

## Login- und Session-UI

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen dark gate | No unsigned product | ✓ |
| Shell + overlay | | |
| Sidebar footer chip | Name + primaryRole + logout menu | ✓ |
| Silent `/me` on launch | | ✓ |
| Gate typography only | Rec | |
| Higgsfield gate hero | Like empty state | ✓ |
| Short DE copy; 401 banner; keyboard focus; chip mini-menu | | ✓ |

**User's choice:** Gate + Higgsfield hero (4b). Copy: „Clared“ / „Anmelden, um Rechnungen zu stellen.“ / „Anmelden“. 401: „Sitzung abgelaufen…“.

---

## Claude's Discretion

- Nest Express vs Fastify adapter
- Redis key layout, ticket entropy, OIDC state
- Higgsfield prompt / exact gate art size
- Login window pixels around 480×640
- Prisma seed
- Authentik group claim JSON path

---

## Deferred Ideas

- SAAS-01 Stripe/seats/tenant isolation (v2); `clared-platform` already on token
- Logout everywhere / session list UI
- `platform.impersonate`
- Invoice CRUD, tax engine, PDF, offline (later phases)
- Collision algorithm — do not invent
- Customer self-host / OSS / free tier — product lock forbids
