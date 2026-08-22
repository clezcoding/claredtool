---
phase: 02-self-hosted-backend-authentik-sso
plan: 06
subsystem: auth
tags: [tauri, webview-data-url, login-init, AUTH-01, G-02-1]

requires:
  - phase: 02-self-hosted-backend-authentik-sso
    provides: login-init.html include_str data URL, open_login_window, login.json core:default
provides:
  - tauri crate feature webview-data-url so login-init data:text/html is accepted
  - G-02-1 closed in code (Anmelden window creation unblocked)
affects:
  - Phase 02 UAT retest of Anmelden 480×640 window
  - AUTH-01 login WebView paint path (D-16, D-19, D-33)

actuals:
  tokens: 286
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Tauri 2 data: WebView URLs require crate feature webview-data-url; login-init stays include_str in src-tauri"

key-files:
  created: []
  modified:
    - apps/desktop/src-tauri/Cargo.toml
    - apps/desktop/src-tauri/Cargo.lock

key-decisions:
  - "Enable only webview-data-url on tauri; keep login_init_url() as data:text/html and WebviewUrl::External (no Vite public/ move, no asset-protocol fallback)"
  - "Human Anmelden window check deferred to end-of-phase UAT (human_verify_mode); Task 2 is Vitest-only"

patterns-established:
  - "Gap G-02-1 fix is a crate feature, not a document-location change"

requirements-completed: [AUTH-01]

coverage:
  - id: D1
    description: tauri feature webview-data-url enabled; cargo check green; login_init_url + WebviewUrl::External unchanged
    requirement: AUTH-01
    verification:
      - kind: other
        ref: "grep webview-data-url apps/desktop/src-tauri/Cargo.toml; cargo check in apps/desktop/src-tauri"
        status: pass
    human_judgment: false
  - id: D2
    description: Desktop Vitest suite still green after the crate feature (gate/chip/banner AUTH-01 UI)
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "pnpm --filter ./apps/desktop test (7 files / 39 tests)"
        status: pass
    human_judgment: false
  - id: D3
    description: Signed-out Anmelden opens a 480×640 window titled Anmelden; close shows Anmeldung abgebrochen
    requirement: AUTH-01
    verification: []
    human_judgment: true
    rationale: "OS window paint and Vite data-URL error absence need a live Tauri session; harvested into phase UAT (G-02-1, D-31, D-33, D-39)"

duration: 2min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 06: webview-data-url for login-init Summary

**Tauri 2 `webview-data-url` so Anmelden can load `login-init.html` as a `data:text/html` URL without moving it into Vite `public/`**

## Performance

- **Duration:** 2 min
- **Started:** 2026-08-22T04:11:25Z
- **Completed:** 2026-08-22T04:13:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Enabled `webview-data-url` on the `tauri` dependency in `apps/desktop/src-tauri/Cargo.toml` (G-02-1)
- `Cargo.lock` now includes `data-url 0.3.2` as a tauri dependency
- Left `login_init_url()` and `WebviewUrl::External(login_init_url())` in place; `login-init.html` stays `include_str` in `src-tauri`
- Did not add keychain IPC or extra permissions to `login.json` (T-02-10 / T-02-26)
- Desktop Vitest: 7 files, 39 tests, all pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Enable Tauri 2 webview-data-url on the desktop crate** - `4df88cb` (feat)
2. **Task 2: Keep desktop auth suite green after the crate feature** - no commit (verification-only; no source delta)

**Plan metadata:** (this commit)

## Files Created/Modified

- `apps/desktop/src-tauri/Cargo.toml` - `tauri` features `["webview-data-url"]`; `tauri-build` features still empty
- `apps/desktop/src-tauri/Cargo.lock` - `data-url 0.3.2` recorded under tauri

## Decisions Made

- First move is the crate feature, not custom-protocol/asset fallback (UAT fallback only if data URLs still reject after this — they compiled).
- Human click-through of Anmelden is end-of-phase UAT, not a mid-plan halt.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed
**Impact on plan:** None.

## Issues Encountered

None

## Authentication Gates

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for 02-07. G-02-1 closed in code; live Anmelden window remains a UAT human-check.

Plan-level verification: `grep webview-data-url` PASS; `cargo check` in `apps/desktop/src-tauri` exit 0; `pnpm --filter ./apps/desktop test` 39/39 pass.

---
*Phase: 02-self-hosted-backend-authentik-sso*
*Completed: 2026-08-22*

## Self-Check: PASSED

- FOUND: `apps/desktop/src-tauri/Cargo.toml`
- FOUND: `apps/desktop/src-tauri/Cargo.lock`
- FOUND: `4df88cb` feat(02-06) Task 1
- FOUND: `.planning/phases/02-self-hosted-backend-authentik-sso/02-06-SUMMARY.md`
- Plan `<verification>`: grep `webview-data-url` PASS; `cargo check` exit 0; `pnpm --filter ./apps/desktop test` 39/39 pass
- `login.json` still `core:default` only; `login_init_url` + `WebviewUrl::External(login_init_url())` unchanged
