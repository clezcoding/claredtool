---
phase: quick-260828-mn3
plan: 01
subsystem: infra
tags: [github-actions, desktop-build, tauri, faynosync, path-filter]

requires:
  - phase: quick-260828-5c8
    provides: rust-cache on desktop-build matrix
provides:
  - desktop-build skipped on pull_request (ci.yml remains PR gate)
  - on.push.tags v* so existing FaynoSync publish if can fire
  - explicit pnpm tauri CLI build retained (no marketplace Tauri wrappers)
affects: [desktop-build, FaynoSync, 04.2]

actuals:
  tokens: 149
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Signed desktop-build on path-filtered main, v* tags, and workflow_dispatch only"
    - "PR typecheck/test stays in ci.yml; desktop-build does not start on pull_request"

key-files:
  created: []
  modified:
    - .github/workflows/desktop-build.yml

key-decisions:
  - "Removed on.pull_request so PRs skip signed Win/macOS tauri build (D-01)"
  - "Added on.push.tags ['v*'] as sibling of branches and paths so FaynoSync tag if is reachable (D-02, CI-OPT-05)"
  - "Did not add JonasKruckenberg/tauri-build, remarkablemark/tauri-action, or tauri-apps/tauri-action (D-04, D-05, D-06)"

patterns-established:
  - "desktop-build name comment documents the ci.yml vs signed-bundle split"

requirements-completed: [CI-OPT-04, CI-OPT-05, CI-OPT-06]

coverage:
  - id: D1
    description: "desktop-build on: is push (main + paths + tags v*) and workflow_dispatch; no pull_request event; ci.yml unchanged"
    requirement: CI-OPT-04
    verification:
      - kind: other
        ref: "grep tags/v*/branches/paths/workflow_dispatch; ! pull_request; git diff --exit-code -- .github/workflows/ci.yml"
        status: pass
    human_judgment: false
  - id: D2
    description: "v* tag trigger makes existing publish-faynosync startsWith(github.ref, refs/tags/v) reachable"
    requirement: CI-OPT-05
    verification:
      - kind: other
        ref: "grep -F v* and startsWith(github.ref, 'refs/tags/v') in .github/workflows/desktop-build.yml"
        status: pass
    human_judgment: false
  - id: D3
    description: "Explicit pnpm tauri CLI build, rust-cache, signing env, nine uses lines, no marketplace Tauri wrappers"
    requirement: CI-OPT-06
    verification:
      - kind: other
        ref: "grep pnpm tauri build / rust-cache / TAURI_SIGNING_PRIVATE_KEY; test uses count eq 9; ban JonasKruckenberg|remarkablemark/tauri-action|tauri-apps/tauri-action"
        status: pass
    human_judgment: false

duration: 2min
completed: 2026-08-28
status: complete
---

# Quick 260828-mn3: Optimize desktop-build GitHub Actions Summary

**Signed Win/macOS `tauri build` skipped on PRs; `v*` tags now trigger the existing FaynoSync publish `if`; CLI build unchanged**

## Performance

- **Duration:** 2 min
- **Started:** 2026-08-28T14:31:43Z
- **Completed:** 2026-08-28T14:33:17Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Removed `on.pull_request` from `.github/workflows/desktop-build.yml` so PRs no longer queue signed Windows/macOS release compiles (~10–12 min). `ci.yml` remains the PR typecheck/test gate.
- Added `on.push.tags: ['v*']` beside existing `branches: [main]` and path filters (`apps/desktop/**`, this workflow file) so tag pushes can reach `publish-faynosync`'s `startsWith(github.ref, 'refs/tags/v')`.
- Kept `workflow_dispatch` inputs (`target`, `publish`), rust-cache, matrix, `TAURI_SIGNING_PRIVATE_KEY`, `pnpm --filter ./apps/desktop tauri build`, upload-artifact, and FaynoSync curl/jq steps.
- Header comment documents the split: signed bundles on path-filtered main / v* tags / dispatch; typecheck/tests in `ci.yml`.

## Task Commits

1. **Task 1: Drop PR trigger; add v* tags** - `667385b` (chore)
2. **Task 2: Lock CLI build and FaynoSync jobs** - no commit (jobs already identical after Task 1; verify passed)

## Files Created/Modified

- `.github/workflows/desktop-build.yml` - Comment + `tags: ['v*']`; `pull_request` event removed. `jobs:` untouched.

## Decisions Made

- Followed CONTEXT D-01 through D-07: skip PR signed builds; keep path-filtered main, tags, dispatch; leave `ci.yml` byte-identical; no marketplace Tauri wrappers; keep explicit CLI + FaynoSync.
- Task 2 was a lock/verify only — no job YAML restore needed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Task 2 produced no second commit because `jobs:` did not drift.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PRs that only change desktop sources no longer wait on signed `tauri build`.
- Cutting a `v*` tag now starts this workflow so FaynoSync production publish can run.
- `ci.yml` still gates merge; dispatch remains signed smoke.

## Self-Check: PASSED

- FOUND: `.github/workflows/desktop-build.yml`
- FOUND: `667385b`
- MISSING: none

---
*Phase: quick-260828-mn3*
*Completed: 2026-08-28*
