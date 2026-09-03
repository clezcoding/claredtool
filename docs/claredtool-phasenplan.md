# Claredtool — Phasenplan (nach Audit-Umsetzung) + Re-Check

> **Re-Check-Stand:** `main` @ `329e1a1` (03.09.2026), frisch geklont & Datei-für-Datei gegen die F-xx geprüft — **Korrektheit, nicht nur Anwesenheit**.
> **Status:** reine Analyse — am Repo nichts geändert.
> **Grundlage:** `claredtool-findings-consolidated.md` (F-xx, Cursor erledigt) + `claredtool-findings-part2.md` (W/N/G) + `claredtool-free-tools-guide.md` (Installations-Snippets).

---

## 1. Verifikations-Ergebnis der Audit-Umsetzung

**Verdikt: sehr sauber umgesetzt.** Praktisch alle F-xx sind im gemergten Code vorhanden **und korrekt**. Stichproben, die ich am Code bestätigt habe:

| Bereich | Bestätigt im Code |
|---|---|
| **ci.yml** | Routing korrekt (UI nur `desktop`, tax-engine triggert **nicht** mehr Desktop, `.npmrc`+Schema im Filter); **rust-cache** in `desktop-test` ✅; `--frozen-lockfile`; Rust `1.97.1` + `cargo fmt/clippy -D warnings/test --locked`; `prisma validate`; Vite-Prod-Build im `lint`; **alle** Jobs `timeout-minutes`; `desktop-test` auf `ubuntu-24.04`; Actions SHA-gepinnt mit `# vX`-Kommentar |
| **backend-image.yml** | `changes`-Job entfernt (nur `on.push.paths`); **Concurrency getrennt** (build cancelbar, deploy `coolify-nest-deploy` nicht); `cache-to` nur am 1. Build; Schema-Pfad im Trigger; docker-Actions aktuell (v7.3.0/v6.2.0/v4.3.0/v4.6.0, SHA-gepinnt) → **Node20-Deprecation weg**; **`migrate`-Job** (`environment: production`, skippt ohne Secret); **`deploy` mit Health-Poll (30×10s) + Rollback auf PREV_TAG** |
| **desktop-build.yml** | UI/pnpm-Pfade im Trigger; **Concurrency nach Ziel** (prod/manual nie auto-cancel, nur staging); Rust `1.97.1`; **FaynoSync exact-one** (mapfile+Count+Basename/Pfad-Check); **Tag == `tauri.conf.json`-Version** erzwungen; `download-artifact@v8.0.1`; SHA-Pins; Timeouts |
| **dependabot.yml** | `time:` gestaffelt; **Major-Gruppen entfernt**; `glib` nur `>=0.19.0` ignoriert; `prefix-development` weg; **docker**-Ökosystem (node `>=25` ignoriert); **docker-compose**-Ökosystem |
| **Sonstiges** | `labels.yml` enthält `docker`-Label ✅; `rust-toolchain.toml` = `1.97.1` |

### Bewusste Abweichungen — von mir bestätigt als vertretbar
- **F-B6** (Prisma-Migrate beim API-Start bleibt): Der `migrate`-Job existiert, skippt sauber ohne erreichbare DB (Coolify-Postgres = internes Docker-DNS). Für **eine** Replika korrekt. → offen erst vor Scale-out.
- **F-B7** (`provenance:false`/`sbom:false`): als TECH-DEBT im Code kommentiert. Bewusst.
- **F-E6** (OS-Signing/Notarisierung): in `04.2-UPDATER-OPS.md` dokumentiert, Zertifikate nicht gekauft. Updater-Minisign reicht intern.
- **F-SEC3** (Environment-Reviewer): YAML hat `environment: production`; Reviewer/Branch-Policy sind **GitHub-UI** (YAML kann das nicht) — korrekt so.

### ⚠️ Eine Prüfung, die ich in dieser Session nicht abschließen konnte
Die **Composio-GitHub-Verbindung ist abgestürzt** → ich konnte die **echten Run-Ergebnisse** (ist `main`-`ci` grün? clippy-Fix greift?) nicht live ziehen. Der Code ist in sich stimmig; bitte einmal bestätigen, dass der **letzte `ci`-Run auf `main` grün** ist (bzw. ich hole es nach, sobald die Verbindung zurück ist). Alles Weitere unten ist unabhängig davon.

---

## 2. Was noch offen ist (Basis für die Phasen)

