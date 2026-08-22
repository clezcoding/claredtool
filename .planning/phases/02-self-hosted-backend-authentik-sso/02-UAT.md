---
status: testing
phase: 02-self-hosted-backend-authentik-sso
source: [02-VERIFICATION.md, 02-06-SUMMARY.md, 02-07-SUMMARY.md]
started: 2026-08-22T02:44:00Z
updated: 2026-08-22T04:48:00Z
tester: human (gap-closure 02-06/02-07 done; vendor /health live)
---

## Current Test

number: 1
name: Desktop gate / Anmelden window (G-02-1 retest)
expected: |
  Launch Tauri signed-out. Dark gate. Click Anmelden: second window title Anmelden 480×640, no Vite data-URL error. Close: banner Anmeldung abgebrochen.
awaiting: user response

## Tests

### 1. Desktop gate / window / chip
expected: Launch Tauri signed-out. Dark gate (h1 Clared, body Anmelden, um Rechnungen zu stellen., one Anmelden, no sidebar). Click Anmelden: second window title Anmelden 480×640, no Vite data-URL error. Close/cancel: banner Anmeldung abgebrochen. After login: chip + sample invoice RE-2026-001. Keyboard: Tab/Enter on gate, chip menu Abmelden.
result: pending
reported: "Pre-02-06: gate visual matched; Anmelden failed (data URLs need webview-data-url). 02-06 enabled the crate feature. Retest the native window."

### 2. Live Authentik + founder Coolify
expected: Desktop with VITE_BACKEND_URL=https://clared-api.puzzlessdev.online. Anmelden completes Authentik MFA at https://clared-auth.puzzlessdev.online. Chip primaryRole; GET /me has groups. Coolify Dockerfile pack; curl /health and /health/ready 200. Prod SECRET never on the laptop. Local GHCR Authentik pull not required.
result: pending
reported: "02-07 closed vendor health: GET https://clared-api.puzzlessdev.online/health and /health/ready both HTTP 200. Coolify clared-api running:healthy, build_pack=dockerfile, AUTH_TEST_MODE absent. Desktop MFA against the live IdP still needs a human Tauri session (blocked on test 1 window paint)."

### 3. REVIEW CR-01 / CR-02 / CR-03 on a real login
expected: After successful login, a second clared:// / ticket-received for the same ticket does not sign the user out. Login WebView cannot open http://localhost:<other-port>. Coolify does not have AUTH_TEST_MODE=1.
result: blocked
blocked_by: other
reason: "No live Tauri login window (data-URL feature) and no Nest /health on Coolify, so a real ticket cannot be redeemed. CR-03 checked via Coolify env list: AUTH_TEST_MODE not present. CR-02 allow_navigation host allowlist exists in lib.rs; not exercised in a WebView."

### 4. Prohibition review
expected: Shipped copy and Coolify positioning: no OSS/free/self-host language; prod SECRET only on Coolify; login WebView has no keychain IPC.
result: pass

### 5. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass
reported: "Vendor API cold start after 02-07: Coolify rebuild finished; /health 200 {status:ok}; /health/ready 200 postgres.up. Local Authentik GHCR 2026.8.0 denial on this Mac remains environmental (G-02-5 leftover, not a vendor gap)."

### 6. Nest apps/backend package with scripts.test and scripts.test:e2e
expected: Nest apps/backend package with scripts.test and scripts.test:e2e
result: pass
source: automated
coverage_id: D1

### 7. RED projectRbac unit spec (missing ./rbac until 02-02)
expected: RED projectRbac unit spec (missing ./rbac until 02-02)
result: pass
source: automated
coverage_id: D2

### 8. RED health and auth e2e specs at /health, /me, /api/invoices, ticket TTL, logout
expected: RED health and auth e2e specs at /health, /me, /api/invoices, ticket TTL, logout
result: pass
source: automated
coverage_id: D3

### 9. Skipped desktop gate/chip/banner specs; desktop suite stays green
expected: Skipped desktop gate/chip/banner specs; desktop suite stays green
result: pass
source: automated
coverage_id: D4

### 10. Phase 1 routes.test.tsx still expects five nav labels and RE-2026-001
expected: Phase 1 routes.test.tsx still expects five nav labels and RE-2026-001
result: pass
source: automated
coverage_id: D5

### 11. GET /health 200 without Prisma I/O; GET /health/ready Terminus postgres ping
expected: GET /health 200 without Prisma I/O; GET /health/ready Terminus postgres ping
result: pass
source: automated
coverage_id: D1

### 12. Unauthenticated GET /me and GET /api/invoices return 401; one-time ticket GETDEL; logout this device only
expected: Unauthenticated GET /me and GET /api/invoices return 401; one-time ticket GETDEL; logout this device only
result: pass
source: automated
coverage_id: D2

### 13. projectRbac unions D-25 catalog and sets primaryRole by D-23 precedence
expected: projectRbac unions D-25 catalog and sets primaryRole by D-23 precedence
result: pass
source: automated
coverage_id: D3

### 14. Prisma init migration applied; GET /health/ready 200 against compose Postgres
expected: Prisma init migration applied; GET /health/ready 200 against compose Postgres
result: pass
source: automated
coverage_id: D4

### 15. Desktop typed fetch client compiles (redeemTicket, fetchMe)
expected: Desktop typed fetch client compiles (redeemTicket, fetchMe)
result: pass
source: automated
coverage_id: D5

### 16. OS keychain session commands on main, login capability navigation-only, os:allow-hostname on main
expected: OS keychain session commands on main, login capability navigation-only, os:allow-hostname on main
result: pass
source: automated
coverage_id: D1

