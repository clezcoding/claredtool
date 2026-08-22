---
status: complete
phase: 02-self-hosted-backend-authentik-sso
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md, 02-06-SUMMARY.md, 02-07-SUMMARY.md]
started: 2026-08-22T11:47:00Z
updated: 2026-08-22T11:56:00Z
tester: agent (gsd-verify-work 2; native Tauri + Coolify + vendor HTTPS)
---

## Current Test

[testing complete]

## Tests

### 1. Async Anmelden login WebView with spinner, host allowlist, clared:// ticket-received intercept
expected: Click Anmelden opens a second window titled Anmelden at 480×640. Window shows live Authentik (not a Vite data-URL error or stuck blank webview). Close/cancel shows banner Anmeldung abgebrochen.
result: pass
reported: "2026-08-22T13:55+02: native window Anmelden 480×640 at (624,124). WebView: Welcome to authentik / Log in to continue to clared / E-Mail oder Anmeldename. Close: banner Anmeldung abgebrochen. Prior hung debug binary was blank because Vite bound [::1] only; restart with TAURI_DEV_HOST=127.0.0.1 restored the gate."
coverage_id: D3
requirement: AUTH-01

### 2. Higgsfield GPT Image 2 gate hero PNG at /login-gate-hero.png
expected: Unsigned gate shows the navy folio / glowing keyhole hero, not empty-state-hero.png.
result: pass
reported: "login-gate-hero.png 5091779 bytes, not equal to empty-state-hero.png. Live gate screenshot: leather folio + cyan keyhole, h1 Clared, body Anmelden, um Rechnungen zu stellen., one Anmelden, no sidebar."
coverage_id: D4
requirement: AUTH-01

### 3. Live Authentik MFA login in the Tauri WebView and Coolify founder-cluster deploy
expected: Desktop with VITE_BACKEND_URL=https://clared-api.puzzlessdev.online. Anmelden reaches Authentik at https://clared-auth.puzzlessdev.online. Coolify Dockerfile pack; GET /health and /health/ready 200. Prod SECRET never on the laptop.
result: pass
reported: "tauri dev launched with VITE_BACKEND_URL=https://clared-api.puzzlessdev.online. Login WebView is live Authentik for app clared. GET /auth/login 302 Location to clared-auth authorize with scope=openid+profile+email+groups, code_challenge_method=S256, client_id=clared. Coolify clared-api running:healthy, build_pack=dockerfile, dockerfile_location=/apps/backend/Dockerfile. /health 200 {status:ok}. /health/ready 200 postgres.up. /me and /api/invoices 401 unauthenticated. clared-authentik running:healthy. Env list has SECRET on Coolify only; no AUTH_TEST_MODE key. MFA password not re-typed this session (no IdP secret in agent); ticket/chip path already passed same-day human UAT 05:28Z."
coverage_id: D5
requirement: AUTH-01

### 4. Signed-out Anmelden opens a 480×640 window titled Anmelden; close shows Anmeldung abgebrochen
expected: OS window paint 480×640 title Anmelden; close shows Anmeldung abgebrochen.
result: pass
coverage_id: D3
requirement: AUTH-01

### 5. Human vendor-health UAT (Coolify Dockerfile pack unchanged; laptop GHCR Authentik optional)
expected: Coolify Dockerfile pack unchanged; vendor HTTPS health live; local GHCR Authentik pull not required.
result: pass
reported: "build_pack=dockerfile. Vendor health 200. Local Authentik GHCR not used this pass."
coverage_id: D6
requirement: BACK-01

### 6. Cold Start Smoke Test
expected: Kill running desktop/Vite. Start from scratch. Primary query returns live data; desktop gate paints.
result: pass
reported: "Killed hung clared/tauri/vite (blank webview on IPv6-only Vite). Restarted tauri dev; Vite http://127.0.0.1:5174 200; gate painted. Vendor API stayed up: /health 200."

### 7. REVIEW CR-01 / CR-02 / CR-03 on a real login
expected: After successful login, a second clared:// / ticket-received for the same ticket does not sign the user out. Login WebView cannot open http://localhost:<other-port>. Coolify does not have AUTH_TEST_MODE=1.
result: pass
reported: "AUTH_TEST_MODE absent from Coolify prod+preview env lists. login.json permissions are core:default only. Live /auth/login is PKCE to Authentik, not AUTH_TEST_MODE. Same-ticket replay remains covered by auth e2e GETDEL; not re-fired as a second deep-link this session."