| ID | Sev | Thema | Stand nach Cursor |
|---|---|---|---|
| **N1-Rest** | 🟡 | Rust-Compile ist jetzt **auf Linux** pre-merge gated (clippy/test). **Windows-/macOS-spezifische** Compile-Breaks (wie R1: `on_web_content_process_terminate`) werden weiter **erst nach Merge** in `desktop-build` sichtbar. | teil-offen |
| **W2** | 🟡 | `desktop-build`/`backend-image` triggern unabhängig vom `ci`-Erfolg. Durch F-SEC2 (required `ci`, `enforce_admins`, kein Force-Push) **stark entschärft**; Restrisiko = Post-Merge-Skew. | optional |
| **W1** | 🟢 | Auf `main` laufen weiterhin **alle** ci-Jobs ungefiltert (jeder Merge fährt `desktop-test`). Dank rust-cache jetzt billiger. | optional |
| **N4** | 🟢 | Bundle-Identifier `com.clared.app` endet auf `.app` (Tauri-Warnung). | offen |
| **N5** | — | Kein `shell:true` in euren Skripten gefunden → DEP0190 stammt aus Upstream-Tooling. | **erledigt/n. a.** |
| **F-B6/B7/E6/SEC3** | 🟡/🟢 | Bewusst zurückgestellt (siehe oben). | geplant/extern |
| **G1–G10** | 🟡 | Kostenlose Security-/Supply-Chain-Tools noch nicht installiert. | offen |

---

## 3. Phasenplan (Fortsetzung: Phase 5–8)

> Jede Phase hat **Definition of Done (DoD)**, damit Cursor autonom abarbeiten kann. Reihenfolge = Nutzen/Risiko. Snippets & exakte Versionen: `claredtool-free-tools-guide.md`.

### Phase 5 — Kostenlose Security-Basis (Quick Wins, „bleibt frei")
**Ziel:** Lücken schließen, die heute *niemand* abdeckt; alle Low-Effort und dauerhaft gratis (public **und** private).

| # | Aufgabe | DoD |
|---|---|---|
| 5.1 | **zizmor** (G1) — neuer Workflow `zizmor.yml`, scannt `.github/workflows/**` | Workflow läuft grün auf PR+main; Findings gesichtet; kritische (Injection/zu breite `permissions`) behoben oder bewusst unterdrückt |
| 5.2 | **gitleaks** (G3) — `gitleaks.yml`, `fetch-depth: 0` | Läuft auf PR+push; keine aktiven Secrets im Verlauf; ggf. `.gitleaksignore` für False-Positives |
| 5.3 | **Trivy** (G2) — Step in `backend-image.yml` nach Build, `exit-code: 1`, `severity: HIGH,CRITICAL`, `ignore-unfixed: true` | Image-Scan läuft; HIGH/CRITICAL entweder behoben (Base-Image-Bump via neuer docker-Dependabot) oder dokumentiert ge-ignored |

**Aufwand:** niedrig · **Risiko:** minimal (nur neue Checks).

### Phase 5b — Nur solange Repo **public** ist (jetzt Gratis-Nutzen mitnehmen)
> **Vor dem Wechsel auf private neu bewerten** — beide werden privat kostenpflichtig.

| # | Aufgabe | DoD |
|---|---|---|
| 5b.1 | **CodeQL** (G6) — „Default setup" (Settings→Code security) **oder** `codeql.yml` mit Matrix `javascript-typescript` + `rust` | Analyse läuft; kritische Alerts triagiert |
| 5b.2 | **Harden-Runner** (G_) — `egress-policy: audit` als erster Step in `ci`/`backend-image`/`desktop-build` | Läuft im Audit-Modus; nach 1–2 Wochen Egress-Report sichten; **nicht** auf `block` ohne Allowlist |
| — | **Merke:** vor Private-Umstellung 5b.1/5b.2 entfernen oder GHAS/Enterprise budgetieren | Entscheidung dokumentiert |

### Phase 6 — Deploy- & DB-Sicherheit vertiefen
**Ziel:** die neuen Deploy-/Migrate-Pfade absichern und Migrationen prüfen.

| # | Aufgabe | DoD |
|---|---|---|
| 6.1 | **Squawk** (G5) — Step in `ci.yml` (Backend-Zweig): `prisma migrate diff … --script` → `sbdchd/squawk-action` | Läuft bei Änderungen unter `apps/backend/prisma/migrations/**`; unsichere Muster (blockierende Locks, NOT NULL ohne Default) werden geflaggt |
| 6.2 | **Health/Rollback verifizieren** (F-B5 ist im Code) — einmal einen fehlschlagenden Deploy simulieren (z. B. falscher Tag) und prüfen, dass der Rollback auf `PREV_TAG` greift | Rollback-Pfad nachweislich getestet; `/health/ready`-Endpoint existiert & liefert 200 |
| 6.3 | **SBOM + cosign** (G8) — `anchore/sbom-action` + `cosign` (keyless/OIDC) in `backend-image.yml` | SBOM-Artefakt am Image; Signatur erstellt; **Hinweis:** getrennt von F-B7 (buildx-`provenance`/`sbom` bleiben aus, bis Coolify Attestation-Indizes ziehen kann) |

