---
phase: 02-self-hosted-backend-authentik-sso
fixed_at: 2026-08-22T10:41:16Z
review_path: .planning/phases/02-self-hosted-backend-authentik-sso/02-REVIEW.md
iteration: 1
findings_in_scope: 9
fixed: 8
skipped: 1
status: partial
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-08-22T10:41:16Z
**Source review:** `.planning/phases/02-self-hosted-backend-authentik-sso/02-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 9
- Fixed: 8
- Skipped: 1

**Verification:** Per-fix syntax/re-read checks ran in the isolated review-fix worktree (`gsd-reviewfix/02-13109` at `.claude/worktrees/rf-02-13109-1787394509`), not the main checkout. `cargo check` for `lib.rs` reused the main `src-tauri/target` dir. No full test suite was run (per-fix verification only). Worktree Jest could not load `ts-jest` against TypeScript 7 (pre-existing toolchain mismatch); that did not trigger rollback.

## Fixed Issues

### CR-01: Logout is recorded as `lastRequest`, so the next redeem logs the user back out

**Files modified:** `apps/desktop/src/auth/api.ts`
**Commit:** 4576002
**Applied fix:** `logoutSession` uses raw `fetch` (same as `fetchMe`), then clears `lastRequest`. `replayLastRequest` skips `/auth/logout`.

### WR-01: 401 handler leaves the shell (`unsigned`), violating D-31

**Files modified:** `apps/desktop/src/auth/session-provider.tsx`
**Commit:** a028acd
**Applied fix:** Mid-session 401 keeps `signed` and `me`, clears `tokenRef`/`token`, sets `bannerKind: "unauthorized"`, opens the login window. Boot `/me` 401 still goes `unsigned`. **Status:** `fixed: requires human verification`

### WR-02: Closing the login window never shows „Anmeldung abgebrochen“ (D-20)

**Files modified:** `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src/auth/session-provider.tsx`
**Commit:** dc23ec0
**Applied fix:** Login window `Destroyed` emits `login-cancelled` unless a ticket was already sent. Provider listens and sets `bannerKind: "cancel"` only when `login()` / 401 opened the window. **Status:** `fixed: requires human verification`

### WR-03: Confidential-client `SECRET` defaults to empty string

**Files modified:** `apps/backend/src/auth/oidc.ts`, `apps/backend/src/auth/oidc.spec.ts`
**Commit:** de2871a
**Applied fix:** `clientSecret()` throws `SECRET is required` on the live discovery path (`beginAuthorization` and `authorizationCodeGrant`). Unit test covers the missing-secret case.

### WR-04: Catch-all `401` likely shadows Swagger (`/api/docs`, `openapi.json`)

**Files modified:** `apps/backend/src/http/catch-all.controller.ts`, `apps/backend/src/http/docs.controller.ts`, `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`
**Commit:** 4b39e32
**Applied fix:** `@Public()` `DocsController` serves the OpenAPI document at `GET /openapi.json` and `GET /api/docs`. Catch-all skips those paths with `NotFoundException`. `SwaggerModule.setup` remains for Express UI assets.

### IN-01: `AUTH_TEST_MODE=1` is only refused when `NODE_ENV === "production"`

**Files modified:** `apps/backend/src/auth/oidc.ts`, `apps/backend/src/auth/oidc.spec.ts`
**Commit:** bf02411
**Applied fix:** Outside `NODE_ENV=test`, `AUTH_TEST_MODE=1` throws (SECRET-set message when `SECRET` is present; otherwise only-allowed-in-test). Production throw kept. Jest e2e (`NODE_ENV=test`) still works. **Status:** `fixed: requires human verification`

### IN-02: `prisma.config.ts` invents a dummy `DATABASE_URL` if unset

**Files modified:** `apps/backend/prisma.config.ts`
**Commit:** 4f7ca0b
**Applied fix:** Config no longer assigns a dummy URL. Prisma/`env("DATABASE_URL")` errors if missing. Dockerfile generate-time `ARG DATABASE_URL` unchanged.

### IN-04: `/health/ready` e2e does not assert Redis

**Files modified:** `apps/backend/test/health.e2e-spec.ts`
**Commit:** 59471ed
**Applied fix:** Ready e2e also expects `redis` in the JSON body.

## Skipped Issues

### IN-03: `webview-data-url` remains process-wide

**File:** `apps/desktop/src-tauri/Cargo.toml:16-17`
**Reason:** No code change. Feature is already documented as login-only; `allow_navigation` already origin-keys `data:` to `login_init_url()`. Fix is a future-guard ("do not add another data-URL window"), not a current defect.
**Original issue:** Feature is on the `tauri` crate. Future `WebviewWindowBuilder` can still load `data:` without a second Cargo change.

---

_Fixed: 2026-08-22T10:41:16Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
