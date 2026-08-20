<!-- HTML comments are stripped from squash-merge messages by Kodiak. -->

## Summary

<!-- What changed and why. -->

## Test plan

- [ ] `pnpm --filter ./apps/desktop test` (or relevant check) is green
- [ ] UI/behavior checked where this PR touches the desktop app

## Merge

- Path labels are applied by the Labeler workflow.
- Add `automerge` after review if Kodiak should land this PR (squash).
- Dependabot **patch/minor** PRs automerge without that label once `ci` is green.
- Dependabot **major** PRs need a human + `automerge`.
- `wip` / `do-not-merge` block Kodiak.
