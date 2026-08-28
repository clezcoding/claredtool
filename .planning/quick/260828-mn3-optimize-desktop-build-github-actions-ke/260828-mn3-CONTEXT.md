# Quick Task 260828-mn3: Optimize desktop-build GitHub Actions - Context

**Gathered:** 2026-08-28
**Status:** Ready for planning

<domain>
## Task Boundary

Speed up GitHub Actions by not running signed `tauri build` on pull requests. Do not switch to third-party Tauri GitHub Actions. Keep explicit `pnpm --filter ./apps/desktop tauri build` plus FaynoSync publish.

</domain>

<decisions>
## Implementation Decisions

### When signed tauri build runs
- Pull requests: skip `desktop-build` entirely (`on.pull_request` removed).
- Full Windows + macOS signed matrix: `push` to `main` (existing path filters), `v*` tags, and `workflow_dispatch`.
- `ci.yml` remains the PR gate (tsc / vitest / backend). No change required unless a comment is useful.

### Third-party Tauri actions
- Do not add JonasKruckenberg/tauri-build (wrapper, same compile).
- Do not add remarkablemark/tauri-action (inits src-tauri from dist; would overwrite this app).
- Do not add tauri-apps/tauri-action (GitHub Releases / latest.json conflicts with FaynoSync).
- Keep explicit `pnpm --filter ./apps/desktop tauri build`, `actions/upload-artifact`, and the existing FaynoSync job.

### Claude's Discretion
- Add `on.push.tags: ['v*']` so the existing publish `if` for tags can actually fire (workflow currently only triggers on `main` + PR + dispatch).
- Leave `swatinem/rust-cache@v2`, pnpm cache, matrix, signing env, and FaynoSync steps unchanged.
- Path filters on `main` stay (`apps/desktop/**`, workflow file).
- No sccache, no larger runners, no `--no-bundle` PR job.

</decisions>

<specifics>
## Specific Ideas

User confirmed skip_pr + none after Composio repo review. Evidence: desktop-build wall ~10–12 min (Windows `tauri build` ~7–9 min, macOS ~4 min); `ci.yml` ~1–2 min.

</specifics>

<canonical_refs>
## Canonical References

- `.github/workflows/desktop-build.yml`
- `.github/workflows/ci.yml`
- Phase 01 decision: explicit `pnpm tauri build` + upload-artifact, not tauri-action
- [JonasKruckenberg/tauri-build](https://github.com/JonasKruckenberg/tauri-build) (39 stars)
- [remarkablemark/tauri-action](https://github.com/remarkablemark/tauri-action) (0 stars)
- [tauri-apps/tauri-action](https://github.com/tauri-apps/tauri-action) (1603 stars)
- Prior quick task `260828-5c8` already added rust-cache + parallel ci.yml

</canonical_refs>
