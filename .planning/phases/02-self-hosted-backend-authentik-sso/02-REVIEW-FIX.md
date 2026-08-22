---
phase: 02-self-hosted-backend-authentik-sso
fixed_at: 2026-08-22T05:59:47Z
review_path: .planning/phases/02-self-hosted-backend-authentik-sso/02-REVIEW.md
iteration: 1
findings_in_scope: 25
fixed: 24
skipped: 1
status: partial
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-08-22T05:59:47Z
**Source review:** `.planning/phases/02-self-hosted-backend-authentik-sso/02-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 25
- Fixed: 24
- Skipped: 1

**Verification:** Syntax and re-read checks ran in the isolated review-fix worktree (`gsd-reviewfix/02-1659`), not the main checkout. No full test suite was run (per-fix verification only). TypeScript transpile was used for `oidc.ts` / `oidc.spec.ts`. `pnpm install --lockfile-only` ran in the worktree for IN-09.

## Fixed Issues

### CR-01: Login WebView allowlist matches hostname only

**Files modified:** `apps/desktop/src-tauri/src/lib.rs`
**Commit:** 22a4cf5
**Applied fix:** Navigation allowlist now compares scheme+host+port origins. `blob:` is denied. `data:` is allowed only for the login-init document. `open_login_window` rejects `url` unless the origin is backend or Authentik.

### CR-02: `AUTH_TEST_MODE=1` mints `clared-owner` with no production guard

**Files modified:** `apps/backend/src/auth/oidc.ts`, `apps/backend/src/auth/oidc.spec.ts`, `apps/backend/.env.example`
**Commit:** 23f871e
**Applied fix:** `testModeEnabled()` throws when `NODE_ENV=production`. Both OIDC short-circuits use it. `.env.example` defaults to `AUTH_TEST_MODE=0`. Unit test covers the production throw.

### CR-03: Failed second ticket redeem wipes a live session

**Files modified:** `apps/desktop/src/auth/session-provider.tsx`
**Commit:** 795060c
**Applied fix:** Dedupes tickets in a ref; redeem failure does not clear an existing session (`tokenRef`). **Status:** `fixed: requires human verification`

### WR-01: CORS reflects any origin when `CORS_ORIGINS` is unset

**Files modified:** `apps/backend/src/main.ts`
**Commit:** 6baad3c
**Applied fix:** Bootstrap throws if `CORS_ORIGINS` is missing or empty after split/trim. No `true` fallback.

### WR-03: Login CSP is not origin-scoped and likely not enforced after navigation

**Files modified:** `apps/desktop/src-tauri/src/lib.rs`
**Commit:** 92d1f30
**Applied fix:** CSP sources are `origin_of(BACKEND_URL/AUTHENTIK_URL)` only. Comment notes the injected meta tag is defense-in-depth; `allow_navigation` is the real control.

### WR-04: 401 while signed leaves Bearer in memory and keychain

**Files modified:** `apps/desktop/src/auth/session-provider.tsx`
**Commit:** 3483d02
**Applied fix:** Live 401 deletes keychain, clears token/me, keeps the unauthorized banner, sets unsigned (LoginGate still shows the banner), then opens login. **Status:** `fixed: requires human verification`

### WR-05: Ticket / oauth payloads parsed without validation

**Files modified:** `apps/backend/src/auth/auth.controller.ts`, `apps/backend/src/auth/auth.guard.ts`
**Commit:** 677f437
**Applied fix:** Callback requires `code` and `state` before GETDEL. JSON parse helpers 401 on corrupt or missing `code_verifier` / `sub`.

### WR-06: `projectRbac` uses `in`, so prototype keys are treated as catalog hits

**Files modified:** `apps/backend/src/auth/rbac.ts`, `apps/backend/src/auth/rbac.spec.ts`
**Commit:** 91bfb69
**Applied fix:** `Object.hasOwn(CATALOG, group)`. Spec covers `constructor` / `__proto__` / `toString`.

### WR-07: Production image and runtime keep a default `DATABASE_URL` with committed credentials

**Files modified:** `apps/backend/Dockerfile`, `apps/backend/src/prisma/prisma.service.ts`, `apps/backend/prisma.config.ts`, `apps/backend/test/auth.e2e-spec.ts`, `apps/backend/test/health.e2e-spec.ts`
**Commit:** c0a984b
**Applied fix:** Build ARG is a dummy URL used only during `RUN`; image `ENV DATABASE_URL` is empty. `PrismaService` throws if unset. prisma.config generate fallback is a non-app dummy. E2E sets a test URL.

### WR-08: Image has no `USER`; Nest, Prisma migrate, and curl run as root

**Files modified:** `apps/backend/Dockerfile`
**Commit:** 5b02888
**Applied fix:** `chown -R node:node /app` then `USER node` before `CMD`.

### WR-09: `COPY apps/backend` without `.dockerignore` can overwrite the Linux install

**Files modified:** `.dockerignore`
**Commit:** e4ca2da
**Applied fix:** Root `.dockerignore` excludes `node_modules`, `.env`, `dist`, `.git`, `.planning`, `.claude`, `.cursor`.

### WR-10: Missing `REDIS_URL` silently uses in-process `MemoryStore` in production

**Files modified:** `apps/backend/src/redis/redis.service.ts`
**Commit:** c427deb
**Applied fix:** `MemoryStore` only when `NODE_ENV=test`. Otherwise `REDIS_URL` is required.

### WR-11: `fetchMe` overwrites `lastRequest`, so D-31 never retries the 401'd call

**Files modified:** `apps/desktop/src/auth/api.ts`
**Commit:** 0110fcc
**Applied fix:** `fetchMe` uses raw `fetch` and does not update `lastRequest`. **Status:** `fixed: requires human verification`

### WR-12: Root `.env` (Authentik `PG_PASS` / `AUTHENTIK_SECRET_KEY`) is not gitignored

**Files modified:** `.gitignore`
**Commit:** b14ac5e
**Applied fix:** Ignore `.env` at repo root; keep `!.env.example` and `apps/backend/.env`.

### WR-13: Logout API failure skips Authentik `end_session` (D-21)

**Files modified:** `apps/desktop/src/auth/session-provider.tsx`
**Commit:** fc0f75c
**Applied fix:** Logout catch still clears local session and opens Authentik `end-session` from `VITE_AUTHENTIK_URL`. **Status:** `fixed: requires human verification`

### IN-01: Session Bearer is on React context

**Files modified:** `apps/desktop/src/auth/session-provider.tsx`
**Commit:** d174405
**Applied fix:** Removed `token` from `SessionContextValue`. Token stays in provider state/ref for logout and API calls only.

### IN-02: Ticket `SET NX` result ignored

**Files modified:** `apps/backend/src/auth/auth.controller.ts`
**Commit:** 2856d53
**Applied fix:** Callback returns 500 (`InternalServerErrorException`) if ticket `SET NX` is not `"OK"`, instead of redirecting to a dead ticket.

### IN-03: `/health/ready` does not ping Redis

**Files modified:** `apps/backend/src/auth/memory-store.ts`, `apps/backend/src/redis/redis.service.ts`, `apps/backend/src/health/health.controller.ts`
**Commit:** b048ecb
**Applied fix:** `KeyValueStore.ping()`; `/health/ready` checks Redis next to Prisma.

### IN-04: Authentik worker mounts `/var/run/docker.sock` as `root`

**Files modified:** `compose.yml`
**Commit:** 976741d
**Applied fix:** Removed `user: root` and the docker.sock volume from the Authentik worker (outposts unused on the laptop compose).

### IN-05: `tsconfig.build.json` does not pin `rootDir`

**Files modified:** `apps/backend/tsconfig.build.json`
**Commit:** c9ba5c2
**Applied fix:** `"rootDir": "./src"` next to `include: ["src"]`.

### IN-06: `webview-data-url` is process-wide

**Files modified:** `apps/desktop/src-tauri/Cargo.toml`
**Commit:** b3d840f
**Applied fix:** Comment that only `open_login_window` loads a data URL; paired with CR-01 allowlist.

### IN-07: Auth e2e replay test does not assert the first redeem succeeds

**Files modified:** `apps/backend/test/auth.e2e-spec.ts`
**Commit:** 3f85ab3
**Applied fix:** First `POST /auth/session` expects 200 and a string `token`.

### IN-08: CI runs only `rbac` unit tests, not `oidc.spec.ts`

**Files modified:** `.github/workflows/ci.yml`
**Commit:** d31c72d
**Applied fix:** `pnpm --filter ./apps/backend test` (full Jest).

### IN-09: `@nestjs/config` is unused

**Files modified:** `apps/backend/package.json`, `pnpm-lock.yaml`
**Commit:** 1519b07
**Applied fix:** Removed the unused dependency and lockfile entries.

## Skipped Issues

### WR-02: `blob:` / unrestricted `data:` bypass the host allowlist

**File:** `apps/desktop/src-tauri/src/lib.rs:95`
**Reason:** Already applied by CR-01 (`blob:` denied; `data:` only for `login_init_url()`; IPC `url` origin-checked). No additional code change.
**Original issue:** After Authentik HTML is loaded, XSS can navigate to `blob:` or a `data:` document. `allow_navigation` returned true without checking backend/Authentik.

---

_Fixed: 2026-08-22T05:59:47Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
