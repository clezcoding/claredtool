---
phase: 1
slug: tauri-desktop-mockup-first-ui
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Vite-native; Wave 0 install) |
| **Config file** | `apps/desktop/vitest.config.ts` — Wave 0 gap |
| **Quick run command** | `pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=dot`
- **After every plan wave:** Run `pnpm vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green + macOS visual launch confirmed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-W0-01 | 01 | 0 | UI-01 | — | N/A | infra | vitest + RTL + jsdom installed | ❌ W0 | ⬜ pending |
| 01-UI-01 | 01 | 1 | UI-01 | — | Five sidebar routes navigable | smoke | `pnpm vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 01-UI-02 | 01 | 1 | UI-01 | — | Sample invoice renders (seller EU-GmbH, buyer US) | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 01-UI-03 | 01 | 1 | UI-01 | — | Empty state renders on „Neue Rechnung" | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 01-DESK-01 | 01 | 1 | DESK-01 | T-01-01 | Tauri window launches on macOS; no IPC commands | smoke (manual) | `pnpm tauri dev` visual confirm | ❌ W0 | ⬜ pending |
| 01-DESK-02 | 01 | 1 | DESK-01 | — | Tauri window launches on Windows | smoke (CI) | GitHub Actions build + launch check | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/desktop/vitest.config.ts` — Vitest with jsdom environment
- [ ] `apps/desktop/src/__tests__/routes.test.tsx` — UI-01 route navigation
- [ ] `apps/desktop/src/__tests__/invoice.test.tsx` — UI-01 sample invoice render
- [ ] Install `vitest`, `@testing-library/react`, `jsdom` in `apps/desktop`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tauri window launches on macOS | DESK-01 | Native window chrome + decorations cannot be asserted in jsdom | `pnpm tauri dev` from `apps/desktop`; confirm titled window "Clared", no Electron chrome |
| Tauri window launches on Windows | DESK-01 | No Windows machine on this host; CI path | GitHub Actions `windows-latest` build; launch check or artifact download |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
