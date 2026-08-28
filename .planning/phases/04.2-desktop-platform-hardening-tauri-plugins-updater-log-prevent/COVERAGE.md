# Phase 04.2 — External API Coverage

**Created:** 2026-08-28  
**Services:** FaynoSync (update server), Sentry EU (`de.sentry.io`)

Assumption-delta: CONTEXT already locks single update server (FaynoSync, D-05), single channel (`stable`, D-07), single clipboard plugin (D-01). No pluralization fire.

---

## FaynoSync

Source: FaynoSync Tauri updater docs + RESEARCH endpoint assumptions (A1).

| Capability | Decision | Reason |
|------------|----------|--------|
| Check version (Tauri JSON) — GET /checkVersion | INTEGRATE | Core DESK-04 / D-05/D-07/D-11 |
| Download artifact URL from check payload — HTTPS artifact URL in JSON | INTEGRATE | Required for downloadAndInstall |
| Upload release (CI) — Admin authenticated API / UI upload | INTEGRATE | D-10 CI upload |
| Upload release (Founder manual UI) — FaynoSync admin UI | INTEGRATE | D-10 explicit |
| Release notes / changelog body — notes field in check JSON | INTEGRATE | D-30 dialog changelog |
| Channels beta/nightly — channel query | OPT-OUT | D-07 stable only in 4.2 |
| FaynoSync JS SDK (`@faynosync/sdk-js`) — npm SDK + http plugin | OPT-OUT | RESEARCH SUS; native updater sufficient |
| Edge/geo routing extras — vendor edge features | OPT-OUT | Not required for desktop signature path |
| User-facing update URL settings — product UI | OPT-OUT | D-08 no Settings / no user URL |
| VPN-only / Bearer client checks — auth on check | OPT-OUT | D-11 public read + signature integrity |
| MinIO storage backend — object store | OPT-OUT | Prefer Garage per FaynoSync current docs; executor picks supported stack |
| GitHub Release as SSOT — GH latest.json only | OPT-OUT | D-29 FaynoSync SSOT; GH optional mirror only |
| Auto-rollback API — server-driven rollback | OPT-OUT | D-24 ops may republish older build manually |

**Coverage rule:** All INTEGRATE rows must be reachable from Plan 05 ops + Plan 06 client. OPT-OUT rows must not appear as tasks.

---

## Sentry EU Free Cloud (`de.sentry.io`)

Source: Sentry product capabilities + `tauri-plugin-sentry` 0.6 / `@sentry/browser`.

| Capability | Decision | Reason |
|------------|----------|--------|
| Error event capture (JS) — `Sentry.captureException` / default handlers | INTEGRATE | DESK-03 / D-37 |
| Error event capture (Rust) — `tauri-plugin-sentry` + `sentry` crate | INTEGRATE | Merged breadcrumb path |
| `beforeSend` scrubbing — browser SDK hook | INTEGRATE | D-40 mandatory |
| `sendDefaultPii: false` — client options | INTEGRATE | D-38 |
| Environment tag dev/staging/prod — tags | INTEGRATE | D-41 |
| Release tag = app version — tags / CI | INTEGRATE | D-41 |
| Env-gated DSN (empty = no-op) — init | INTEGRATE | D-38 local off |
| Error sample rate 1.0 staging/prod — options | INTEGRATE | D-39 |
| Performance tracing — tracesSampleRate | OPT-OUT | D-39 off by default in 4.2 (≤0.1 staging only if ever enabled) |
| Session Replay — replay integration | OPT-OUT | PII risk; not in CONTEXT |
| User feedback widget — feedback | OPT-OUT | Not requested |
| Profiling — profilesSampleRate | OPT-OUT | Not requested |
| Cron / uptime monitors — Sentry Crons | OPT-OUT | Phase 04.3 monitoring domain |
| Performance metrics / Web Vitals — metrics | OPT-OUT | D-39 tracing off |
| GlitchTip self-host — alternate DSN | OPT-OUT | D-37 deferred |
| `tauri-plugin-sentry-api` npm — companion package | OPT-OUT | SUS — prefer `@sentry/browser` + crates plugin (Plan 04 gate) |
| PII in breadcrumbs (email, invoice names) — default enrichment | OPT-OUT | Scrub via beforeSend (D-40) |

**Coverage rule:** INTEGRATE rows implemented in Plan 04. OPT-OUT must not be enabled accidentally in init options.

---

## Cross-cutting

| Topic | Notes |
|-------|-------|
| Coolify | FaynoSync deploy via `user-coolify` MCP + `coolify` CLI only |
| Secrets | `SENTRY_DSN` / `VITE_SENTRY_DSN`, `TAURI_SIGNING_PRIVATE_KEY` — never git |
| Auth/OIDC | Not an “API coverage” target here; must keep working after CSP (DESK-01) |

---

*Phase 04.2 API coverage — planner*
