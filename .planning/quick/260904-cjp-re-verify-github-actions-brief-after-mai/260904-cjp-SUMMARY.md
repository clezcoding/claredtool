---
status: complete
phase: quick-260904-cjp
plan: 01
subsystem: ci
tags: [github-actions, codeql, ci-fan-out, desktop-build, runner-labels]

requires:
  - phase: 04.4
    provides: path filters, draft gating, SHA pins, aggregator job id ci, signed desktop-build tags+dispatch, package-manager-cache false
provides:
  - CodeQL analyze-rust off pull_request; JS/TS CodeQL stays on non-draft PRs
  - Parallel backend-unit (timeout 15, no DB) and backend-e2e (timeout 20, Postgres 16 + Redis 7) behind aggregator ci
  - desktop-build tauri matrix windows-2025 + macos-26 (D-04 override of 04.4 D-17)
affects: [ci, codeql, desktop-build, github-actions]

actuals:
  tokens: 1600
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - Speed unsigned PR CI by dropping compiled-language CodeQL from pull_request, not by caching security jobs
    - Split sequential backend unit vs e2e; only e2e starts Postgres/Redis
    - Signed updater job speeds via pinned hosted-image generations, never Actions/cargo/package-manager cache

key-files:
  created: []
  modified:
    - .github/workflows/codeql.yml
    - .github/workflows/ci.yml
    - .github/workflows/desktop-build.yml

key-decisions:
  - "detect writes rust=false on pull_request even when the rust path filter matches (workflow-YAML-only PRs)"
  - "analyze-rust if is rust==true AND event_name != pull_request; schedule/dispatch/push main still run Rust"
  - "backend-e2e skips nest build and prisma validate (unit job already compiles); keeps tax-engine build + prisma generate + migrate deploy"
  - "D-04 pins windows-2025 and macos-26; not latest, not macos-26-xlarge, not windows-2025-vs2026"
  - "Signed tauri keeps package-manager-cache false; no cargo cache on desktop-build or CodeQL"

patterns-established:
  - "PR wall-clock: drop expensive security jobs from pull_request; keep them on push/schedule/dispatch"
  - "Aggregator job id stays ci; skipped remains OK"

requirements-completed: [D-02, D-03, D-04]

coverage:
  - id: D1
    description: CodeQL analyze-rust cannot run on pull_request; JS/TS CodeQL still can on non-draft PRs; Rust globs stay on push.paths
    requirement: D-02
    verification:
      - kind: other
        ref: "python3 yaml.safe_load codeql.yml — no rustish paths on pull_request; *.rs on push; analyze-rust if contains pull_request and !=; analyze-js-typescript if contains draft"
        status: pass
    human_judgment: false
  - id: D2
    description: backend-unit and backend-e2e exist in parallel; consolidated timeout-30 backend-test gone; aggregator ci needs and checks both
    requirement: D-02
    verification:
      - kind: other
        ref: "python3 yaml.safe_load ci.yml — backend-unit timeout 15 no services; backend-e2e timeout 20 postgres+redis; needs == [changes,desktop-web,desktop-rust,backend-unit,backend-e2e,squawk]"
        status: pass
    human_judgment: false
  - id: D3
    description: desktop-build tauri matrix is windows-2025 and macos-26; setup-node package-manager-cache remains false
    requirement: D-04
    verification:
      - kind: other
        ref: "python3 yaml.safe_load desktop-build.yml matrix.os == [windows-2025, macos-26]; package-manager-cache is False"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-09-04
---

# Phase quick-260904-cjp Plan 01: Re-verify GitHub Actions brief after main

**CodeQL Rust off PRs, parallel backend-unit/e2e, desktop runners pinned to windows-2025 and macos-26. No new Actions. Signed job still uncached.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-09-04T07:16:09Z
- **Completed:** 2026-09-04T07:19:32Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- `analyze-rust` cannot run on `pull_request`; `analyze-js-typescript` still can on non-draft PRs. Push main, Monday 05:18 UTC schedule, and `workflow_dispatch` still run Rust when detect says so.
- Sequential `backend-test` (timeout 30) replaced by parallel `backend-unit` (15, no postgres/redis) and `backend-e2e` (20, origin Postgres 16 / Redis 7 digests). Aggregator job id stays `ci`.
- Signed tauri matrix is `windows-2025` + `macos-26`. `package-manager-cache: false` unchanged. No Actions cache / rust-cache on desktop-build or CodeQL.

## Task Commits

1. **Task 1: End-to-end CodeQL Rust off pull_request — JS stays** - `04c466c` (ci)
2. **Task 2: Split backend unit vs e2e into parallel jobs** - `8b3f9f4` (ci)
3. **Task 3: Pin desktop runners to windows-2025 and macos-26** - `dc7b973` (ci)

_Docs artifacts not committed (orchestrator)._

## Files Created/Modified

- `.github/workflows/codeql.yml` - Drop Rust globs from `pull_request.paths`; force `rust=false` on PR detect; gate `analyze-rust` with `github.event_name != 'pull_request'`
- `.github/workflows/ci.yml` - Split `backend-test` into `backend-unit` + `backend-e2e`; aggregator `ci` needs and checks both
- `.github/workflows/desktop-build.yml` - Matrix `os: [windows-2025, macos-26]`; D-04 comment

Unchanged (verified `git diff --exit-code`): `.github/workflows/gitleaks.yml`, `.github/workflows/zizmor.yml`, `.github/workflows/backend-image.yml`.

## Decisions Made

- Detect forces `rust=false` on `pull_request` so a YAML-only CodeQL workflow PR cannot queue `analyze-rust` even though the rust path filter still includes `.github/workflows/codeql.yml`.
- `backend-e2e` does not nest-build or prisma-validate; unit job already compiles. e2e still builds tax-engine, generates Prisma client, migrate deploys, then jest-e2e.
- actionlint 1.7.12 (`rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`) exit 0 on all three files — no unknown-label error for `windows-2025` / `macos-26`. Pins kept.

## Deviations from Plan

None - plan executed exactly as written.

PyYAML `yaml.safe_load` maps YAML 1.1 `on:` to boolean `True`, so the plan's `w["on"]` KeyError is a harness quirk. Asserts ran via `w.get("on", w.get(True))` for codeql.yml; ci.yml and desktop-build.yml verifies use `jobs` and passed as written.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** None

## Issues Encountered

PyYAML boolean `on` key — see Deviations. Asserts not skipped.

## User Setup Required

None - no external service configuration required. Do not push. Do not create a v* tag. Do not dispatch production desktop-build.

## Next Phase Readiness

YAML structural gates pass locally. First live PR should show no `analyze-rust` job and overlapping `backend-unit`/`backend-e2e`. Signed desktop labels wait for the next staging `workflow_dispatch` (not this plan).

## Verify output

```
codeql ok
ci split ok
runners ok
actionlint exit=0
```

## Known Stubs

None.

## Self-Check: PASSED

---
*Phase: quick-260904-cjp*
*Completed: 2026-09-04*
