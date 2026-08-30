---
phase: quick-260830-6hk
plan: 01
subsystem: infra
tags: [dependabot, getrandom, github-actions, node-24, sqlcipher, supply-chain]

requires:
  - phase: quick-260830-59y
    provides: SHA-pinned action majors (#67) and Rust 1.97.1 pin
  - phase: quick-260830-4kp
    provides: Node 24 LTS lock after #69 revert
provides:
  - clared desktop crate on getrandom 0.4.3 with fill on both SQLCipher key arms
  - Confirmed SHA-pinned action majors 8/4/4/6/7 already on branch from #67
  - Node 24 lock unchanged (.nvmrc, Dockerfile, node-version, dependabot ignore >=25)
affects: [desktop SQLCipher key generation, Dependabot PR supersede-close]

actuals:
  tokens: 298
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "getrandom 0.4: fill(&mut [u8]) plus map_err; 0.2 getrandom() removed"
    - "GitHub Actions: keep 40-char SHA pins with version comments; never apply Dependabot floating-tag diffs"

key-files:
  created: []
  modified:
    - apps/desktop/src-tauri/Cargo.toml
    - apps/desktop/src-tauri/Cargo.lock
    - apps/desktop/src-tauri/src/lib.rs

key-decisions:
  - "Did not merge Dependabot #62; applied 0.4.3 plus fill on this combined branch"
  - "cargo update -p getrandom --precise 0.4.3 was ambiguous (0.2.17/0.3.4/0.4.3 in tree); cargo update -p clared retargeted the direct dep"
  - "Action majors needed no file edits — origin/main #67 already SHA-pinned them"
  - "Node 24 pins and dependabot docker ignore >=25 left untouched"

patterns-established:
  - "SQLCipher key CSPRNG uses getrandom::fill with map_err to String; no unwrap and no all-zero fallback"

requirements-completed: [DEP-59, DEP-61, DEP-62, DEP-63, DEP-64, DEP-65, NODE-24]

coverage:
  - id: D1
    description: "Desktop crate depends on getrandom 0.4.3; both SQLCipher empty-keychain arms call getrandom::fill and map_err to String"
    requirement: DEP-62
    verification:
      - kind: other
        ref: "grep getrandom = \"0.4\" Cargo.toml; two getrandom::fill sites; cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked"
        status: pass
    human_judgment: false
  - id: D2
    description: "download-artifact major 8 SHA-pinned in desktop-build.yml"
    requirement: DEP-65
    verification:
      - kind: other
        ref: "grep -E 'download-artifact@[0-9a-f]{40}.*# v8' .github/workflows/desktop-build.yml"
        status: pass
    human_judgment: false
  - id: D3
    description: "backend-image.yml docker cluster SHA-pinned: setup-buildx 4, login 4, metadata 6, build-push 7 twice"
    requirement: "DEP-64, DEP-63, DEP-61, DEP-59"
    verification:
      - kind: other
        ref: "grep SHA+# v4/# v6/# v7 on backend-image.yml; build-push count eq 2; no floating @vN uses"
        status: pass
    human_judgment: false
  - id: D4
    description: "Runtime Node pin stays 24 in .nvmrc, backend Dockerfile, and workflow node-version; dependabot ignore node >=25"
    requirement: NODE-24
    verification:
      - kind: other
        ref: "cat .nvmrc == 24; FROM node:24-bookworm-slim; five node-version: 24; zero 25/26; dependabot >=25"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-08-30
status: complete
---

# Phase quick-260830-6hk Plan 01: Dependabot upgrades by landing versions Summary

**getrandom 0.4.3 with fill on both SQLCipher key arms; action majors 8/4/4/6/7 already SHA-pinned from #67; Node 24 unchanged**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-30T02:50:04Z
- **Completed:** 2026-08-30T02:56:29Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Bumped clared's getrandom requirement to 0.4 and lockfile entry to 0.4.3; transitive 0.2/0.3 copies remain
- Migrated both `load_or_create_sqlcipher_key_hex` empty-keychain arms from `getrandom::getrandom` to `getrandom::fill` with `map_err` to String
- Confirmed #67 SHA pins already satisfy Dependabot PRs #65/#64/#63/#61/#59; did not cherry-pick dirty floating-tag diffs
- Left Node 24 lock intact; did not close or dismiss Dependabot PRs

## Task Commits

1. **Task 1 RED: End-to-end getrandom 0.4 compile fail** - `4eb2d4c` (test)
2. **Task 1 GREEN: fill on SQLCipher key path** - `9c8c8b9` (feat)
3. **Task 2: Confirm SHA-pinned action majors and Node 24 lock** - no commit (files already matched #67 / #69)

## Verification Results

| Task | Gate | Result |
|------|------|--------|
| 1 RED | cargo check --locked fails: cannot find function `getrandom` at lib.rs:42 and :50 | PASS |
| 1 GREEN | `getrandom = "0.4"`; two `getrandom::fill`; zero `getrandom::getrandom`; cargo check --locked | PASS |
| 2 | SHA+# v8/# v4/# v4/# v6/# v7×2; zero floating `@vN`; nvmrc 24; Dockerfile node:24; five `node-version: 24`; dependabot `>=25` | PASS |

## TDD Gate Compliance

- RED: `4eb2d4c` `test(quick-260830-6hk-01): add failing compile for getrandom 0.4 fill`
- GREEN: `9c8c8b9` `feat(quick-260830-6hk-01): use getrandom 0.4 fill on SQLCipher key path`

## Files Created/Modified

- `apps/desktop/src-tauri/Cargo.toml` - `getrandom = "0.4"`
- `apps/desktop/src-tauri/Cargo.lock` - clared package lists `getrandom 0.4.3`
- `apps/desktop/src-tauri/src/lib.rs` - both RNG arms use `getrandom::fill(...).map_err(|e| e.to_string())?`

## Decisions Made

- Did not merge github.com/clezcoding/claredtool/pull/62 as-is (D-03)
- Disambiguated lockfile update via `cargo update -p clared` because `-p getrandom --precise 0.4.3` is ambiguous when 0.2.17, 0.3.4, and 0.4.3 already exist
- Task 2 was assertion-only: no workflow or Node pin edits
- Dependabot PRs #59/#61/#62/#63/#64/#65 left open for orchestrator supersede-close after merge (D-05)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ambiguous `cargo update -p getrandom`**
- **Found during:** Task 1 RED
- **Issue:** `cargo update -p getrandom --precise 0.4.3` failed: specification `getrandom` is ambiguous (`getrandom@0.2.17`, `getrandom@0.3.4`, `getrandom@0.4.3`)
- **Fix:** `cargo update -p clared` retargeted the direct dependency; lockfile diff is one line (`getrandom 0.2.17` → `getrandom 0.4.3` under package `clared`)
- **Files modified:** apps/desktop/src-tauri/Cargo.lock
- **Verification:** clared lock entry lists 0.4.3; cargo check --locked after GREEN succeeded
- **Committed in:** `4eb2d4c` (Task 1 RED)

---

**Total deviations:** 1 auto-fixed (Rule 3)
**Impact on plan:** Necessary to land the 0.4.3 direct dep without collapsing transitive 0.2/0.3 copies. No scope creep.

## Issues Encountered

- rustup downloaded 1.97.1 components on first cargo invocation in this environment (toolchain pin already present). Not a code change.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Branch `quick/260830-6hk-dependabot` has getrandom 0.4.3 + fill; action majors and Node 24 already present
- Orchestrator: push, open one PR covering all six versions, watch CI, fix, merge; then confirm Dependabot PRs close as superseded (not dismissed)
- Do not `gh pr close` / dismiss #59–#65/#62 from this branch

## Self-Check: PASSED

- FOUND: apps/desktop/src-tauri/Cargo.toml (`getrandom = "0.4"`)
- FOUND: apps/desktop/src-tauri/src/lib.rs (two `getrandom::fill`)
- FOUND: 4eb2d4c, 9c8c8b9

---
*Phase: quick-260830-6hk*
*Completed: 2026-08-30*
