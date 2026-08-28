# Quick Task 260828-mn3: Desktop-build CI speed — Research

**Date:** 2026-08-28
**Source:** Composio GitHub (`GITHUB_SEARCH_REPOSITORIES`, `GITHUB_GET_A_REPOSITORY`, `GITHUB_GET_REPOSITORY_CONTENT`, `GITHUB_LIST_WORKFLOW_RUNS_FOR_A_REPOSITORY`, `GITHUB_LIST_JOBS_FOR_A_WORKFLOW_RUN`) + local `.github/workflows/`

## Verdict

Do not install a third-party Tauri action. Bottleneck is `pnpm tauri build` (Rust release compile + NSIS/DMG), not YAML wrapping. Locked: remove `on.pull_request`; keep explicit `pnpm --filter ./apps/desktop tauri build`.

## Current timings (clezcoding/claredtool)

| Workflow | Typical | Notes |
|---|---|---|
| `ci.yml` | 1–2 min | Already path-filtered + parallel (quick `260828-5c8`) |
| `desktop-build` PR | ~10 min | [run 33134399493](https://github.com/clezcoding/claredtool/actions/runs/33134399493) |
| `desktop-build` main | ~11 min | [run 33134929572](https://github.com/clezcoding/claredtool/actions/runs/33134929572) |
| `desktop-build` dispatch | ~12 min | [run 33170643831](https://github.com/clezcoding/claredtool/actions/runs/33170643831) |

Per-OS `tauri build` step:

- Windows: 7–9 min (NSIS)
- macOS: ~4 min (DMG + `.app.tar.gz`)
- rust-cache restore: 2–23 s (already present; does not erase release link)

## Candidate actions (Composio)

| Repo | Stars | Role | Fit |
|---|---|---|---|
| [JonasKruckenberg/tauri-build](https://github.com/JonasKruckenberg/tauri-build) | 39 | Node action wrapping `tauri build`; `artifacts` JSON output | Same compile. Docs still show checkout@v2 / actions-rs. No FaynoSync. |
| [remarkablemark/tauri-action](https://github.com/remarkablemark/tauri-action) | 0 | Composite: validate name, **init src-tauri**, then build. Inputs: `app-name`, `frontend-dist`, `force` overwrite | Wrong tool. Would stomp existing plugins/signing/`tauri.conf.json`. |
| [tauri-apps/tauri-action](https://github.com/tauri-apps/tauri-action) | 1603 | Build + GitHub Release + `latest.json` updater CDN | Conflicts with FaynoSync. Phase 01 locked explicit CLI. Compile unchanged. |

Jonas `action.yml` inputs: `runner`, `args`, `projectPath`, `configPath`, `target`, `debug`. Output: `artifacts`. Runs `node20` `dist/index.js`.

remarkablemark `action.yml`: required `app-name`; `force` overwrites src-tauri; `before-build-command` default `exit 0`.

Official: `tagName` / `releaseId` / `uploadUpdaterJson` (default true) / `tauriScript`. Release-oriented, not a compile accelerator.

## Integration

- File: `.github/workflows/desktop-build.yml`
- Today `on:` push `main` (path-filtered), **pull_request** (same paths), `workflow_dispatch`
- Publish job already `if:` dispatch+publish **or** push to main **or** `refs/tags/v*` — but `on.push` has **no tags**, so the tag clause never fires
- Signing: `TAURI_SIGNING_PRIVATE_KEY`; artifacts: nsis exe+sig, dmg, app.tar.gz+sig

## Pitfalls

- Removing `pull_request` means Windows/macOS compile breaks surface on `main` or dispatch. Acceptable: `ci.yml` still gates TS/tests; dispatch remains the signed smoke.
- Do not drop path filters on `main` or every docs-only main push rebuilds (workflow file is in the filter).
- Do not replace FaynoSync with GitHub `latest.json`.
- rust-cache / pnpm cache stay.

## Plan shape

1. Drop `on.pull_request`.
2. Add `on.push.tags: ['v*']` so publish `if` matches reality.
3. Leave jobs/steps/matrix/FaynoSync as-is.
4. No new marketplace action.
