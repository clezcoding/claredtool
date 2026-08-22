---
phase: 02
slug: self-hosted-backend-authentik-sso
status: verified
threats_open: 0
asvs_level: 1
created: 2026-08-22
---

# Phase 02 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm/cargo registry → apps/backend, apps/desktop | Installs of Nest, Prisma, openid-client, ioredis, Tauri 2 | Lockfiles, compiled artifacts |
| Desktop fetch → Nest | Untrusted Origin, missing/forged Bearer | Session token, `/me` JSON |
| Nest → Authentik | Confidential OIDC code+PKCE | Code, state, client secret (Nest/Coolify only) |
| Nest → Redis | Tickets and sessions | Opaque ticket/session keys, claims JSON |
| Nest → Postgres | Health ready ping; later product data | Connection string from env |
| Coolify env → Nest process | Production secrets | `SECRET`, `DATABASE_URL`, `REDIS_URL` |
| Authentik HTML in login WebView → Tauri IPC | Hostile/XSS page must not reach keychain | Navigation URLs, `clared://` ticket |
| Login WebView navigation | Open redirect / evil host | `BACKEND_URL` / `AUTHENTIK_URL` origins only |
| OS protocol handler `clared://` | Foreign apps can invoke the scheme | One-time ticket id |
| Renderer → Tauri commands | Session token only through keychain IPC on main | Keychain read/write/delete |
| Public HTTPS `/health` | Unauthenticated liveness | No Prisma I/O, no secrets |
| Blueprint apply (Authentik admin) | Who can mint groups | Group membership → RBAC |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-02-SC (P01) | Tampering | pnpm installs in apps/backend | high | mitigate | RESEARCH-audited versions; no community keyring plugin; pins in `package.json` | closed |
| T-02-01 | Information disclosure | apps/backend/.env | medium | mitigate | Root + `apps/backend/.env` gitignored; `.env.example` local placeholders only | closed |
| T-02-02 | Elevation of privilege | Default Nest GET / | low | accept | Wave 0 scaffold; superseded by T-02-06 global `AuthGuard` + catch-all 401 | closed |
| T-02-03 | Spoofing | GET /auth/login state | high | mitigate | Random state in Redis `oauth:{state}`; `authorizationCodeGrant(..., expectedState)` | closed |
| T-02-04 | Spoofing | POST /auth/session ticket replay | high | mitigate | `GETDEL` ticket; second redeem 401; e2e in `auth.e2e-spec.ts` | closed |
| T-02-05 | Information disclosure | CLIENT SECRET | high | mitigate | `SECRET` env on Nest/Coolify only; no `SECRET`/`CLIENT_SECRET` in `apps/desktop` | closed |
| T-02-06 | Elevation of privilege | Unmatched HTTP routes | high | mitigate | Global `AuthGuard`; catch-all throws `UnauthorizedException` (docs paths 404) | closed |
| T-02-07 | Tampering | Session fixation | medium | mitigate | New `randomBytes` Bearer at redeem; ticket dead after `GETDEL` | closed |
| T-02-08 | Information disclosure | Redis session payload | medium | mitigate | Opaque random token; claims only; no Authentik access token stored | closed |
| T-02-09 | Denial of service | Session count | low | accept | D-30: no session cap this phase | closed |
| T-02-SC (P02) | Tampering | already-installed pins | high | mitigate | Stay on RESEARCH versions; no extra registries | closed |
| T-02-10 | Elevation of privilege | login WebView XSS → IPC | high | mitigate | `login.json` `core:default` only; `AppManifest::commands` so keychain is ACL-denied | closed |
| T-02-11 | Spoofing | WebView navigation to evil host | high | mitigate | `on_navigation` allowlist `BACKEND_URL` + `AUTHENTIK_URL` origins | closed |
| T-02-12 | Information disclosure | Session in WebView storage | high | mitigate | Token only via main-window `keyring` commands (D-27) | closed |
| T-02-13 | Spoofing | clared:// from another app | medium | mitigate | Ticket one-time `GETDEL` on Nest; stale tickets 401 | closed |
| T-02-14 | Denial of service | Windows second instance | medium | mitigate | `tauri-plugin-single-instance` with `deep-link` feature | closed |
| T-02-15 | Tampering | Sync window builder | medium | mitigate | `async fn open_login_window` only | closed |
| T-02-16 | Information disclosure | Session token in JS memory | medium | mitigate | Persist via keychain commands; no `localStorage` / `document.cookie` in desktop `src` | closed |
| T-02-17 | Spoofing | 401 vs network confusion | medium | mitigate | Network uses `ErrorState`; 401 uses session banner + login window (D-31) | closed |
| T-02-18 | Elevation of privilege | Unsigned product UI | high | mitigate | `LoginGate` replaces `AppShell` when unsigned | closed |
| T-02-19 | Information disclosure | Chip leaking groups/permissions | low | mitigate | Chip shows name + `primaryRole` only (D-36) | closed |
| T-02-20 | Information disclosure | Prod SECRET on laptop | high | mitigate | `.env.example` local-only; Coolify holds production `SECRET`; never commit prod secret | closed |
| T-02-21 | Spoofing | Implicit grant / public client | high | mitigate | Confidential client + PKCE `S256`; `ClientSecretPost` | closed |
| T-02-22 | Elevation of privilege | Empty groups[] | high | mitigate | Scope `openid profile email groups`; userinfo fallback; empty RBAC ≠ all rights | closed |
| T-02-23 | Tampering | Forked Authentik compose | medium | mitigate | Official Authentik compose path in USER-SETUP; no localtime mount | closed |
| T-02-24 | Spoofing | Wrong issuer path | medium | mitigate | Issuer `…/application/o/clared/` in `oidc.ts` | closed |
| T-02-SC (P05) | Tampering | no new packages this plan | low | accept | Uses 02-01 pins; wget vendor file not npm | closed |
| T-02-25 | Spoofing | login WebView data URL | medium | mitigate | `webview-data-url` feature; host allowlist + `login.json` without keychain | closed |
| T-02-26 | Elevation of privilege | login capability | high | mitigate | `login.json` has no keychain / `os:allow-hostname` | closed |
| T-02-SC (P06) | Tampering | no new crates | low | accept | Feature flag on existing tauri 2 | closed |
| T-02-27 | Denial of Service | missing dist/main.js | high | mitigate | Dockerfile `test -f dist/main.js` after nest build | closed |
| T-02-28 | Elevation of privilege | Coolify AUTH_TEST_MODE | high | mitigate | `AUTH_TEST_MODE` absent on clared-api prod+preview env lists (MCP, no reveal). Code also refuses `AUTH_TEST_MODE=1` outside `NODE_ENV=test` | closed |
| T-02-29 | Information disclosure | /health | low | accept | `/health` has no Prisma I/O and no secrets | closed |
| T-02-SC (P07) | Tampering | no new npm/pip/cargo installs | low | accept | openssl via apt on existing `node:22-bookworm-slim` | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

