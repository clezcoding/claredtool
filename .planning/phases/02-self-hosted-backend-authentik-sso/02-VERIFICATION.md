---
phase: 02-self-hosted-backend-authentik-sso
verified: 2026-08-22T02:41:00Z
status: human_needed
score: 4/7 must-haves verified
behavior_unverified: 3
overrides_applied: 0
decision_coverage:
  honored: 39
  total: 39
  not_honored: []
unverified_prohibitions: 21
prohibition_judge: honored-in-code-non-authoritative
behavior_unverified_items:
  - truth: "User can authenticate via Authentik OIDC (live IdP, not AUTH_TEST_MODE)"
    test: "Unset AUTH_TEST_MODE. Apply blueprints/clared.yaml. Click Anmelden, complete Authentik MFA."
    expected: "Login WebView hits Authentik; callback 302 clared://auth?ticket=; chip shows primaryRole; GET /me.groups is non-empty."
    why_human: "e2e forces AUTH_TEST_MODE=1 and returns TEST_CLAIMS. openid-client discovery/authorizationCodeGrant is never invoked at runtime in CI."
  - truth: "Desktop reaches the vendor Coolify backend over HTTPS"
    test: "Point VITE_BACKEND_URL / BACKEND_URL at the founder Coolify HTTPS API. Sign in from the desktop app."
    expected: "fetch goes to https://<coolify-api>; Bearer session works; no localhost fallback."
    why_human: "api.ts defaults to http://localhost:3000. Vendor FQDNs are Coolify env, not in-repo. 02-USER-SETUP.md still Incomplete."
  - truth: "Postgres, Redis, Authentik, and the backend app run on the founder's Coolify"
    test: "Coolify Dockerfile deploy (not Nixpacks). curl https://<api>/health and /health/ready. Authentik image tag matches compose.yml."
    expected: "API 200; ready 200 against clared/clared_app; Authentik on its own Postgres; SECRET only in Coolify."
    why_human: "Dockerfile, compose.yml, compose.clared.yml, blueprint exist. Cluster apply is founder dashboard work (02-USER-SETUP.md)."
coincidental_reliance_items:
  - truth: "Unauthenticated HTTP is rejected; ticket redeem is one-time via GETDEL"
    reason: fixture-only
    harden: "createKeyValueStore() uses MemoryStore when NODE_ENV=test. Re-run the parallel POST /auth/session e2e against RedisStore/ioredis GETDEL."
human_verification:
  - test: "Launch Tauri signed-out. Confirm dark gate (h1 Clared, body Anmelden, um Rechnungen zu stellen., one Anmelden, no sidebar). Click Anmelden: second window title Anmelden 480×640. Close/cancel: banner Anmeldung abgebrochen. After login: chip + sample invoice RE-2026-001. Keyboard: Tab/Enter on gate, chip menu Abmelden."
    expected: "Gate, native login window, cancel banner, signed-in chip match 02-UI-SPEC. Product screens stay hidden while unsigned."
    why_human: "Visual chrome, window size, native titlebar, and WebView Authentik content are not provable from Vitest."
  - test: "OrbStack: docker compose -f compose.yml -f compose.clared.yml up -d. Apply blueprints/clared.yaml. Copy local CLIENT_ID/SECRET into apps/backend/.env; unset AUTH_TEST_MODE. pnpm --filter ./apps/backend start. Desktop Anmelden completes Authentik MFA. Then Coolify: Dockerfile build, env AUTHENTIK_URL CLIENT_ID SECRET DATABASE_URL REDIS_URL CORS_ORIGINS BACKEND_URL; curl /health and /health/ready on the vendor URL."
    expected: "Local MFA login; chip primaryRole; GET /me has groups. Prod API HTTPS 200/ready 200 against clared Postgres, not Authentik's DB."
    why_human: "Live IdP, MFA, blueprint apply, and founder Coolify are external. 02-USER-SETUP.md checkboxes are still empty."
  - test: "After a successful login, confirm a second clared:// / ticket-received for the same ticket does not sign the user out. Confirm login WebView cannot open http://localhost:<other-port>. Confirm AUTH_TEST_MODE=1 is unset on Coolify."
    expected: "Signed session survives a 401 replay. Allowlist is origin (scheme+host+port), not hostname-only. Production refuses AUTH_TEST_MODE."
    why_human: "02-REVIEW.md CR-01/CR-02/CR-03 are live/security behavior. Code review is not a verification blocker; these still need a human on the real app."
  - test: "Skim shipped copy and Coolify positioning: no OSS/free/self-host language; SECRET never on the laptop for prod; login WebView has no keychain IPC."
    expected: "Judgment-tier prohibitions still hold in the running product."
    why_human: "unverified-prohibition — human review recommended. LLM grep is non-authoritative for must-NOT copy and deploy posture."
