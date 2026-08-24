---
phase: 03
slug: entities-invoices-live-tax
status: verified
threats_open: 0
asvs_level: 1
created: 2026-08-22
---

# Phase 03 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Authenticated client → Nest product routes | Bearer session; untrusted JSON bodies | Entity/customer/invoice/tax DTOs |
| Nest → Postgres | Prisma + tagged `$queryRaw` invoice counters | Product rows (instance-global) |
| Nest → packages/tax-engine | In-process library; rules from repo JSON | TransactionFacts in, TaxDecision out |
| Desktop renderer → Nest | `apiFetch` Bearer only; no embedded engine | Invoice-shaped evaluate body |
| npm/shadcn → packages/ui | Copied components only (no new registry deps in product waves) | UI primitives |
| Authentik → Nest (inherited Phase 02) | OIDC session unchanged | Groups → RBAC permissions |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01 | Elevation of privilege | POST /api/entities, Anlegen UI | high | mitigate | `RequirePermission` entity.create / kunde.write; `PermissionsGuard` APP_GUARD; viewer 403 e2e; desktop disabled Anlegen + hint | closed |
| T-03-02 | Tampering | POST/PATCH /api/invoices | high | mitigate | `ValidationPipe` whitelist; no number/status in DTOs; server-computed netto; `invoice.write` guard; items-only PATCH bumps `updatedAt` (D-17) | closed |
| T-03-03 | Tampering | POST /api/tax/evaluate | high | mitigate | Invoice-shaped DTO; server `facts-mapper` + `evaluate()`; no `@clared/tax-engine` in desktop; no override UI (D-16) | closed |
| T-03-04 | Tampering | tax-engine RuleStore | high | mitigate | Ajv2020 vs SSOT schema; `additionalProperties: false`; file seed only; no rules-write HTTP | closed |
| T-03-05 | Information disclosure | instance-global rows | medium | accept | RESEARCH A4: no tenant_id v1; RBAC capability not row-level; SAAS-01 deferred | closed |
| T-03-06 | Tampering | invoice_counters SQL | high | mitigate | Tagged Prisma `$queryRaw` template only in `invoices.service.ts` | closed |
| T-03-07 | Tampering | tax-rail legal_reference | medium | mitigate | `String(value)` text nodes in `tax-rail.tsx`; no `dangerouslySetInnerHTML` in apps | closed |
| T-03-08 | Tampering | legalForm / country | medium | mitigate | Server `isValidLegalForm(country, form)` → 422; country-first combobox UX | closed |
| T-03-09 | Tampering | vatId | medium | mitigate | `@ValidateIf` EU-27 required on entity/customer DTOs; hidden in UI when non-EU | closed |
| T-03-10 | Elevation of privilege | match.ts priority | high | mitigate | `evaluate.spec.ts` proves 2-match throws; priority not used as winner | closed |
| T-03-11 | Denial of service | 600ms autosave+evaluate | low | accept | 600ms debounce; Prisma pool 10; no extra rate limit this phase | closed |
| T-03-SC (P01–P06) | Tampering | npm/shadcn installs | high | mitigate | RESEARCH legitimacy audit for ajv/ajv-formats; shadcn copies into `packages/ui`; no new unvetted registry deps in execution waves | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

> **Note:** `T-03-SC` appears in plans 03-01 through 03-06. Disambiguated with plan suffix where needed.

SUMMARY threat flags: none recorded as open across 03-01–03-06 SUMMARY files.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-05 | No tenant_id / row-level isolation v1; instance-global product data; SAAS-01 seats/tenancy deferred | gsd-secure-phase | 2026-08-22 |
| AR-03-02 | T-03-11 | Founder-scale debounce sufficient; no evaluate rate limit this phase | gsd-secure-phase | 2026-08-22 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-22 | 12 | 12 | 0 | gsd-secure-phase (ASVS L1 grep; register at plan time, threats_open 0) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-22
