---
status: testing
phase: 02-self-hosted-backend-authentik-sso
source: [02-VERIFICATION.md]
started: 2026-08-22T02:44:00Z
updated: 2026-08-22T02:44:00Z
---

## Current Test

number: 1
name: Desktop gate / window / chip
expected: |
  Gate, native login window, cancel banner, signed-in chip match 02-UI-SPEC. Product screens stay hidden while unsigned.
awaiting: user response

## Tests

### 1. Desktop gate / window / chip
expected: Launch Tauri signed-out. Dark gate (h1 Clared, body Anmelden, um Rechnungen zu stellen., one Anmelden, no sidebar). Click Anmelden: second window title Anmelden 480×640. Close/cancel: banner Anmeldung abgebrochen. After login: chip + sample invoice RE-2026-001. Keyboard: Tab/Enter on gate, chip menu Abmelden.
result: [pending]

### 2. Live Authentik + founder Coolify
expected: OrbStack `docker compose -f compose.yml -f compose.clared.yml up -d`. Apply `blueprints/clared.yaml`. Local CLIENT_ID/SECRET in `apps/backend/.env`; unset AUTH_TEST_MODE. Nest start. Desktop Anmelden completes Authentik MFA. Coolify Dockerfile (not Nixpacks); curl `/health` and `/health/ready` on the vendor HTTPS URL. Chip primaryRole; GET /me has groups. Prod ready-check hits clared/clared_app, not Authentik's database. Prod SECRET never on the laptop.
result: [pending]

### 3. REVIEW CR-01 / CR-02 / CR-03 on a real login
expected: After successful login, a second clared:// / ticket-received for the same ticket does not sign the user out. Login WebView cannot open http://localhost:<other-port>. Coolify does not have AUTH_TEST_MODE=1.
result: [pending]

### 4. Prohibition review
expected: Shipped copy and Coolify positioning: no OSS/free/self-host language; prod SECRET only on Coolify; login WebView has no keychain IPC.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