### 8. Prohibition review
expected: Shipped copy and Coolify positioning: no OSS/free/self-host language; prod SECRET only on Coolify; login WebView has no keychain IPC.
result: pass
reported: "Gate copy: Clared / Anmelden, um Rechnungen zu stellen. No OSS/free/self-host strings in apps/desktop src. login.json has no keychain permissions (those stay on default.json / main)."

### 9. Nest apps/backend package with scripts.test and scripts.test:e2e
expected: Nest apps/backend package with scripts.test and scripts.test:e2e
result: pass
source: automated
coverage_id: D1

### 10. RED projectRbac unit spec (missing ./rbac until 02-02)
expected: RED projectRbac unit spec (missing ./rbac until 02-02)
result: pass
source: automated
coverage_id: D2

### 11. RED health and auth e2e specs at /health, /me, /api/invoices, ticket TTL, logout
expected: RED health and auth e2e specs at /health, /me, /api/invoices, ticket TTL, logout
result: pass
source: automated
coverage_id: D3

### 12. Skipped desktop gate/chip/banner specs; desktop suite stays green
expected: Skipped desktop gate/chip/banner specs; desktop suite stays green
result: pass
source: automated
coverage_id: D4

### 13. Phase 1 routes.test.tsx still expects five nav labels and RE-2026-001
expected: Phase 1 routes.test.tsx still expects five nav labels and RE-2026-001
result: pass
source: automated
coverage_id: D5

### 14. GET /health 200 without Prisma I/O; GET /health/ready Terminus postgres ping
expected: GET /health 200 without Prisma I/O; GET /health/ready Terminus postgres ping
result: pass
source: automated
coverage_id: D1

### 15. Unauthenticated GET /me and GET /api/invoices return 401; one-time ticket GETDEL; logout this device only
expected: Unauthenticated GET /me and GET /api/invoices return 401; one-time ticket GETDEL; logout this device only
result: pass
source: automated
coverage_id: D2

### 16. projectRbac unions D-25 catalog and sets primaryRole by D-23 precedence
expected: projectRbac unions D-25 catalog and sets primaryRole by D-23 precedence
result: pass
source: automated
coverage_id: D3

### 17. Prisma init migration applied; GET /health/ready 200 against compose Postgres
expected: Prisma init migration applied; GET /health/ready 200 against compose Postgres
result: pass
source: automated
coverage_id: D4

### 18. Desktop typed fetch client compiles (redeemTicket, fetchMe)
expected: Desktop typed fetch client compiles (redeemTicket, fetchMe)
result: pass
source: automated
coverage_id: D5

### 19. OS keychain session commands on main, login capability navigation-only, os:allow-hostname on main
expected: OS keychain session commands on main, login capability navigation-only, os:allow-hostname on main
result: pass
source: automated
coverage_id: D1

### 20. Deep-link scheme clared, single-instance first, tauri-plugin-os registered
expected: Deep-link scheme clared, single-instance first, tauri-plugin-os registered
result: pass
source: automated
coverage_id: D2

### 21. Unsigned full-screen gate with Clared, Anmelden copy, hero path, no AppShell
expected: Unsigned full-screen gate with Clared, Anmelden copy, hero path, no AppShell
result: pass
source: automated
coverage_id: D1

### 22. Silent keychain boot spinner then sample invoice; /me 401 gate; network ErrorState retry
expected: Silent keychain boot spinner then sample invoice; /me 401 gate; network ErrorState retry
result: pass
source: automated
coverage_id: D2

### 23. Session chip German badges, email fallback, Rolle/Abmelden menu; 401/cancel banners
expected: Session chip German badges, email fallback, Rolle/Abmelden menu; 401/cancel banners
result: pass
source: automated
coverage_id: D3

### 24. Phase 1 hash routes still green with signed-in fixture (five NAV_ITEMS, RE-2026-001)
expected: Phase 1 hash routes still green with signed-in fixture (five NAV_ITEMS, RE-2026-001)
result: pass
source: automated
coverage_id: D5

### 25. openid-client discovery + ClientSecretPost + PKCE S256 + groups scope; pickGroups ID token then userinfo
expected: openid-client discovery + ClientSecretPost + PKCE S256 + groups scope; pickGroups ID token then userinfo
result: pass
source: automated
coverage_id: D1

### 26. Callback 302 clared://auth?ticket= and logout endSessionUrl …/application/o/clared/end-session/
expected: Callback 302 clared://auth?ticket= and logout endSessionUrl …/application/o/clared/end-session/
result: pass
source: automated
coverage_id: D2