**Aufwand:** mittel · **Risiko:** niedrig.

### Phase 7 — Rest-Härtung der Workflows (optional, nach Nutzen)
| # | Aufgabe | DoD |
|---|---|---|
| 7.1 | **N1-Rest** — plattformübergreifender **`cargo check`** in PR-CI: kleine Matrix (`windows-latest`, `macos-latest`) mit `cargo check --locked` (ohne vollen `tauri build`) | Ein Windows-/macOS-spezifischer Rust-Break (wie R1) schlägt **im PR** fehl, nicht erst nach Merge. Alternativ bewusst akzeptieren + hier dokumentieren |
| 7.2 | **W2** — Entweder Branch-Protection „**require branches up to date before merging**" aktivieren, **oder** `desktop-build`/`backend-image` via `workflow_run` (`workflows: [ci]`, `conclusion == 'success'`) gaten | Ein `main`-Commit, dessen `ci` rot ist, löst **kein** Deploy/Release aus. Falls „up to date" reicht: dokumentieren, dass W2 damit geschlossen ist |
| 7.3 | **W1** — auf `main` die Pfadfilter **nicht** mehr per `if: ref==main` umgehen (PR hat bereits getestet) → spart `desktop-test` bei Backend-only-Merges | Backend-only-Merge auf `main` startet `desktop-test` nicht mehr; Post-Merge-`ci` bleibt für betroffene Bereiche grün |
| 7.4 | **N4** — Bundle-Identifier weg von `.app` (z. B. `com.clared.desktop`) | Tauri-Warnung verschwindet. **Achtung:** Identifier-Wechsel ändert Updater-/Installations-Identität → nur bewusst mit Versions-/Migrationsplan |

**Hinweis:** 7.1–7.3 sind Effizienz/Robustheit, kein akuter Fehler. 7.4 nur, wenn der `.app`-Identifier stört (kosmetisch).

> **Bewusst NICHT Teil dieses Plans** (zurückgestellt, extern/terminiert): F-SEC3 (UI-Reviewer), F-E6 (Signing-Zertifikate), F-B6 (Scale-out-Migrate), F-B7 (SBOM nach Coolify-Upgrade), G10 (Changesets). Bleiben als bekannte, absichtliche Tech-Debt bestehen.

---

## 4. Empfohlene Reihenfolge (kompakt)
1. **Phase 5** (zizmor, gitleaks, Trivy) — sofort, gratis, schließt echte Lücken.
2. **Phase 5b** (CodeQL, Harden-Runner) — jetzt mitnehmen, **solange public**.
3. **Phase 6** (Squawk, Rollback-Test, SBOM/cosign).
4. **Phase 7** (N1-Rest, W2, W1, N4) — nach Bedarf.

---

## 4b. Was DU manuell machst (nicht Cursor)
Cursor schreibt die YAML/Workflows; folgende Punkte kann nur ein Mensch in der GitHub-UI bzw. per Entscheidung erledigen:
- **CodeQL aktivieren** (falls „Default setup" statt Workflow): Settings → Code security → CodeQL → Enable (nur solange public).
- **Security-Findings sichten**: nach dem ersten Lauf die Alerts von zizmor/gitleaks/Trivy/CodeQL im Tab *Security* durchgehen und entscheiden (fixen / bewusst ignorieren).
- **W2 (7.2)** — falls ihr den einfachen Weg wählt: Branch-Protection für `main` → „Require branches to be up to date before merging" anhaken.
- **Rollback-Test (6.2)**: einmal bewusst ein fehlerhaftes Deploy auslösen (z. B. via `workflow_dispatch`) und prüfen, dass der Rollback greift.
- **Vor dem Wechsel public → private**: CodeQL + Harden-Runner entfernen ODER GHAS/Enterprise budgetieren.
- **Keine neuen Secrets nötig** für Phase 5–7 (gitleaks braucht bei deinem persönlichen Account keinen Lizenzschlüssel; cosign nutzt OIDC).

---

## 5. Verifikationsnachweis
- `main` @ `329e1a1` frisch geklont; `ci.yml`, `backend-image.yml`, `desktop-build.yml`, `dependabot.yml`, `rust-toolchain.toml`, `labels.yml`, `tauri.conf.json` gelesen und gegen die F-xx abgeglichen.
- Bestätigt offen: `com.clared.app` endet auf `.app` (N4); kein `shell:true` in `apps/desktop/scripts` (N5 n. a.); keine Security-Tool-Workflows vorhanden (G offen); `if: ref==main`-Bypass unverändert (W1); keine `workflow_run`-Kopplung (W2).
- **Nicht** verifizierbar diese Session: Live-Run-Status (`ci` grün?) — Composio-GitHub-Verbindung war getrennt. Bitte bestätigen oder ich hole es nach.