> **Note:** `T-02-SC` is reused across plans 02-01, 02-02, 02-05, 02-06, 02-07. Disambiguated with plan suffix.

SUMMARY threat flags: none (02-02). Later summaries recorded T-02-10 ACL and T-02-26 login.json constraints as implemented, not new open threats.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-02 | Wave 0 default hello route was plan-accepted and not Coolify-shipped; 02-02 guard closed the hole | gsd-secure-phase | 2026-08-22 |
| AR-02-02 | T-02-09 | D-30: no Redis session cap this phase; founder-scale cluster | gsd-secure-phase | 2026-08-22 |
| AR-02-03 | T-02-SC (P05) | No new npm this plan; wget is vendor Authentik compose | gsd-secure-phase | 2026-08-22 |
| AR-02-04 | T-02-SC (P06) | `webview-data-url` on existing tauri 2 crate | gsd-secure-phase | 2026-08-22 |
| AR-02-05 | T-02-29 | Unauthenticated `/health` returns no secrets or DB internals | gsd-secure-phase | 2026-08-22 |
| AR-02-06 | T-02-SC (P07) | Image extra is apt `openssl`/`curl` only | gsd-secure-phase | 2026-08-22 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-22 | 34 | 34 | 0 | gsd-secure-phase (ASVS L1 grep; auditor skipped — register at plan time, threats_open 0) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-22