### 17. Deep-link scheme clared, single-instance first, tauri-plugin-os registered
expected: Deep-link scheme clared, single-instance first, tauri-plugin-os registered
result: pass
source: automated
coverage_id: D2

### 18. Unsigned full-screen gate with Clared, Anmelden copy, hero path, no AppShell
expected: Unsigned full-screen gate with Clared, Anmelden copy, hero path, no AppShell
result: pass
source: automated
coverage_id: D1

### 19. Silent keychain boot spinner then sample invoice; /me 401 gate; network ErrorState retry
expected: Silent keychain boot spinner then sample invoice; /me 401 gate; network ErrorState retry
result: pass
source: automated
coverage_id: D2

### 20. Session chip German badges, email fallback, Rolle/Abmelden menu; 401/cancel banners
expected: Session chip German badges, email fallback, Rolle/Abmelden menu; 401/cancel banners
result: pass
source: automated
coverage_id: D3

### 21. Phase 1 hash routes still green with signed-in fixture (five NAV_ITEMS, RE-2026-001)
expected: Phase 1 hash routes still green with signed-in fixture (five NAV_ITEMS, RE-2026-001)
result: pass
source: automated
coverage_id: D5

### 22. openid-client discovery + ClientSecretPost + PKCE S256 + groups scope; pickGroups ID token then userinfo
expected: openid-client discovery + ClientSecretPost + PKCE S256 + groups scope; pickGroups ID token then userinfo
result: pass
source: automated
coverage_id: D1

### 23. Callback 302 clared://auth?ticket= and logout endSessionUrl …/application/o/clared/end-session/
expected: Callback 302 clared://auth?ticket= and logout endSessionUrl …/application/o/clared/end-session/
result: pass
source: automated
coverage_id: D2

### 24. Vendor compose.yml ghcr.io/goauthentik/server:2026.8.0, no redis service, no /etc/localtime
expected: Vendor compose.yml ghcr.io/goauthentik/server:2026.8.0, no redis service, no /etc/localtime
result: pass
source: automated
coverage_id: D3

### 25. Blueprint app clared, eight D-24 groups, OpenID groups scope mapping
expected: Blueprint app clared, eight D-24 groups, OpenID groups scope mapping
result: pass
source: automated
coverage_id: D4

## Summary

total: 25
passed: 22
issues: 0
pending: 2
skipped: 0
blocked: 1

## Gaps

- gap_id: G-02-1
  truth: "Click Anmelden opens a second window titled Anmelden at 480×640; cancel shows banner Anmeldung abgebrochen"
  status: failed
  reason: "Code-side closed in 02-06 (webview-data-url). Native window paint still unverified — retest in Current Test 1."
  severity: blocker
  test: 1
  root_cause: "open_login_window builds WebviewUrl::External from a data:text/html URL (login_init_url). Tauri 2 rejects data URLs unless the `webview-data-url` feature is enabled; apps/desktop/src-tauri/Cargo.toml has tauri = { version = \"2\", features = [] }."
  artifacts:
    - path: "apps/desktop/src-tauri/src/lib.rs"
      issue: "login_init_url() + WebviewUrl::External(data:)"
    - path: "apps/desktop/src-tauri/Cargo.toml"
      issue: "tauri features empty; webview-data-url not enabled"
  missing:
    - "Enable tauri feature webview-data-url, or load login-init.html via asset protocol instead of a data URL"
  debug_session: "inline-uat-orca"

- gap_id: G-02-2
  truth: "Coolify Dockerfile deploy of apps/backend serves GET /health and /health/ready 200 on the vendor HTTPS URL"
  status: resolved
  reason: "User reported: Dockerfile build pack used; image built; container unhealthy — Cannot find module '/app/apps/backend/dist/main.js' after prisma migrate deploy. curl /health 503."
  severity: blocker
  test: 2
  root_cause: "Image CMD runs `pnpm exec prisma migrate deploy && node dist/main.js` from WORKDIR /app/apps/backend. Migrate against Coolify Postgres clared/clared_app succeeds; Node then cannot resolve dist/main.js, so Nest never listens. Prisma also warns OpenSSL is missing in node:22-bookworm-slim. Nest build during docker build did not leave a runnable dist/main.js at that path."
  artifacts:
    - path: "apps/backend/Dockerfile"
      issue: "CMD node dist/main.js; no openssl; no assert that dist/main.js exists after nest build"
    - path: "apps/backend/nest-cli.json"
      issue: "sourceRoot src, deleteOutDir true — confirm emit path matches CMD"
  missing:
    - "Make nest build emit dist/main.js (or point CMD at the real emit path) and install openssl in the image"
    - "Redeploy clared-api after the image fix"
  debug_session: "inline-uat-coolify"

- gap_id: G-02-5
  truth: "Fresh start: services boot and a primary health query returns live data"
  status: resolved
  reason: "User reported: Local Authentik 2026.8.0 pull denied on GHCR from this Mac. Coolify API crashed on missing dist/main.js. Local postgres was already up."
  severity: blocker
  test: 5
  root_cause: "Same Coolify start-path failure as G-02-2 for the vendor API. Local Authentik cannot pull ghcr.io/goauthentik/server:2026.8.0 on this laptop (registry denied); Coolify host can pull that tag. Cold-start of local IdP is blocked by GHCR auth/rate-limit on the Mac, not by compose.yml."
  artifacts:
    - path: "compose.yml"
      issue: "image tag 2026.8.0 pulls on Coolify, denied on local Docker/GHCR"
    - path: "apps/backend/Dockerfile"
      issue: "see G-02-2"
  missing:
    - "Local GHCR pull access or a mirrored Authentik tag for OrbStack"
    - "G-02-2 image fix so Coolify /health works on a true cold deploy"
  debug_session: "inline-uat-cold-start"