---

# Phase 2: Self-Hosted Backend & Authentik SSO Verification Report

**Phase Goal:** User signs in through Authentik and the desktop talks to the vendor Coolify backend (founder's cluster) over HTTPS and OIDC
**Verified:** 2026-08-22T02:41:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

Compound roadmap success criteria were split so live-cluster clauses are not scored as code-verified. Task completion in SUMMARY.md is not evidence. `02-REVIEW.md` (`issues_found`, 3 critical) was **not** treated as a verification blocker per orchestrator instruction; those findings are human-verification items.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Interactive mockups / UI-SPEC for login and session UI exist before implementation | ✓ VERIFIED | `02-UI-SPEC.md` exists, `status: approved`, `reviewed_at: 2026-08-21`. Gate, login window, chip, banners specified. |
| 2 | Extra Tauri login window; OIDC scopes `openid profile email groups` | ✓ VERIFIED | `lib.rs` `open_login_window`: label `login`, title Anmelden, 480×640, decorations true. `oidc.ts` `OIDC_SCOPES = "openid profile email groups"`. Desktop test: Anmelden invokes `open_login_window` and keeps the gate. |
| 3 | User can authenticate via Authentik OIDC (live IdP) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Production path is wired (`client.discovery`, `ClientSecretPost`, PKCE S256, `authorizationCodeGrant`, groups claim / userinfo fallback). e2e sets `AUTH_TEST_MODE=1` and never talks to Authentik. |
| 4 | Unauthenticated calls are rejected; backend-validated opaque Bearer session | ✓ VERIFIED (coincidental-reliance) | e2e: GET `/me` and GET `/api/invoices` 401; parallel POST `/auth/session` → `[200, 401]`; logout DEL this key only; callback Location `clared://auth?ticket=`. Guard reads `session:{token}` from Redis/MemoryStore. Parallel GETDEL ran against MemoryStore (`NODE_ENV=test`). |
| 5 | Desktop reaches the vendor Coolify backend over HTTPS | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `api.ts` `fetch(`${BASE}/auth/session`)` and Bearer `/me`. `BASE` defaults to `http://localhost:3000`. No in-repo Coolify FQDN. |
| 6 | Tokens carry RBAC groups (owner, accountant, viewer, plus `clared-platform`) | ✓ VERIFIED | `projectRbac` catalog + precedence. `pnpm --filter ./apps/backend test -- rbac`: 8/8 pass. Session payload copies `groups`, `permissions`, `primaryRole`. `/me` returns those six fields, no plan/subscription. |
| 7 | Postgres, Redis, Authentik, and the backend app run on the founder's Coolify | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Artifacts exist (`Dockerfile` `prisma migrate deploy && node dist/main.js`, `compose.yml` Authentik 2026.8.0, `compose.clared.yml` clared Postgres+Redis, `blueprints/clared.yaml`). `02-USER-SETUP.md` Status Incomplete; no live cluster probe. |

**Score:** 4/7 truths verified (3 present, behavior-unverified)

Wave-0 PLAN truths that required **RED** specs are superseded by later waves (those specs are now green). They were not scored as failures.

### Required Artifacts

gsd-tools `verify.artifacts` returned 0 rows (PLAN lists artifacts as YAML strings, not `{path, provides}` objects). Manual L1–L3:

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `02-UI-SPEC.md` | Login/session contract | ✓ VERIFIED | Approved UI-SPEC; gate/chip/banner/boot tables |
| `apps/backend/package.json` | Nest package, `test` = jest | ✓ VERIFIED | name `backend`, private, `@nestjs/platform-express@11.2.1`, scripts `test` / `test:e2e` |
| `apps/backend/src/health/health.controller.ts` | `/health` + `/health/ready` | ✓ VERIFIED | `/health` returns `{ status: "ok" }` (no Prisma). `/ready` `PrismaHealthIndicator.pingCheck` |
| `apps/backend/src/auth/auth.controller.ts` | login/callback/session/logout | ✓ VERIFIED | GETDEL ticket, SET session EX 86400, redirect `clared://auth?ticket=` |
| `apps/backend/src/auth/auth.guard.ts` | Global Bearer guard | ✓ VERIFIED | `APP_GUARD`; `@Public()` bypass; Redis `session:{token}` |
| `apps/backend/src/auth/oidc.ts` | openid-client confidential + PKCE | ✓ VERIFIED | 120 lines; discovery + `ClientSecretPost`; test-mode stub gated on `AUTH_TEST_MODE` |
| `apps/backend/src/auth/rbac.ts` | `projectRbac` | ✓ VERIFIED | Eight groups; no `platform.impersonate` |
| `apps/backend/src/me/me.controller.ts` | D-32 `/me` | ✓ VERIFIED | sub, email, name, groups, permissions, primaryRole |
| `apps/backend/src/http/catch-all.controller.ts` | Unmatched → 401 | ✓ VERIFIED | `@All("{*path}")` `UnauthorizedException`; last in `AppModule.controllers` |
| `apps/backend/prisma/schema.prisma` | Prisma 7, no User/Role | ✓ VERIFIED | `provider = "prisma-client"`, required output; no models |
| `apps/backend/Dockerfile` | migrate then node | ✓ VERIFIED | `prisma generate` then `nest build`; CMD `prisma migrate deploy && node dist/main.js`; `NODE_ENV=production` |
| `compose.yml` | Vendor Authentik 2026.8.0 | ✓ VERIFIED | `ghcr.io/goauthentik/server:2026.8.0`; own `postgresql`; no `/etc/localtime`; no Redis |
| `compose.clared.yml` | Clared Postgres + Redis | ✓ VERIFIED | DB `clared` / user `clared_app`; Redis 7 |
| `blueprints/clared.yaml` | App `clared` + eight groups | ✓ VERIFIED | All eight `clared-*`; `scope_name: groups`; `client_type: confidential`; no `client_secret` in file |
| `apps/desktop/src/auth/api.ts` | redeemTicket / fetchMe | ✓ VERIFIED | POST `/auth/session`; Bearer `/me`; 401 → `onUnauthorized` |
| `apps/desktop/src/auth/login-gate.tsx` | Signed-out gate | ✓ VERIFIED | Copy D-34; hero `/login-gate-hero.png`; no nav |
| `apps/desktop/src/auth/session-provider.tsx` | Boot / redeem / logout | ✓ VERIFIED | keychain + `ticket-received` + `onOpenUrl`; 401 banner opens login window |
| `apps/desktop/src/components/session-chip.tsx` | Identity chip | ✓ VERIFIED | German role labels; email fallback; never renders `sub` |
| `apps/desktop/src/components/session-banner.tsx` | 401 / cancel | ✓ VERIFIED | Exact D-38 / D-20 copy; `role=alert` / `status` |
| `apps/desktop/public/login-gate-hero.png` | Higgsfield hero | ✓ VERIFIED | PNG, 5091779 bytes |
| `apps/desktop/src-tauri/src/lib.rs` | Plugins + commands | ✓ VERIFIED | single-instance → deep-link → opener → os; keychain `com.clared.app` / `session` |
| `apps/desktop/src-tauri/capabilities/login.json` | Navigation-only | ✓ VERIFIED | `windows: ["login"]`; `permissions: ["core:default"]` only |
| `apps/desktop/src-tauri/login-init.html` | Dark spinner | ✓ VERIFIED | 16×16 ring; `prefers-reduced-motion`; static CSP |
| `packages/ui` badge + dropdown-menu | Barrel exports | ✓ VERIFIED | `packages/ui/src/index.ts` exports both |

**Artifacts:** 24/24 exist, substantive, wired (live Coolify/Authentik not exercised — see truths 3, 5, 7).

### Key Link Verification

gsd-tools `verify.key-links` also returned 0 rows (string-shaped `key_links`). Manual:

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| LoginGate Anmelden | `open_login_window` | `invoke` | ✓ WIRED | `login-gate.tsx` + `session-provider.login` |
| `open_login_window` | GET `/auth/login` | WebView navigate | ✓ WIRED | `{BACKEND_URL}/auth/login` after `login-init.html` |
| GET `/auth/login` | Authentik authorize | `beginAuthorization` | ✓ WIRED | Real openid-client unless `AUTH_TEST_MODE=1` |
| GET `/auth/callback` | desktop | `Location: clared://auth?ticket=` | ✓ WIRED | e2e asserts prefix; `lib.rs` emits `ticket-received` |
| `ticket-received` | POST `/auth/session` | `redeemTicket` | ✓ WIRED | then `keychain_set_session` → `fetchMe` |
| `AuthGuard` | Redis `session:{token}` | Bearer | ✓ WIRED | unmatched paths 401 via catch-all |
| `fetchMe` | GET `/me` | Bearer | ✓ WIRED | `MeController` reads `request.user` |
| `/me` | SessionChip | `me.name` / `primaryRole` | ✓ WIRED | `App.tsx` `mt-auto` chip |
| POST `/auth/logout` | Authentik end-session | `endSessionUrl` | ✓ WIRED | then `open_login_window({ url })` |
| Global guard | `/health`, `/auth/login`, `/auth/callback`, POST `/auth/session` | `@Public()` | ✓ WIRED | those routes skip Bearer |
| default.json | keychain + `os:allow-hostname` | capabilities | ✓ WIRED | login.json has neither |
| `compose.clared.yml` | Nest `DATABASE_URL` / `REDIS_URL` | env | ✓ WIRED | `.env.example` localhost; prod = Coolify (human) |

**Wiring:** 12/12 code links WIRED. Live Authentik and Coolify FQDNs remain human.

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `MeController` | `/me` JSON | Redis session (ticket claims + `projectRbac`) | Yes in prod; AUTH_TEST_MODE uses `TEST_CLAIMS` | ✓ FLOWING |
| `SessionChip` | `me.name`, badge | `fetchMe` → `/me` | Yes when signed in | ✓ FLOWING |
| `LoginGate` | title/body/CTA | D-34 literals | Static copy (correct) | ✓ FLOWING |
| Gate hero | `<img src>` | `/login-gate-hero.png` | File on disk (5MB) | ✓ FLOWING |
| Desktop API | `BASE` | `VITE_BACKEND_URL` or localhost | Local default HTTP; prod HTTPS is env | ⚠️ STATIC default — Coolify URL not in repo |
| RBAC | `permissions` / `primaryRole` | Authentik group names | Catalog in `rbac.ts`; live groups need IdP | ✓ FLOWING (mapper); groups claim live = human |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| `projectRbac` catalog | `pnpm --filter ./apps/backend test -- rbac` | 8 passed | ✓ PASS |
| GETDEL + 401 + callback + logout | `npx jest --config ./test/jest-e2e.json -t "parallel POST\|GET /me without\|GET /health returns\|callback redirects\|POST /auth/logout"` | 5 passed, 4 skipped (name filter) | ✓ PASS |
| Unsigned gate copy | `vitest run src/__tests__/auth-gate.test.tsx -t "unsigned gate"` | 1 passed | ✓ PASS |
| Chip labels + routes | `vitest run session-chip / session-banner / routes.test.tsx` | 19 passed | ✓ PASS |
| Live Authentik grant | (no server started) | mock path only | ? SKIP |
| Coolify HTTPS | (no cluster) | — | ? SKIP |

Jest e2e printed an open-handle force-exit after pass. Info only — not a must-have failure.

### Probe Execution

No `scripts/*/tests/probe-*.sh`. PLAN/SUMMARY do not declare probes.

| Probe | Command | Result | Status |
| --- | --- | --- | --- |
| — | — | Step 7c SKIPPED (no probes) | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| BACK-01 | 02-01 … 02-05 | Desktop HTTPS + OIDC to vendor Coolify (API, Postgres, Redis, Authentik on founder cluster) | ? NEEDS HUMAN | Nest + Dockerfile + compose + typed fetch are in repo. Live Coolify HTTPS and cluster apply are not. Unauthenticated 401 is tested. |
| AUTH-01 | 02-01 … 02-05 | Authentik OIDC SSO/MFA; session; Mandant groups + `clared-platform`; min roles owner/accountant/viewer | ? NEEDS HUMAN | Confidential code flow + RBAC catalog + Tauri login window + keychain are in repo. Live MFA/OIDC untested (`AUTH_TEST_MODE`). |

**Coverage:** 0/2 requirements fully SATISFIED without human (code ready; live IdP/cluster open). No ORPHANED IDs: REQUIREMENTS.md maps only BACK-01 and AUTH-01 to Phase 2; both appear in every plan `requirements:` list. UI-01 stays Phase 1; Phase 2 SC1 is the login UI-SPEC (truth 1).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/lib.rs` | 93–101 | `allow_navigation` compares `host_str()` only; allows `data`/`about`/`blob` | ⚠️ Warning | REVIEW CR-01/WR-02. Hostname-only allowlist. Not scored as BLOCKER. |
| `apps/backend/src/auth/oidc.ts` | 56–64, 90–92 | `AUTH_TEST_MODE=1` mints `clared-owner` with no `NODE_ENV=production` guard | ⚠️ Warning | REVIEW CR-02. `.env.example` sets `AUTH_TEST_MODE=1`. Coolify must unset. |
| `apps/desktop/src/auth/session-provider.tsx` | 86–100, 135–151 | Redeem catch always `setState("unsigned")`; `ticket-received` and `onOpenUrl` can double-fire | ⚠️ Warning | REVIEW CR-03. Second 401 can wipe a live session. No test covers this race. |
| `apps/backend/src/main.ts` | 10–12 | CORS `origin: … ?? true` | ⚠️ Warning | REVIEW WR-01. Fail-open if `CORS_ORIGINS` unset. |
| `apps/backend/test/health.e2e-spec.ts` | 25–28 | `/health/ready` accepts 200 **or** 503 | ℹ️ Info | Does not isolate Postgres-up vs down. Code still uses `pingCheck`. |
| `apps/backend/src/auth/rbac.spec.ts` | 3–30 | Catalog arrays duplicated vs `rbac.ts` | ℹ️ Info | Value-level; independent copy of D-25, not generated from SUT. |

No `TBD` / `FIXME` / `XXX` in phase-touched app sources. No `describe.skip` / `it.skip` in desktop or backend tests. No `packages/tax-engine`. No invoice/entity HTTP handlers. No Fastify. No Nixpacks. No Stronghold. No JWT in desktop TS/TSX.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `apps/backend/src/auth/rbac.spec.ts` | AUTH-01 | 8 | 0 | no | value | PASS |
| `apps/backend/test/auth.e2e-spec.ts` | BACK-01, AUTH-01 | 6 (named run hit 5) | 0 disabled | no | behavioral (GETDEL, 401, logout) | PASS for session; INSUFFICIENT for live OIDC (AUTH_TEST_MODE) |
| `apps/backend/test/health.e2e-spec.ts` | BACK-01 | 2 | 0 | no | status (ready is 200\|503) | WARNING — ready does not split up/down |
| `apps/desktop/src/__tests__/auth-gate.test.tsx` | AUTH-01 | 6 | 0 | no | behavioral + copy | PASS |
| `apps/desktop/src/__tests__/session-chip.test.tsx` | AUTH-01 | 10 | 0 | no | value | PASS |
| `apps/desktop/src/__tests__/session-banner.test.tsx` | AUTH-01 | 3 | 0 | no | value | PASS |
| `apps/desktop/src/__tests__/routes.test.tsx` | AUTH-01 / UI-01 carry | 5 | 0 | no | value | PASS |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 1 warning (`/health/ready`); live OIDC covered by PRESENT_BEHAVIOR_UNVERIFIED, not a test-quality BLOCKER.

### Decision Coverage

All trackable CONTEXT.md decisions are honored by shipped artifacts. **39/39 honored.**

### Prohibitions (judgment-tier)

PLAN `must_haves.prohibitions` are all `flagged-unverified` (no `verification: test`). LLM-judge (grep, non-authoritative):

| Statement | Judge | Evidence |
| --- | --- | --- |
| MUST NOT present Clared as OSS/free/customer-self-hosted | honored | Root LICENSE UNLICENSED; gate copy has no OSS/free language |
| MUST NOT add a second HTTP framework beside Nest Express | honored | `@nestjs/platform-express` only; no Fastify |
| MUST NOT scaffold tax-engine or invoice/entity HTTP stubs | honored | no `packages/tax-engine`; no invoice/entity controllers; `/api/invoices` 401 via catch-all |
| MUST NOT put a JWT in the desktop or store the session in WebView storage | honored | opaque Bearer; keyring commands; no `localStorage` / jwt in `apps/desktop/src` |
| MUST NOT add a second role table in Postgres | honored | empty Prisma schema, no User/Role models |
| MUST NOT run `migrate dev` inside the production image | honored | Dockerfile CMD `migrate deploy` |
| MUST NOT use Nixpacks | honored | Dockerfile only; USER-SETUP says Dockerfile |
| MUST NOT use Tauri Stronghold | honored | `keyring` 4, no stronghold crate |
| MUST NOT give the login WebView keychain IPC | honored | `login.json` `core:default` only |
| MUST NOT open the system browser as the login path | honored | extra WebView `login`, not opener-as-login |
| MUST NOT show product screens while signed out | honored | `App.tsx` unsigned → `LoginGate` only |
| MUST NOT ship OSS/kostenlos/free/self-host copy | honored | German gate/banner/chip strings |
| MUST NOT add profile, billing, Avatar, theme toggle, toasts, Überall abmelden | honored | chip menu is Rolle + Abmelden |
| MUST NOT reuse `empty-state-hero.png` as gate hero | honored | gate uses `/login-gate-hero.png` |
| MUST NOT use English Logout or a light theme | honored | `Abmelden`; Phase 1 dark class remains |
| MUST NOT fork official Authentik compose.yml | honored | vendor file, tag 2026.8.0, no localtime |
| MUST NOT point Authentik at clared / clared_app | honored | compose.yml `POSTGRES_DB` authentik; clared DB is `compose.clared.yml` |
| MUST NOT mount `/etc/localtime` into Authentik | honored | no match in `compose.yml` |
| MUST NOT use implicit grant | honored | authorization code + PKCE S256 |
| MUST NOT implement `platform.impersonate` | honored | not in `PLATFORM_PERMISSIONS` |
| MUST NOT add a Button CVA variant API this phase | honored | call sites use `className` overrides |

**unverified-prohibition — human review recommended.** Interactive checkpoint must still look at copy and Coolify posture. Not a silent pass.

### Human Verification Required

Harvested from PLAN `<human-check>` blocks (02-04, 02-05) plus live-cluster truths and REVIEW CRs. Deduplicated.

### 1. Desktop gate / window / chip (02-04)

**Test:** Launch Tauri signed-out. Confirm dark gate (h1 Clared, body Anmelden, um Rechnungen zu stellen., one Anmelden, no sidebar). Click Anmelden: second window title Anmelden 480×640. Close/cancel: banner Anmeldung abgebrochen. After login: chip + sample invoice RE-2026-001. Keyboard: Tab/Enter on gate, chip menu Abmelden.
**Expected:** Gate, native login window, cancel banner, signed-in chip match 02-UI-SPEC. Product screens stay hidden while unsigned.
**Why human:** Visual chrome, window size, native titlebar, and WebView Authentik content are not provable from Vitest.

### 2. Live Authentik + founder Coolify (02-05 + truths 3, 5, 7)

**Test:** OrbStack `docker compose -f compose.yml -f compose.clared.yml up -d`. Apply `blueprints/clared.yaml`. Local `CLIENT_ID`/`SECRET` in `apps/backend/.env`; unset `AUTH_TEST_MODE`. Nest `pnpm start`. Desktop Anmelden completes Authentik MFA. Coolify: Dockerfile (not Nixpacks), env vars from USER-SETUP; `curl` `/health` and `/health/ready` on the vendor HTTPS URL.
**Expected:** MFA login; chip `primaryRole`; GET `/me` has `groups`. Prod ready-check hits `clared` / `clared_app`, not Authentik's database.
**Why human:** External IdP, MFA, blueprint apply, founder cluster. `02-USER-SETUP.md` is still Incomplete.

### 3. REVIEW CR-01 / CR-02 / CR-03 on a real login

**Test:** After a successful login, a second `clared://` / `ticket-received` for the same ticket must not sign the user out. Login WebView must not open `http://localhost:<other-port>`. Coolify must not have `AUTH_TEST_MODE=1`.
**Expected:** Session survives replay 401. Allowlist is origin-scoped. Production refuses the mock grant.
**Why human:** Runtime isolation and production env. Review findings are warnings here, not verification blockers.

### 4. Prohibition review

**Test:** Skim shipped copy and Coolify positioning (OSS/free/self-host language, prod SECRET location, login WebView IPC).
**Expected:** Must-NOT statements still hold in the running product.
**Why human:** Judgment-tier prohibitions. LLM grep is non-authoritative.

## Gaps Summary

**No automated gaps_found.** Code artifacts for BACK-01 / AUTH-01 are present, substantive, and wired. The phase **goal** (live Authentik sign-in + vendor Coolify HTTPS) is not behaviorally proven. That is `human_needed`, not a missing implementation.

REVIEW criticals (allowlist hostname, AUTH_TEST_MODE in production, double-redeem logout) are real defects to fix, but this verification does not convert them into `gaps:` YAML per orchestrator instruction. They sit in human verification + anti-pattern warnings.

Later milestone phases (3 entities/invoices/tax, 4 PDF/audit/offline) do **not** cover live Authentik or Coolify deploy — nothing deferred.

---

## Verification Metadata

**Verification approach:** Goal-backward from ROADMAP success criteria; PLAN must_haves merged without shrinking roadmap SCs; compound live-cluster clauses split.
**Must-haves source:** ROADMAP.md success criteria + PLAN.md frontmatter (end-state; Wave 0 RED superseded)
**Automated checks:** rbac 8/8, named e2e 5 pass, desktop 1+19 pass; artifact existence 24/24; decision coverage 39/39
**Human checks required:** 4
**gsd-tools artifact/link query:** unusable (string-shaped must_haves) — verified manually
**02-REVIEW.md:** recorded, not blocking
**02-USER-SETUP.md:** Incomplete — drives truths 3, 5, 7

---
_Verified: 2026-08-22T02:41:00Z_
_Verifier: Claude (gsd-verifier)_
