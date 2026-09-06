# E-invoice Spec pins + CI fixtures (Phase 04.7)

`versions.lock.json` is the single Spec pin source (D-08): Mustang-CLI, KoSIT validator + XRechnung config, `node-zugferd`, XMP strings.

## Committed fixtures (anonymous / test parties only — D-29)

| Artifact | Path | Validator |
|----------|------|-----------|
| Hybrid Factur-X PDF/A-3b (DE B2B 19% Comfort) | `packages/pdf-templates/tmp/fixture-1-de-b2b.pdf` | Mustang-CLI validate (`--no-notices`) |
| XRechnung 3.0 UBL (same money facts + B2G Leitweg BT-10) | `packages/e-invoice/fixtures/fixture-xrechnung-b2g-leitweg.xml` | KoSIT standalone + config `2026-08-31` |

Additional PDF smoke fixtures (not required by the CI gate):

- `packages/pdf-templates/tmp/fixture-2-en-b2b.pdf`
- `packages/pdf-templates/tmp/fixture-3-de-reverse-charge.pdf`

Regenerate PDFs via `pnpm --filter @clared/pdf-templates test` (writes under `tmp/`).  
Regenerate UBL with Node against `@clared/e-invoice` (`buildFacts()` + `buyerReference` Leitweg + `serializeUblXRechnung`).

## Scripts

```bash
bash tooling/e-invoice/download-pins.sh   # jars + config → tooling/e-invoice/.cache/
bash tooling/e-invoice/validate.sh        # Mustang + KoSIT (needs Java 17+)
```

GHA job `e-invoice-validate` runs the same scripts with Temurin 17 (D-27). Never sole online validators (D-29).

## Local Java

Mustang 2.26 needs **JRE 11+** (CI uses Temurin **17**). Local OpenJDK 8 is insufficient — install Temurin 17+ for manual validate, or rely on the `e-invoice-validate` GitHub Actions job.

See also: [DEV-UAT-VALIDATORS.md](./DEV-UAT-VALIDATORS.md) (D-29 online validators).
