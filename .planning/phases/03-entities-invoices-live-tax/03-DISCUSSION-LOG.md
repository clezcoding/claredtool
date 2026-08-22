# Phase 3: Entities, Invoices & Live Tax - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-22
**Phase:** 3-Entities, Invoices & Live Tax
**Areas discussed:** Firmen & Kunden anlegen, Rechnung speichern, Live-Steuer, Tax-Regeln v1, Start nach Login, TransactionFacts, Pflichtfelder, Rechnungsnummer und Währung

---

## Firmen & Kunden anlegen

| Option | Description | Selected |
|--------|-------------|----------|
| Panel unter der Liste | Same slot as Phase 1 detail | ✓ |
| Dialog-Fenster | Modal create | |
| Extra Seite | Separate route | |

**User's choice:** 1a panel
**Notes:** Follow-up: country first, then that country's legal forms (5b), not a flat worldwide dropdown. Types = long catalog (3c), not LLC/GmbH-only.

| Option | Description | Selected |
|--------|-------------|----------|
| Kunde immer zu einer Firma | Seller entity FK | ✓ |
| Unabhängig | No entity | |
| Viele Firmen | M2M | |

**User's choice:** 2a

| Option | Description | Selected |
|--------|-------------|----------|
| Nur US LLC + EU-GmbH | PRD sample pair | |
| Freitext | User types form | |
| Lange Liste vieler Länderformen | Catalog | ✓ |

**User's choice:** 3c

| Option | Description | Selected |
|--------|-------------|----------|
| Button grau + Hinweis | Visible disabled | ✓ |
| Unsichtbar | Hide Anlegen | |
| Klick dann Fehler | Allow click, 403 | |

**User's choice:** 4a

| Option | Description | Selected |
|--------|-------------|----------|
| Suchbares Welt-Dropdown | All forms in one list | |
| Erst Land, dann Formen | Two-step | ✓ |
| Lange Liste ohne Suche | Flat dump | |

**User's choice:** 5b

---

## Rechnung speichern

| Option | Description | Selected |
|--------|-------------|----------|
| Auto nach Pause (Entwurf) | Debounced autosave | ✓ |
| Nur Speichern-Button | Explicit save | |
| Beim Verlassen jedes Felds | Blur save | |

**User's choice:** 1a

| Option | Description | Selected |
|--------|-------------|----------|
| Nur Entwurf; Final+PDF Phase 4 | Draft-only | ✓ |
| Entwurf und Stellen ohne PDF | Issue button | |
| Direkt final | No draft | |

**User's choice:** 2a

| Option | Description | Selected |
|--------|-------------|----------|
| Leeres Formular, alte bleiben | Neue Rechnung | ✓ |
| Kopie der letzten | Duplicate | |
| Immer Sample | Phase 1 home | |

**User's choice:** 3a

| Option | Description | Selected |
|--------|-------------|----------|
| Auswahl oben auf der Rechnungs-Seite | Header picker | ✓ |
| Extra Sidebar-Liste | New nav item | |
| Nur über Kunde/Firma | No invoice list | |

**User's choice:** 4a

---

## Live-Steuer

| Option | Description | Selected |
|--------|-------------|----------|
| Auto nach Pause bei Feldänderung | Debounced evaluate | ✓ |
| Button Steuer berechnen | Manual | |
| Nur beim Speichern | After persist | |

**User's choice:** 1a

| Option | Description | Selected |
|--------|-------------|----------|
| Nur Server POST /api/tax/evaluate | No desktop engine | ✓ |
| Server plus Desktop-Kopie | Dual | |
| Nur Desktop | Local engine | |

**User's choice:** 2a

| Option | Description | Selected |
|--------|-------------|----------|
| Letzte Werte + Fehler in der Leiste | Fail soft | ✓ |
| Leiste leer | Clear on error | |
| Tippen blockieren | Hard fail | |

**User's choice:** 3a

| Option | Description | Selected |
|--------|-------------|----------|
| Leiste 4 Felder, Tax-Seite alle, beide live | Keep Phase 1 split | ✓ |
| Überall dieselben Felder | Full parity | |
| Live nur in der Leiste | /tax stays sample | |

**User's choice:** 4a

---

## Tax-Regeln v1

| Option | Description | Selected |
|--------|-------------|----------|
| EU-USt + Reverse Charge / Drittland | Narrow v1 | |
| Nur Sample-Pfad | EU-GmbH → US only | |
| Ganze Matrix inkl. CH/UK/GCC | Broad | ✓ (interpreted) |

**User's choice:** 1c
**Notes:** Captured as all **current** classes in `docs/clared-tax-rule-matrix.md` (EU/US/UAE/third). CH/UK are **not** in that table — deferred TAX-04, do not invent. User also picked microservice (3c); redirected — TAX-03 v2. Follow-up: files+DB with **files win** (5a); `packages/tax-engine` (6a).

| Option | Description | Selected |
|--------|-------------|----------|
| Nur JSON-Dateien | File RuleStore | |
| Nur Postgres | DB RuleStore | |
| Dateien und Datenbank | Dual | ✓ |

**User's choice:** 2c then 5a files-win

| Option | Description | Selected |
|--------|-------------|----------|
| packages/tax-engine | Workspace library | ✓ (after redirect) |
| Nur Backend-Ordner | Inline module | |
| Microservice | TAX-03 | asked; deferred |

**User's choice:** 3c then 6a

| Option | Description | Selected |
|--------|-------------|----------|
| Kein Override in der UI | Engine only | ✓ |
| Owner und Tax-Rolle | Override UI | |
| Jeder mit invoice.write | Wide override | |

**User's choice:** 4a

---

## Start nach Login / TransactionFacts / Pflichtfelder / Nummer

| Option | Description | Selected |
|--------|-------------|----------|
| Letzte Rechnung, sonst leer | Replaces Phase 1 D-22 | ✓ |
| Immer Sample | Keep D-22 | |
| Immer leer | Always new | |

**User's choice:** 1a

| Option | Description | Selected |
|--------|-------------|----------|
| Backend mappt Rechnung → Facts | Desktop sends invoice data | ✓ |
| Desktop baut Facts | Client knows engine input | |
| Beides | Live client + save server | |

**User's choice:** 2a

| Option | Description | Selected |
|--------|-------------|----------|
| Name, Land, Rechtsform, Adresse; USt-Id wenn EU | Entity required set | ✓ |
| Nur Name und Land | Minimal | |
| Nur Name | Name-only | |

**User's choice:** 3a

| Option | Description | Selected |
|--------|-------------|----------|
| Nummer auto (Jahr+Zähler); Währung von Firma, änderbar | | ✓ |
| Nummer tippen; immer EUR | | |
| Nummer auto; immer EUR | | |

**User's choice:** 4a

---

## Claude's Discretion

Debounce length; country→form table contents; invoice-number uniqueness scope; evaluate request shape (draft body vs id); optional customer extra fields; Prisma naming.

## Deferred Ideas

- Tax-engine microservice (TAX-03 / v2)
- CH/UK rule modules not in the current matrix (TAX-04)
- Issue/PDF, audit_logs, offline engine (Phase 4)
- Tax override UI
