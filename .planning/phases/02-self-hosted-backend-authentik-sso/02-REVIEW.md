---
phase: 02-self-hosted-backend-authentik-sso
reviewed: 2026-08-22T02:35:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - apps/backend/src/main.ts
  - apps/backend/src/app.module.ts
  - apps/backend/src/health/health.controller.ts
  - apps/backend/src/auth/auth.controller.ts
  - apps/backend/src/auth/auth.guard.ts
  - apps/backend/src/auth/rbac.ts
  - apps/backend/src/auth/oidc.ts
  - apps/backend/src/me/me.controller.ts
  - apps/desktop/src/auth/api.ts
  - apps/desktop/src/auth/login-gate.tsx
  - apps/desktop/src/auth/session-provider.tsx
  - apps/desktop/src/components/session-chip.tsx
  - apps/desktop/src/components/session-banner.tsx
  - apps/desktop/src/App.tsx
  - apps/desktop/src-tauri/src/lib.rs
  - apps/desktop/src-tauri/capabilities/default.json
  - apps/desktop/src-tauri/capabilities/login.json
  - compose.yml
  - blueprints/clared.yaml
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-08-22T02:35:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Adversarial review of the Authentik SSO / opaque Redis Bearer path (Nest confidential client, ticket GETDEL, Tauri login WebView, OS keychain IPC ACL).

GETDEL on `oauth:{state}` and `ticket:{id}`, session `EX 86400`, blueprint `client_type: confidential` without `client_secret`, `login.json` navigation-only, and no JWT / WebView storage of the Bearer are in place. Three defects still break the login-WebView isolation, the production auth guarantee, or a successful sign-in.

## Critical Issues

### CR-01: Login WebView allowlist matches hostname only

**File:** `apps/desktop/src-tauri/src/lib.rs:93-101`
**Issue:** `host_of` / `allow_navigation` compare `host_str()` (no scheme, no port). Default `BACKEND_URL=http://localhost:3000` and `AUTHENTIK_URL=http://localhost:9000` both collapse to host `localhost`, so **any** `http://localhost:<port>` (and `https://localhost:<port>`) is allowed. An Authentik XSS, open redirect, or `open_login_window({ url })` from main can navigate the login WebView to another local service. Same class in production: any extra port on the API/IdP hostname passes.
**Fix:** Compare full origins (scheme + host + port). Reject `blob:`. Allow `data:` only for the login-init document.

```rust
fn origin_key(url: &Url) -> Option<String> {
    let host = url.host_str()?.to_ascii_lowercase();
    let port = url.port_or_known_default()?;
    Some(format!("{}://{}:{}", url.scheme(), host, port))
}

fn allow_navigation(url: &Url, backend: Option<&str>, authentik: Option<&str>) -> bool {
    match url.scheme() {
        "about" => true,
        "data" => url.as_str() == login_init_url().as_str(),
        "http" | "https" => {
            let origin = origin_key(url);
            origin.as_deref() == backend || origin.as_deref() == authentik
        }
        _ => false,
    }
}
```

Pass `origin_key` of the configured `BACKEND_URL` / `AUTHENTIK_URL` into `allow_navigation` instead of hostname.

### CR-02: `AUTH_TEST_MODE=1` mints `clared-owner` with no production guard

**File:** `apps/backend/src/auth/oidc.ts:56-64`, `90-92`
**Issue:** When `AUTH_TEST_MODE === "1"`, `beginAuthorization` redirects to `/auth/callback` and `authorizationCodeGrant` returns hardcoded `TEST_CLAIMS` (`groups: ["clared-owner"]`) with no Authentik, no client secret, and no `NODE_ENV` check. `/auth/login` and `/auth/callback` are `@Public()`. Coolify or a copied `.env.example` (`AUTH_TEST_MODE=1`) makes every reachable client an owner. Dockerfile sets `NODE_ENV=production` but does not refuse this flag.
**Fix:** Fail closed in production; keep the mock for `NODE_ENV=test` only.

```ts
function testModeEnabled(): boolean {
  if (process.env.AUTH_TEST_MODE !== "1") return false;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_TEST_MODE=1 is forbidden when NODE_ENV=production");
  }
  return true;
}
```

Replace both `process.env.AUTH_TEST_MODE === "1"` branches with `testModeEnabled()`.

### CR-03: Failed second ticket redeem wipes a live session

**File:** `apps/desktop/src/auth/session-provider.tsx:86-100` (callers `135-143`, `148-151`)
**Issue:** `redeem`'s `catch` always `setState("unsigned")` and clears token/me. Boot registers **both** `ticket-received` and `onOpenUrl`, then also redeems `getCurrent()`. WebView intercept emits `ticket-received` **and** the OS deep-link plugin can deliver the same `clared://auth?ticket=`. First redeem GETDELs the ticket (200); the loser 401s and **signs the user out** after a successful login. Same wipe if a stale deep-link arrives while a keychain session is already signed.
**Fix:** Dedupe in-flight tickets; do not demote an already-signed session on redeem failure.

```ts
const seenTickets = useRef(new Set<string>());
const redeem = useCallback(
  async (ticket: string) => {
    if (seenTickets.current.has(ticket)) return;
    seenTickets.current.add(ticket);
    try {
      // ... existing success path
    } catch {
      setBannerKind("cancel");
      setToken((current) => {
        if (current) return current;
        setMe(null);
        setState("unsigned");
        return null;
      });
    }
  },
  [applySession],
);
```

Prefer a `signed`/`token` ref so the catch does not race React state. Ignore 401 on redeem when `state === "signed"`.

## Warnings

### WR-01: CORS reflects any origin when `CORS_ORIGINS` is unset

