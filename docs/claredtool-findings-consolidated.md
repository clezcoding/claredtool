# Claredtool — Konsolidierte Findings (CI, Dependabot, GitHub Actions)

> **Zweck:** Handover-Dokument für die Cursor IDE. Enthält **alle** Findings aus zwei unabhängigen Analysen, dedupliziert, verifiziert und mit umsetzbaren Code-Blöcken.
>
> **Repository:** [clezcoding/claredtool](https://github.com/clezcoding/claredtool)
> **Analysierter Commit:** `2140261beefe599c6471fabbc64ce2f74634dbc5` (30.08.2026, 02:40 +0200) — beide Analysen auf identischem Stand
> **Erstellt:** 30. August 2026
> **Status:** Reine Analyse — am Repository wurde **nichts** geändert.

---

## Legende

**Quelle**
- 🅐 = aus dem angehängten Audit
- 🅒 = aus der Claude-Analyse (Tool-gestützt: GitHub-API via Composio, Context7/dependabot-core)
- 🅐🅒 = von beiden gefunden / bestätigt

**Verifikationsstatus**
- ✅ **VERIFIZIERT** — gegen Repo-Inhalt oder offizielle Quelle geprüft, Fakt bestätigt
- 🔧 **EMPFEHLUNG** — Best Practice / Reifegrad, kein Bug
- ❓ **IM REPO PRÜFEN** — hängt von Einstellungen ab, die im Code nicht sichtbar sind (Branch Protection, Secrets, Signing)

**Severity**
- 🔴 Hoch (Korrektheit: falscher/fehlender Build oder Deploy-Risiko)
- 🟡 Mittel (Effizienz, Abdeckung, Härtung)
- 🟢 Niedrig (Kosmetik, optional)

---

## Executive Summary

Das Setup ist **überdurchschnittlich sauber**: monorepo-bewusste CI mit Pfadfiltern, aggregierter Required-Check `ci`, knappe `permissions`, abgestimmte Dependabot/Kodiak/Labeler-Automatisierung, getrennte Release-Pfade (GHCR/Coolify für Backend, FaynoSync für Desktop). **Kein grundlegender Umbau nötig.**

Die wichtigsten realen Risiken liegen an den **Automatisierungsrändern**:

1. 🔴 **Desktop-Release ignoriert `packages/ui` und pnpm-Kerndateien** → UI-/Dependency-Änderungen erzeugen keinen neuen signierten Build. (F-E1)
2. 🔴 **Backend-Image ignoriert das Tax-Rule-Schema** → Schema-Änderung löst keinen Image-Rebuild aus. (F-B1)
3. 🔴 **Laufende Deploys/Releases können durch neue Läufe abgebrochen werden** (Concurrency). (F-B3, F-E2)
4. 🟡 **CI-Pfadrouting triggert unnötige Jobs** (UI unter `shared`, tax-engine → Desktop) und übersieht `.npmrc`/Schema. (F-C1..C4)
5. 🟡 **CI hat keinen Rust-Cache im `desktop-test`** → langsame Recompiles; und fehlende Checks (Prod-Build, clippy, fmt, alle Rust-Tests). (F-C5, F-C6)
6. 🟡 **Dependabot überwacht Dockerfile & Compose noch nicht.** (F-D3, F-D4)
7. 🟡 **Actions über bewegliche Major-Tags statt SHAs**; 5 Major-Updates offen. (F-SEC1, F-X2)

**Reihenfolge:** Phase 1 (Korrektheit) sofort, danach schrittweise. Siehe [Roadmap](#priorisierte-roadmap).

---

## Findings nach Bereich

Jede ID ist stabil (`F-xx`) und kann als Cursor-Task referenziert werden.

---

### A) `.github/dependabot.yml`

#### F-D1 · 🟢 · 🅒 · ✅ VERIFIZIERT — npm `directory: /` deckt das gesamte pnpm-Workspace ab (kein Handlungsbedarf)
Bestätigt in `dependabot-core` (`npm_and_yarn/file_fetcher.rb`): Dependabot parst `pnpm-workspace.yaml`, expandiert die Globs (`apps/*`, `packages/*`) und holt jede verschachtelte `package.json`. Ein `directories:`-Konstrukt ist **nicht** nötig. Diese Stelle ist korrekt — bewusst so lassen.

#### F-D2 · 🟡 · 🅐🅒 · 🔧 EMPFEHLUNG — Major-Updates einzeln statt gruppiert
Aktuell bündeln `npm-major` / `cargo-major` / `actions-major` **alle** Major-Bumps in je einem PR. Nachteil: ein einziges problematisches Major blockiert den ganzen Gruppen-PR und Breaking Changes sind schwerer isoliert zu reviewen. Da Majors ohnehin manuell gemergt werden (Kodiak automerged nur `minor`/`patch`), sind **Einzel-PRs** übersichtlicher.
**Aktion:** Die drei `*-major`-Gruppenblöcke entfernen, die `*-patch-minor`-Gruppen behalten. (Wartungsentscheidung, keine Korrektheitsfrage.)

#### F-D3 · 🟡 · 🅐🅒 · ✅ VERIFIZIERT — `docker`-Ökosystem für das Backend-Dockerfile ergänzen
`apps/backend/Dockerfile` nutzt `FROM node:24-bookworm-slim` — aktuell **nicht** von Dependabot überwacht.
> Hinweis Nutzen: Da der Tag nur den Major (`24`) pinnt, meldet Dependabot faktisch erst bei einem neuen Major (`node:25`) etwas. Der Sicherheitsnutzen steigt, wenn man auf `node:24.x`-Tags oder Digest-Pinning umstellt (Dependabot pflegt dann auch den `@sha256`-Digest, bestätigt in `docker/shared_file_updater.rb`).

#### F-D4 · 🟡 · 🅐 · ✅ VERIFIZIERT (korrigiert) — `docker-compose`-Ökosystem ergänzen
**Korrektur einer früheren Claude-Aussage:** Dependabot hat sehr wohl ein `docker-compose`-Ökosystem (Modul `docker/lib/dependabot/docker_compose/` in `dependabot-core`; unterstützt semver-/Datums-/Build-Nummer-Tags).
- Erkannt werden literale Tags: `postgres:16-alpine`, `redis:7-alpine`, `gotenberg/gotenberg:8.36.0`.
- **Nicht** erkannt wird das Authentik-Image, weil es über Variableninterpolation gebaut wird (`${AUTHENTIK_IMAGE:-…}:${AUTHENTIK_TAG:-2026.8.0}`) — Dependabot überspringt FROM-/Image-Zeilen mit ARG/Variablen still (bestätigt im `file_parser`). Caveat des Audits ist korrekt.
> Reichweite: Compose-Service-Images in `.github/workflows/ci.yml` (postgres/redis als CI-Services) bleiben davon unberührt — die stehen im Workflow-YAML und werden von keinem Ökosystem erfasst.

#### F-D5 · 🟢 · 🅐 · 🔧 EMPFEHLUNG — gestaffelte `time:` je Ökosystem
`timezone` wirkt nur zusammen mit `time`. Ohne `time` wählt Dependabot die Uhrzeit selbst. Gestaffelte Zeiten (z. B. npm 06:00, Cargo 06:15, Actions 06:30, Docker 06:45, Compose 07:00) verteilen die PR-Last. Optional.

#### F-D6 · 🟡 · 🅐🅒 · 🔧 EMPFEHLUNG — `glib` nur versionsbezogen ignorieren
Aktuell wird `glib` **vollständig** ignoriert (begründet: Tauri/gtk-rs-Kette braucht `glib 0.18`, Fix erst in inkompatibler 0.20-Linie, GHSA-wrw7-89jp-8q8g). Das unterdrückt aber auch kompatible `0.18.x`-Patches inkl. möglicher Security-Fixes.
```yaml
ignore:
  - dependency-name: glib
    # Entfernen, sobald die Tauri/gtk-rs-Kette glib 0.18 nicht mehr erzwingt.
    versions:
      - ">=0.19.0"
```

#### F-D7 · 🟢 · 🅐🅒 · ✅ VERIFIZIERT — redundantes `prefix-development` entfernen
Im npm-Block ist `prefix-development: "chore"` identisch zu `prefix: "chore"` → entfernen.

#### F-D8 · 🟢 · 🅐 · ❓ IM REPO PRÜFEN — pnpm@11 vs. offizielle Support-Tabelle
Repo nutzt `pnpm@11.15.1`; GitHubs Support-Tabelle führte pnpm zeitweise nur bis v10. Dependabot erzeugt hier bereits funktionierende PRs → **kein** akuter Handlungsbedarf. Bei künftigen Dependabot-Fehlern diese Differenz zuerst prüfen.

#### F-D9 · 🟢 · 🅒 · 🔧 EMPFEHLUNG (optional) — `cooldown` für frische Releases
Dependabot unterstützt `cooldown` (z. B. `default-days: 3`, `semver-major-days: 7`), um PRs für brandneue Releases zu verzögern. Reduziert Reaktion auf sofort zurückgezogene Versionen. Optional.

> **Voraussetzung für F-D3/F-D4:** Ein neues Label `docker` muss **zuerst** in `labels.yml` ergänzt werden (siehe F-S1), sonst existiert das in Dependabot referenzierte Label nicht.

**➡️ Vollständige empfohlene `dependabot.yml` am Ende des Dokuments: [Anhang A](#anhang-a--empfohlene-dependabotyml).**

---

### B) `.github/workflows/ci.yml`

#### F-C1 · 🟡 · 🅐 · ✅ VERIFIZIERT — `packages/ui/**` steht unter `desktop` **und** `shared`
Folge: Eine reine UI-Änderung setzt `shared=true` und startet dadurch **backend-unit** und **backend-e2e** unnötig (die Backend-Jobs laufen bei `shared==true`). (`ci.yml` Zeilen 32 und 41.)

#### F-C2 · 🟡 · 🅐 · ✅ VERIFIZIERT — `tax-engine` triggert Desktop-Jobs, obwohl Desktop es nicht nutzt
`apps/desktop/package.json` hat **keine** `@clared/tax-engine`-Abhängigkeit (verifiziert). Trotzdem lösen tax-engine-Änderungen `lint` (Desktop-Typecheck) und `desktop-test` aus.

#### F-C3 · 🟡 · 🅐 · ✅ VERIFIZIERT — `.npmrc` fehlt im `shared`-Filter
`.npmrc` beeinflusst Installs (`onlyBuiltDependencies`), ist aber nicht im `shared`-Filter → Änderungen daran lösen keine relevanten Jobs aus.

#### F-C4 · 🟡 · 🅐🅒 · ✅ VERIFIZIERT — Tax-Rule-Schema im CI-Routing berücksichtigen (+ Duplikat-Hinweis)
`docs/clared-tax-rule-dsl-schema.json` ist **byte-identisch** mit `packages/tax-engine/src/schema/clared-tax-rule-dsl-schema.json` (beide 2140 B, `diff` = identisch). Der tax-engine-Build kopiert die `src/schema`-Variante; das **Backend-Image** kopiert die `docs/`-Variante (Dockerfile). Eine Änderung an `docs/…` sollte daher **Backend-Validierung** in CI auslösen (nicht nur tax-engine). Siehe auch F-X1 (Deduplizierung).

**Empfohlener Pfadfilter-Block für `ci.yml` (adressiert F-C1..C4):**
```yaml
filters: |
  desktop:
    - 'apps/desktop/**'
    - 'packages/ui/**'
  backend:
    - 'apps/backend/**'
    - 'docs/clared-tax-rule-dsl-schema.json'   # wird ins Backend-Image kopiert
  tax-engine:
    - 'packages/tax-engine/**'
  shared:
    - 'package.json'
    - 'pnpm-lock.yaml'
    - 'pnpm-workspace.yaml'
    - '.npmrc'                                  # F-C3
    - '.github/workflows/ci.yml'
```
Und die `if:`-Bedingungen entkoppeln, sodass **Desktop-Jobs** nur auf `desktop`/`shared` reagieren und **Backend-Jobs** auf `backend`/`tax-engine`/`shared` (nicht mehr Desktop bei tax-engine → F-C2).

#### F-C5 · 🟡 · 🅒 · ✅ VERIFIZIERT — `desktop-test` kompiliert Rust **ohne** `swatinem/rust-cache`
Der Job führt `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml sentry_scrub` aus, hat aber **keinen** Rust-Cache-Step (anders als `desktop-build.yml`). Jeder CI-Lauf kompiliert Rust from scratch (oft mehrere Minuten). **Größter risikofreier Zeitgewinn.**
```yaml
- uses: swatinem/rust-cache@v2   # bzw. SHA-gepinnt, siehe F-SEC1
  with:
    workspaces: apps/desktop/src-tauri
```

#### F-C6 · 🟡 · 🅐 · 🔧 EMPFEHLUNG — Qualitäts-Gate erweitern
`lint` ist derzeit nur ein TS-Typecheck. Sinnvolle Ergänzungen (der volle signierte Tauri-Build muss **nicht** pro PR laufen; der Vite-Prod-Build ist günstig):
- `pnpm --filter ./apps/desktop build` (Vite-Prod-Build)
- alle Rust-Tests statt nur Filter `sentry_scrub`: `cargo test --locked`
- `cargo fmt --check`
- `cargo clippy --locked -- -D warnings`
- echtes TS-Linting, sobald ESLint o. Ä. konfiguriert ist
- optional `prisma validate`

#### F-C7 · 🟡 · 🅐🅒 · 🔧 EMPFEHLUNG — reproduzierbare Installs erzwingen
`pnpm install` → `pnpm install --frozen-lockfile`; Cargo-Aufrufe mit `--locked`. Verhindert stille Lockfile-Drifts in CI.

#### F-C8 · 🟢 · 🅒 · ✅ VERIFIZIERT — `pnpm install` läuft 4× (nur Notiz)
In `lint`, `desktop-test`, `backend-unit`, `backend-e2e` je separat. Da die Jobs **parallel** laufen und `setup-node` mit `cache: pnpm` greift, ist Sharing über Artefakte den Aufwand nicht wert. Kein Handlungsbedarf.

#### F-C9 · 🟢 · 🅐 · 🔧 EMPFEHLUNG — `timeout-minutes` pro Job (siehe F-SEC4).

---

### C) `.github/workflows/backend-image.yml`

#### F-B1 · 🔴 · 🅐 · ✅ VERIFIZIERT — Tax-Rule-Schema fehlt in den Trigger-Pfaden
Das Dockerfile führt `COPY docs/clared-tax-rule-dsl-schema.json …` aus, aber weder `on.push.paths` noch der interne `image`-Filter enthalten diese Datei → eine reine Schema-Änderung erzeugt **kein** neues Backend-Image.
**Aktion:** `docs/clared-tax-rule-dsl-schema.json` in **beiden** Pfadlisten ergänzen (bzw. nach F-B2 nur noch in `on.push.paths`).

#### F-B2 · 🟢 · 🅐 · 🔧 EMPFEHLUNG — redundanten `changes`-Job entfernen
Der Workflow ist bereits über `on.push.paths` gefiltert; der zusätzliche `dorny/paths-filter` ist bei Push redundant, bei `workflow_dispatch` wird ohnehin immer gebaut. `changes` entfernen und `build` direkt starten → nur noch **eine** Pfaddefinition, kein Auseinanderlaufen.

#### F-B3 · 🔴 · 🅐 · ✅ VERIFIZIERT (Nuance) — Workflow-weites `cancel-in-progress: true` kann laufenden Deploy abbrechen
Die Workflow-Ebene hat `concurrency: … cancel-in-progress: true` (keyed auf `github.ref`). Der `deploy`-Job hat zwar eine eigene Gruppe `coolify-nest-deploy` mit `cancel-in-progress: false`, doch die **Job-Ebene schützt nicht** vor Abbruch durch die **Workflow-Ebene**: Ein neuer Push nach `main` bricht den vorherigen Lauf inklusive `deploy` ab. Da API und Worker **sequenziell** deployt werden, drohen Mischversionen.
**Aktion:** Concurrency mit `cancel-in-progress: true` nur auf den **build**-Job legen; Deploy-Läufe nicht abbrechbar machen.

#### F-B4 · 🟢 · 🅒 · ✅ VERIFIZIERT — doppeltes `cache-to … mode=max` auf denselben Scope
Beide `docker/build-push-action`-Aufrufe schreiben `cache-to: type=gha,scope=clared-backend,mode=max`. Parallel/aufeinanderfolgend auf denselben Scope kann sich der Cache gegenseitig überschreiben.
**Aktion:** `cache-to` nur beim **ersten** Build; `cache-from` bei beiden.

#### F-B5 · 🟡 · 🅐 · 🔧 EMPFEHLUNG — Deploy härten
`environment: production` (bzw. `coolify-production`) für den Deploy-Job; nach dem Deployment Health-/Readiness-Endpunkt prüfen; Rollback-/Beibehaltungsstrategie bei Fehlern.

#### F-B6 · 🟡 · 🅐 · ❓ IM REPO PRÜFEN — Prisma-Migration beim API-Start
Das API-Image startet mit `prisma migrate deploy && node dist/main.js`. Für **eine** Instanz ok; bei mehreren Replikas konkurrierende Migrationen. Das Dockerfile notiert dies bereits (`ponytail`-Kommentar). Vor horizontaler Skalierung: separater, einmaliger Migration-Step vor dem Rollout.

#### F-B7 · 🟡 · 🅐🅒 · ❓ IM REPO PRÜFEN — SBOM/Provenance als Tech-Debt führen
`provenance: false`, `sbom: false` sind bewusst deaktiviert (dokumentierte Coolify-Inkompatibilität mit Attestation-Indizes). Als technische Schuld führen und nach Coolify-Upgrade erneut aktivieren.

---

### D) `.github/workflows/desktop-build.yml`

#### F-E1 · 🔴 · 🅐 · ✅ VERIFIZIERT — Trigger-Pfade übersehen UI & pnpm-Kerndateien
Aktuell nur `apps/desktop/**` und `.github/workflows/desktop-build.yml`. Desktop nutzt `@clared/ui` → eine UI- oder Dependency-Änderung erzeugt **keinen** neuen signierten Build nach dem Merge.
**Aktion:** ergänzen:
```yaml
paths:
  - apps/desktop/**
  - packages/ui/**
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - .npmrc
  - .github/workflows/desktop-build.yml
```
> Hinweis (korrekt im Audit): Pfadfilter werden bei **Tag-Pushes** nicht ausgewertet — die `v*`-Produktionsbuilds laufen davon unabhängig weiter.

#### F-E2 · 🔴 · 🅐 · ✅ VERIFIZIERT (Nuance) — Concurrency vermischt Staging/Prod/Manual
Gruppe `desktop-build-${{ github.workflow }}-${{ github.ref }}`. Bei `workflow_dispatch` auf `main` ist `github.ref = refs/heads/main` → **gleiche Gruppe** wie ein normaler main-Push. Ein neuer main-Push kann so einen manuell gestarteten (Staging-)Lauf oder einen laufenden Publish abbrechen. (Tag-Releases haben eine eigene ref → sicher.)
**Aktion:** Concurrency nach Zielumgebung/Trigger aufteilen; Production-/Tag-Releases **nie** automatisch abbrechen; höchstens veraltete automatische Staging-Builds.

#### F-E3 · 🟡 · 🅐 · 🔧 EMPFEHLUNG — Rust-Toolchain reproduzierbar pinnen
`dtolnay/rust-toolchain@stable` zieht den jeweils aktuellen Stable-Stand. Ein eingechecktes `rust-toolchain.toml` mit fester Version macht lokale Builds und CI reproduzierbar.

#### F-E4 · 🟡 · 🅐 · ✅ VERIFIZIERT — FaynoSync-Artefaktauswahl über `find … | head -1`
Bei mehreren Treffern wird still das erste gewählt. Zwar folgt `test -n "$MAC_FILE"` (bricht bei **null** ab), aber nicht bei **mehreren**.
**Aktion:** genau ein erwartetes Artefakt verlangen; bei ≠1 Treffer abbrechen; Dateiname/Plattform/Arch/App-Version vor dem Upload prüfen.

#### F-E5 · 🟡 · 🅐 · 🔧 EMPFEHLUNG — Tag-/Version-Konsistenz prüfen
Bei `v*`-Tags explizit prüfen, dass der Tag mit der Version in `apps/desktop/src-tauri/tauri.conf.json` übereinstimmt (verhindert, dass `v1.2.0` versehentlich Artefakt `1.1.0` publiziert).

#### F-E6 · 🟡 · 🅐 · ❓ IM REPO PRÜFEN — OS-Signing/Notarisierung dokumentieren
Der Workflow signiert **Updater-Artefakte** (`TAURI_SIGNING_PRIVATE_KEY`). Für öffentliche Distribution zusätzlich nötig/zu dokumentieren: Apple Developer ID + macOS-Notarisierung, Windows Authenticode. Für interne Tests reicht die Updater-Signatur.

#### F-E7 · 🟡 · 🅒 · ✅ VERIFIZIERT — `actions/download-artifact@v7` ist veraltet (v8 verfügbar)
Siehe Versions-Matrix F-X2. `upload-artifact@v7` ↔ `download-artifact@v8` sind trotz Major-Divergenz kompatibel (gemeinsames v4+-Backend).

---

### E) `.github/labeler.yml` + `.github/workflows/labeler.yml`

#### F-L1 · 🟢 · 🅐 · 🔧 EMPFEHLUNG — Labels ergänzen
`backend` für `apps/backend/**`, `tax-engine` für `packages/tax-engine/**` + Tax-Rule-Schema, `docker`/`infrastructure` für Dockerfiles & Compose. (Voraussetzung: Labels existieren in `labels.yml`.)

#### F-L2 · 🟢 · 🅐 · ✅ VERIFIZIERT — Doppel-Label bei `documentation`
`documentation` matcht `**/*.md`, wodurch auch `.planning/**`-Markdown zusätzlich zum `planning`-Label das `documentation`-Label erhält. Falls unerwünscht: `documentation` auf `README.md`, `docs/**` und gezielte App-READMEs einschränken.

Der Labeler ist ansonsten korrekt/sicher (`pull_request` statt `pull_request_target`, `sync-labels: false` schützt manuelle Merge-Sperren).

---

### F) `.github/workflows/sync-labels.yml` + `.github/labels.yml`

#### F-S1 · 🟡 · 🅐 · ✅ VERIFIZIERT — `skip-delete: false` löscht nicht gelistete Labels
Konsistent mit „labels.yml = Single Source of Truth". Beibehalten, **wenn** das gewollt ist. **Wichtig:** vor Aktivierung von Docker-Dependabot (F-D3/F-D4) das `docker`-Label **zuerst** in `labels.yml` ergänzen, sonst wird es entfernt bzw. existiert nicht. Wenn die Datei nicht die vollständige Quelle sein soll, wäre `skip-delete: true` sicherer.

---

### G) `.github/PULL_REQUEST_TEMPLATE.md`

#### F-P1 · 🟢 · 🅐 · 🔧 EMPFEHLUNG — Testplan verallgemeinern
Aktuell stark Desktop-orientiert. Vorschlag Checkliste: relevante Unit-/E2E-Tests grün; Prod-Build der betroffenen App grün; DB-Migration geprüft (falls Prisma betroffen); Desktop-/UI-Verhalten geprüft (falls betroffen); Deployment-/Infra-Änderung dokumentiert (falls betroffen).

---

### H) Bereichsübergreifend: Sicherheit & Härtung

#### F-SEC1 · 🟡 · 🅐🅒 · 🔧 EMPFEHLUNG — Actions auf vollständige Commit-SHAs pinnen
Major-Tags (`@v7`, `@v6`, …) sind **veränderlich**. GitHub bezeichnet nur die volle SHA als unveränderlich. Dependabot aktualisiert SHA-gepinnte Actions weiterhin; Versionskommentar erhält die Lesbarkeit:
```yaml
uses: actions/checkout@<full-commit-sha> # v7.0.1
```
> Kontext (🅒): Die aktuell verwendeten Majors sind heute **auf dem neuesten Major-Stand** (außer den in F-X2 gelisteten) — SHA-Pinning ist also **Härtung**, keine akute Fehlerbehebung.

#### F-SEC2 · 🟡 · 🅐 · ❓ IM REPO PRÜFEN — Branch Protection & CI-Kopplung
`ci`, `backend-image`, `desktop-build` reagieren unabhängig auf Push nach `main`; Builds können starten, während CI für denselben Commit noch läuft/fehlschlägt. Absichern: `main` schützen, aggregierten Check `ci` **required**, direkte Main-Pushes sperren; optional Deploys erst nach erfolgreichem CI starten.

#### F-SEC3 · 🟡 · 🅐 · ❓ IM REPO PRÜFEN — Production Environments härten
Manuelle Freigabe, environment-spezifische Secrets, beschränkte Deployment-Branches/Tags, optionale Wartezeit. Sensible Werte (Coolify-Token, FaynoSync-Token, Prod-Signing) nicht breiter als nötig als Repo-Secrets.

#### F-SEC4 · 🟢 · 🅐 · 🔧 EMPFEHLUNG — `timeout-minutes` pro Job
Richtwerte: Label-/Filter 5 min; Typecheck/Unit 10–15; Backend-E2E 15–20; Docker-Build 30–45; Tauri-Matrix 60–90; Publish/Deploy 15–20.

#### F-SEC5 · 🟢 · 🅒 · ✅ VERIFIZIERT — `desktop-test` läuft auf `ubuntu-22.04`
Bewusst gepinnt (`libwebkit2gtk-4.1-dev`), funktioniert auch auf `ubuntu-24.04` (= `ubuntu-latest`). Da 22.04 mittelfristig ausläuft, perspektivisch Umzug auf 24.04 testen. Kein akuter Handlungsbedarf.

---

### I) Zusätzliche Claude-Funde (nicht im Audit)

#### F-X1 · 🟡 · 🅒 · ✅ VERIFIZIERT — Schema-Duplikat vermeiden (Drift-Risiko)
`docs/clared-tax-rule-dsl-schema.json` und `packages/tax-engine/src/schema/clared-tax-rule-dsl-schema.json` sind **byte-identisch**. Zwei Kopien können auseinanderlaufen. **Aktion:** eine Single Source of Truth definieren (z. B. tax-engine als Quelle, docs/ per Build/Symlink erzeugen oder das Dockerfile direkt aus `packages/tax-engine/src/schema/` kopieren lassen).

#### F-X2 · 🟡 · 🅒 · ✅ VERIFIZIERT (GitHub-API, 30.08.2026) — Versions-Matrix der Actions
Offene Major-Updates (per Repo-Policy manuell zu mergen). Auffällig: das **Docker-Actions-Cluster** hängt (Argument für F-D2, Majors einzeln).

| Action | Gepinnt | Neuester Stand | Status |
|---|---|---|---|
| actions/checkout | v7 | v7.0.1 | ✅ aktuell |
| actions/setup-node | v7 | v7.0.0 | ✅ aktuell |
| actions/upload-artifact | v7 | v7.0.1 | ✅ aktuell |
| **actions/download-artifact** | **v7** | **v8.0.1** | ⬆️ v8 verfügbar |
| actions/labeler | v7 | v7.0.0 | ✅ aktuell |
| pnpm/action-setup | v6 | v6.0.10 | ✅ aktuell |
| dorny/paths-filter | v4 | v4.0.3 | ✅ aktuell |
| **docker/setup-buildx-action** | **v3** | **v4.3.0** | ⬆️ v4 verfügbar |
| **docker/login-action** | **v3** | **v4.6.0** | ⬆️ v4 verfügbar |
| **docker/build-push-action** | **v6** | **v7.3.0** | ⬆️ v7 verfügbar |
| **docker/metadata-action** | **v5** | **v6.2.0** | ⬆️ v6 verfügbar |
| swatinem/rust-cache | v2 | v2.9.2 | ✅ aktuell |
| crazy-max/ghaction-github-labeler | v6 | v6.0.0 | ✅ aktuell |

---

## Priorisierte Roadmap

### Phase 1 — Korrektheit (sofort)
- [ ] **F-E1** Desktop-Build-Pfade um UI & pnpm-Kerndateien ergänzen
- [ ] **F-B1** Tax-Rule-Schema in Backend-Image-Pfade aufnehmen
- [ ] **F-B3** Backend-Deploy nicht durch Workflow-Concurrency abbrechbar machen
- [ ] **F-E2** Desktop-Release-Concurrency nach Ziel trennen (Prod/Tag nie abbrechen)
- [ ] **F-SEC2** Branch Protection: `ci` required, direkte Main-Pushes sperren *(im Repo prüfen)*

### Phase 2 — Abdeckung & Effizienz
- [ ] **F-C1..C4** CI-Pfadrouting bereinigen (UI, tax-engine, `.npmrc`, Schema)
- [ ] **F-C5** `swatinem/rust-cache` in `desktop-test` ergänzen *(größter Zeitgewinn)*
- [ ] **F-C6** Vite-Prod-Build, `cargo test/fmt/clippy`, optional `prisma validate`
- [ ] **F-C7** `--frozen-lockfile` / `--locked`
- [ ] **F-B2** redundanten `changes`-Job in `backend-image.yml` entfernen
- [ ] **F-B4** doppeltes `cache-to` bereinigen

### Phase 3 — Supply Chain
- [ ] **F-D2** Dependabot: Major-Gruppen auflösen
- [ ] **F-D3 / F-D4** Docker- & Docker-Compose-Dependabot ergänzen (+ Label in `labels.yml`, F-S1)
- [ ] **F-D6 / F-D7** `glib`-Ignore verfeinern; redundantes `prefix-development` entfernen
- [ ] **F-SEC1** Actions auf Commit-SHAs pinnen
- [ ] **F-E3** Rust-Version via `rust-toolchain.toml` fixieren
- [ ] **F-X2** offene Action-Majors reviewen/mergen (download-artifact v8, Docker-Cluster)
- [ ] **F-X1** Schema-Duplikat auflösen

### Phase 4 — Release-Reife
- [ ] **F-B5** Deploy-Healthcheck + Rollback
- [ ] **F-B6** Prisma-Migration aus dem Containerstart lösen (vor Skalierung)
- [ ] **F-B7** SBOM/Provenance nach Coolify-Upgrade reaktivieren
- [ ] **F-E4 / F-E5** FaynoSync-Artefaktauswahl robust; Tag-/Version-Konsistenz
- [ ] **F-E6** macOS-Notarisierung & Windows-Signing dokumentieren/ergänzen
- [ ] **F-SEC3 / F-SEC4** Production-Environments härten; `timeout-minutes`
- [ ] **F-L1 / F-L2 / F-P1 / F-SEC5** Labels, PR-Template, ubuntu-24.04-Migration

---

## Anhang A — Empfohlene `dependabot.yml`

> Berücksichtigt F-D2 (Majors einzeln), F-D3 (docker), F-D4 (docker-compose), F-D5 (time), F-D6 (glib), F-D7 (kein prefix-development). Label `docker` vorher in `labels.yml` anlegen (F-S1).

```yaml
# https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference
version: 2
updates:
  # ---------- npm / pnpm workspace (deckt apps/* und packages/* ab, F-D1) ----------
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly, day: monday, time: "06:00", timezone: Europe/Berlin }
    open-pull-requests-limit: 10
    labels: [dependencies, npm]
    commit-message: { prefix: "chore", include: scope }
    groups:
      npm-patch-minor:
        update-types: [patch, minor]
        patterns: ["*"]
    # F-D2: keine major-Gruppe -> Majors kommen als Einzel-PRs

  # ---------- Cargo (Tauri) ----------
  - package-ecosystem: cargo
    directory: /apps/desktop/src-tauri
    schedule: { interval: weekly, day: monday, time: "06:15", timezone: Europe/Berlin }
    open-pull-requests-limit: 5
    labels: [dependencies, cargo]
    commit-message: { prefix: "chore", include: scope }
    ignore:
      # gtk-rs 0.18 (Tauri 2 Linux) braucht glib ^0.18; GHSA-wrw7-89jp-8q8g erst in 0.20.
      # F-D6: nur inkompatible Linien blocken, 0.18.x-Patches zulassen.
      - dependency-name: glib
        versions: [">=0.19.0"]
    groups:
      cargo-patch-minor:
        update-types: [patch, minor]
        patterns: ["*"]

  # ---------- GitHub Actions ----------
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly, day: monday, time: "06:30", timezone: Europe/Berlin }
    open-pull-requests-limit: 5
    labels: [dependencies, github-actions]
    commit-message: { prefix: "chore", include: scope }
    groups:
      actions-patch-minor:
        update-types: [patch, minor]
        patterns: ["*"]

  # ---------- Docker (Backend-Dockerfile, F-D3) ----------
  - package-ecosystem: docker
    directory: /apps/backend
    schedule: { interval: weekly, day: monday, time: "06:45", timezone: Europe/Berlin }
    open-pull-requests-limit: 5
    labels: [dependencies, docker]
    commit-message: { prefix: "chore", include: scope }

  # ---------- Docker Compose (F-D4; Authentik via Variable wird uebersprungen) ----------
  - package-ecosystem: docker-compose
    directory: /
    schedule: { interval: weekly, day: monday, time: "07:00", timezone: Europe/Berlin }
    open-pull-requests-limit: 5
    labels: [dependencies, docker]
    commit-message: { prefix: "chore", include: scope }
```

---

## Anhang B — Verifikationsnachweis

- **Repo geklont & gelesen** auf Commit `2140261…` — alle Dateien unter `.github/`, `dependabot.yml`, `Dockerfile`, `Cargo.toml`, `compose*.yml`, alle `package.json`.
- **Action-Versionen** (F-X2): GitHub REST API (`GET /releases/latest`) via Composio-GitHub-Integration (Account `clezcoding`), Abruf 30.08.2026.
- **Dependabot-Verhalten** (F-D1, F-D4, D6, D9): Context7 gegen `dependabot/dependabot-core` (`file_fetcher.rb`, `docker_compose`-Modul, `file_parser.rb`, `shared_file_updater.rb`, `NEW_ECOSYSTEMS.md`).
- **Schema-Duplikat** (F-X1/F-C4): `diff` = identisch (2140 B).
- **Desktop↔tax-engine** (F-C2): `apps/desktop/package.json` enthält keine `@clared/tax-engine`-Abhängigkeit.
- **Korrektur:** Frühere Claude-Aussage „Dependabot kann Compose nicht überwachen" war falsch — `docker-compose`-Ökosystem existiert (F-D4).

## Quellen
- [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
- [Supported Dependabot ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories)
- [GitHub Actions secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [Workflow triggers & path filters](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [dependabot/dependabot-core](https://github.com/dependabot/dependabot-core)
- [Repository @ analysiertem Commit](https://github.com/clezcoding/claredtool/tree/2140261beefe599c6471fabbc64ce2f74634dbc5)
