---
status: testing
phase: 03-entities-invoices-live-tax
source: [03-VERIFICATION.md]
started: 2026-08-22T18:45:00Z
updated: 2026-08-22T18:45:00Z
---

## Current Test

number: 1
name: Walk entity, customer, invoice, and live-tax screens against 03-UI-SPEC.md (E2–E8 surfaces)
expected: |
  Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract
awaiting: user response

## Tests

### 1. UI-SPEC screen walk
expected: Layout, copy, loading/error/empty states, picker, rail, and RBAC hints match the approved UI contract (03-UI-SPEC.md E2–E8)
result: [pending]

### 2. D-17 last-edited invoice landing
expected: Create two drafts; PATCH the older one so updatedAt is newest; reload app — Rechnung loads the PATCHed draft, not the other. Zero invoices → empty form.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps

None blocking — automated verification 12/13. Pending human confirmation only.
