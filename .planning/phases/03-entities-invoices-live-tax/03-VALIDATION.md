---
phase: 3
slug: entities-invoices-live-tax
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-22
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Backend: Jest 29 + ts-jest (Nest); tax-engine: Jest (match backend); Desktop: Vitest 4.1.10 |
| **Config file** | `apps/backend/jest.config.cjs`, `apps/backend/test/jest-e2e.json`; desktop `vitest` via `apps/desktop/package.json` `"test": "vitest run"` |
| **Quick run command** | `pnpm --filter backend test -- rbac.spec.ts` / `pnpm --filter desktop test -- src/__tests__/invoice.test.tsx` |
| **Full suite command** | `pnpm --filter backend test && pnpm --filter backend test:e2e && pnpm --filter @clared/tax-engine test && pnpm --filter desktop test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted Jest or Vitest file (`--` file path)
- **After every plan wave:** Run `pnpm --filter backend test && pnpm --filter backend test:e2e && pnpm --filter @clared/tax-engine test && pnpm --filter desktop test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-W0-01 | 00 | 0 | ENT-01 | T-03-01 | Owner POST 201; viewer 403 | e2e | `pnpm --filter backend test:e2e -- entities` | ❌ W0 | ⬜ pending |
| 03-W0-02 | 00 | 0 | INV-01 | T-03-02 | POST invoice + items; GET by id | e2e | `pnpm --filter backend test:e2e -- invoices` | ❌ W0 | ⬜ pending |
| 03-W0-03 | 00 | 0 | TAX-01 | T-03-03 | POST /api/tax/evaluate invoice body | e2e | `pnpm --filter backend test:e2e -- tax` | ❌ W0 | ⬜ pending |
| 03-W0-04 | 00 | 0 | TAX-02 | T-03-04 | evaluate() 23 classes; 0/2 matches throw | unit | `pnpm --filter @clared/tax-engine test` | ❌ W0 | ⬜ pending |
| 03-W0-05 | 00 | 0 | ENT-01 | T-03-01 | Anlegen disabled without entity.create | unit | `pnpm --filter desktop test -- entities` | ❌ W0 | ⬜ pending |
| 03-W0-06 | 00 | 0 | TAX-01 | T-03-03 | Desktop keep last good on 422 | unit | `pnpm --filter desktop test -- tax-rail` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/backend/test/entities.e2e-spec.ts` — stubs for ENT-01
- [ ] `apps/backend/test/invoices.e2e-spec.ts` — stubs for INV-01
- [ ] `apps/backend/test/tax.e2e-spec.ts` — stubs for TAX-01
- [ ] `packages/tax-engine/src/evaluate.spec.ts` — TAX-02 (23 classes + no unique match)
- [ ] Desktop vitest for create panel, disabled Anlegen, autosave status, tax error keep-last
- [ ] `PermissionsGuard` unit spec next to `rbac.spec.ts`
- [ ] Framework install: none — Jest/Vitest already present; add `ajv` inside tax-engine

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| UI-SPEC screens match implementation | UI-01 | Visual contract already approved; pixel/layout vs 03-UI-SPEC.md | Walk entity, customer, invoice, live-tax screens against 03-UI-SPEC.md |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