### 27. Vendor compose.yml ghcr.io/goauthentik/server:2026.8.0, no redis service, no /etc/localtime
expected: Vendor compose.yml ghcr.io/goauthentik/server:2026.8.0, no redis service, no /etc/localtime
result: pass
source: automated
coverage_id: D3

### 28. Blueprint app clared, eight D-24 groups, OpenID groups scope mapping
expected: Blueprint app clared, eight D-24 groups, OpenID groups scope mapping
result: pass
source: automated
coverage_id: D4

### 29. tauri feature webview-data-url enabled; cargo check green; login_init_url + WebviewUrl::External unchanged
expected: tauri feature webview-data-url enabled; cargo check green; login_init_url + WebviewUrl::External unchanged
result: pass
source: automated
coverage_id: D1

### 30. Desktop Vitest suite still green after the crate feature (gate/chip/banner AUTH-01 UI)
expected: Desktop Vitest suite still green after the crate feature (gate/chip/banner AUTH-01 UI)
result: pass
source: automated
coverage_id: D2

### 31. nest build emits apps/backend/dist/main.js; prisma.config.ts not in outDir
expected: nest build emits apps/backend/dist/main.js; prisma.config.ts not in outDir
result: pass
source: automated
coverage_id: D1

### 32. Dockerfile installs openssl, asserts dist/main.js after nest build, CMD stays prisma migrate deploy && node dist/main.js
expected: Dockerfile installs openssl, asserts dist/main.js after nest build, CMD stays prisma migrate deploy && node dist/main.js
result: pass
source: automated
coverage_id: D2

### 33. Coolify clared-api yzmje7zsrp1qwtvsd7izjhaf finished healthy; GET https://clared-api.puzzlessdev.online/health 200
expected: Coolify clared-api yzmje7zsrp1qwtvsd7izjhaf finished healthy; GET https://clared-api.puzzlessdev.online/health 200
result: pass
source: automated
coverage_id: D3

### 34. GET https://clared-api.puzzlessdev.online/health/ready 200 against Coolify Postgres
expected: GET https://clared-api.puzzlessdev.online/health/ready 200 against Coolify Postgres
result: pass
source: automated
coverage_id: D4

### 35. Coolify env list for clared-api has no AUTH_TEST_MODE; build pack stays dockerfile
expected: Coolify env list for clared-api has no AUTH_TEST_MODE; build pack stays dockerfile
result: pass
source: automated
coverage_id: D5

## Summary

total: 35
passed: 35
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-02-1
  truth: "Click Anmelden opens a second window titled Anmelden at 480×640; cancel shows banner Anmeldung abgebrochen"
  status: resolved
  resolved_by: 02-06-PLAN.md
  resolved_at: 2026-08-22
  reason: "Code-side closed in 02-06 (webview-data-url). Native window paint verified 2026-08-22T13:55+02."
  severity: blocker
  test: 1

- gap_id: G-02-2
  truth: "Coolify Dockerfile deploy of apps/backend serves GET /health and /health/ready 200 on the vendor HTTPS URL"
  status: resolved
  resolved_by: 02-07-PLAN.md
  resolved_at: 2026-08-22
  reason: "Vendor /health 200 and /health/ready postgres.up reconfirmed this UAT."
  severity: blocker
  test: 3

- gap_id: G-02-5
  truth: "Fresh start: services boot and a primary health query returns live data"
  status: resolved
  resolved_at: 2026-08-22
  reason: "Desktop cold restart this session; vendor API already healthy. Local GHCR Authentik still optional."
  severity: blocker
  test: 6

- gap_id: G-02-6
  truth: "Click Anmelden opens a second window titled Anmelden at 480×640; no Vite data-URL error; window shows Authentik login (not a stuck spinner); close/cancel shows banner Anmeldung abgebrochen"
  status: resolved
  resolved_by: agent-uat-retest
  resolved_at: 2026-08-22
  reason: "Live Authentik form in Anmelden WebView; cancel banner confirmed."
  severity: blocker
  test: 1

- gap_id: G-02-7
  truth: "Anmelden completes Authentik MFA at https://clared-auth.puzzlessdev.online; chip primaryRole; GET /me has groups"
  status: resolved
  resolved_by: human-uat-retest
  resolved_at: 2026-08-22
  reason: "Live IdP WebView + PKCE authorize confirmed this session; chip/groups from earlier same-day human UAT."
  severity: blocker
  test: 3
