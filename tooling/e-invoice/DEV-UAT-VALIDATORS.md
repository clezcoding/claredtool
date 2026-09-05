# Dev/UAT online validators (D-29)

Free online validators (e.g. [Facturwise](https://www.facturwise.com/) and similar) are **Dev/UAT only**.

## Rules

- **Not the CI gate.** Merge blocking Schematron/CIUS checks run in GitHub Actions job `e-invoice-validate` with pinned local jars: Mustang-CLI 2.26.0 (hybrid PDF) and KoSIT validator 1.6.3 + config 2026-08-31 (XRechnung UBL). See `versions.lock.json` and `validate.sh`.
- **Anonymous fixtures only.** Upload test parties from `packages/pdf-templates/tmp/` and `packages/e-invoice/fixtures/` — never production invoice PII (names, VAT IDs, IBANs, addresses of real customers).
- **No upload automation.** Humans may paste fixtures into online tools during UAT; Clared does not call online validators from Nest, desktop, or CI.

## Stale SSOT note

`docs/clared-takumi-pdfcn-report.md` historically mentioned PDFlib-style embed advice for Factur-X. That path is **stale**: Takumi owns the PDF/A-3b container (`pdfa` + `attachments` + Factur-X XMP). Do not reintroduce a second PDF embed pass.
