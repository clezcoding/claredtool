<!-- HTML comments are stripped from squash-merge messages by Kodiak. -->

## Summary

<!-- What changed and why. -->

## Test plan

- [ ] Unit and e2e tests are green for affected packages
- [ ] Production build of the affected app succeeds
- [ ] Prisma migrate/schema checked if schema or migrations changed
- [ ] Desktop/UI checks if `apps/desktop` or `packages/ui` changed
- [ ] Deploy/infra checks if workflows, Dockerfile, or compose changed

## Merge

- Path labels are applied by the Labeler workflow.
- Add `automerge` after review if Kodiak should land this PR (squash).
- Dependabot **patch/minor** PRs automerge without that label once `ci` is green.
- The `major` label blocks Kodiak (even with `automerge`). Merge majors in the GitHub UI after review.
- `wip` / `do-not-merge` also block Kodiak.