**File:** `apps/backend/src/main.ts:10-12`
**Issue:** `origin: process.env.CORS_ORIGINS?.split(",") ?? true` enables credential-less CORS for every browser origin. Combined with public `POST /auth/session`, a web page that obtains a 60s ticket (logs, another handler, leaked `Location`) can redeem it. Coolify forgetting `CORS_ORIGINS` ships this default.
**Fix:** Fail closed: require `CORS_ORIGINS`, split/trim, never `true`.

```ts
const origins = process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean);
if (!origins?.length) {
  throw new Error("CORS_ORIGINS is required");
}
app.enableCors({ origin: origins });
```

### WR-02: `blob:` / unrestricted `data:` bypass the host allowlist

**File:** `apps/desktop/src-tauri/src/lib.rs:95`
**Issue:** After Authentik HTML is loaded, XSS can `location = URL.createObjectURL(...)` (`blob:`) or a `data:` document. `allow_navigation` returns true without checking backend/Authentik. Login capability still blocks keychain IPC, but the WebView can then paint an arbitrary phishing page inside the trusted "Anmelden" window.
**Fix:** Covered by CR-01: allow `data:` only for `login_init_url()`; deny `blob:`.

### WR-03: Login CSP is not origin-scoped and likely not enforced after navigation

**File:** `apps/desktop/src-tauri/src/lib.rs:80-91`
**Issue:** `login_csp` interpolates the raw `BACKEND_URL` / `AUTHENTIK_URL` strings (paths, trailing slashes, `;` / extra hosts break or widen CSP). The policy is injected with `document.createElement('meta')` via `initialization_script`. Chromium/WebKit ignore CSP meta tags inserted by script after/during parse, so Authentik pages may run with **no** app-imposed CSP. `login-init.html` static CSP is real; later documents are not.
**Fix:** Build CSP from `url.origin` only (quote-safe). Prefer Tauri/WebView CSP header if the crate exposes it; otherwise `on_navigation` origin allowlist (CR-01) is the real control — document that the meta tag is defense-in-depth only, not D-15.

```rust
fn origin_source(raw: &str) -> String {
    Url::parse(raw)
        .ok()
        .map(|u| u.origin().ascii_serialization())
        .unwrap_or_default()
}
```

### WR-04: 401 while signed leaves Bearer in memory and keychain

**File:** `apps/desktop/src/auth/session-provider.tsx:166-176`
**Issue:** `setOnUnauthorized` sets the banner and opens login but does **not** `keychain_delete_session`, clear `token`/`me`, or leave `signed`. UI stays in `AppShell` with a dead Bearer. Boot-path 401 does delete the keychain (`118-123`); the live path does not.
**Fix:** On 401 in `signed`, delete keychain, clear token/me, keep banner, then open login (or stay on shell with banner only after a successful re-redeem).

### WR-05: Ticket / oauth payloads parsed without validation

**File:** `apps/backend/src/auth/auth.controller.ts:69-73`, `104-109`; `apps/backend/src/auth/auth.guard.ts:37-42`
**Issue:** `JSON.parse` on Redis values is untyped and unguarded. Corrupt or non-object payloads throw (500) instead of 401. `GET /auth/callback` GETDELs `oauth:{state}` **before** requiring `code`; a callback with `state` only burns PKCE and then fails the grant.
**Fix:** Require `code` before GETDEL (or GETDEL then 401 if `!code`). Wrap parse; 401 on failure. Optionally assert `code_verifier` / `sub` are non-empty strings before minting a session.

```ts
if (!state || !code) {
  throw new UnauthorizedException();
}
```

### WR-06: `projectRbac` uses `in`, so prototype keys are treated as catalog hits

**File:** `apps/backend/src/auth/rbac.ts:113-122`
**Issue:** `'constructor' in CATALOG` is true. Authentik groups named `constructor` / `__proto__` pass the guard, then `CATALOG[\`clared-${role}\`]` is `undefined` and `[...undefined]` throws during callback — login 500. Not a privilege escalation, but a login DoS on weird group names.
**Fix:**

```ts
if (!Object.hasOwn(CATALOG, group)) {
  continue;
}
```

## Info

### IN-01: Session Bearer is on React context

**File:** `apps/desktop/src/auth/session-provider.tsx:215-219`
**Issue:** Opaque token is not a JWT and is not written to `localStorage` (spec OK), but `token` is on `SessionContextValue` so any child can read/log it.
**Fix:** Keep token in a ref / module binding used only by `apiFetch`; do not put it on context.

### IN-02: Ticket `SET NX` result ignored

**File:** `apps/backend/src/auth/auth.controller.ts:86-93`
**Issue:** Collision or Redis failure still `302 clared://auth?ticket=...`. 256-bit collision is unrealistic; a failed `SET` still strands the desktop on a dead ticket.
**Fix:** If `set` returns `null`, generate another ticket or 500 without redirect.

### IN-03: `/health/ready` does not ping Redis

**File:** `apps/backend/src/health/health.controller.ts:21-27`
**Issue:** Ready can be 200 while tickets/sessions cannot be stored. Auth is Redis-backed.
**Fix:** Add a Redis ping check next to Prisma.

### IN-04: Authentik worker mounts `/var/run/docker.sock` as `root`

**File:** `compose.yml:53-64`
**Issue:** Matches upstream Authentik compose (outposts). Compromised worker is host-root. Fine for laptop OrbStack; do not copy this mount onto a shared Coolify host without reviewing outpost need.
**Fix:** Drop `user: root` and the docker.sock volume when outposts are unused.

---

_Reviewed: 2026-08-22T02:35:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
