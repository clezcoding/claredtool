# Cursor-Handoff: Phase 04.4 abgleichen und Phase 04.5 erstellen/planen

## Auftrag

Arbeite im Repository `clezcoding/claredtool` mit **GSD Core**. Schließe zuerst ausschließlich die Dokumentations- und Evidenzabweichungen von Phase 04.4. Erstelle danach eine neue eingeschobene **Phase 04.5: Repository Reliability, Performance & Maintainability Hardening** und plane sie vollständig. In diesem Auftrag soll Phase 04.5 **noch nicht ausgeführt** werden.

## Sicherheitsregel: vorhandene Alt-Arbeitsstände nicht weiterverwenden

### Tatsächlich aktuell in Cursor geöffneter Clone

Cursor arbeitet momentan in einem separaten Clone:

- Pfad: `/Users/puzzless/Desktop/claredtool`
- einziger dort registrierter Worktree
- Branch: `gsd/quick-260904-f60-gha-dedupe`
- HEAD: `33565d92a6081306a0b634ed417e037b9f46431c`
- Tracking-Branch: `origin/gsd/quick-260904-f60-gha-dedupe`
- Abweichung: 2 Commits ahead / 2 Commits behind `origin/main`

Die zwei alten Branch-Commits sind andere Commitobjekte als der Squash-Merge von PR #114. Der aktuelle Dateiinhalt ihrer relevanten Quick-Task-Dateien (`pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.planning/STATE.md` und `.planning/quick/260904-ile-*`) ist gegenüber `origin/main` jedoch bereits identisch. Deshalb **weder mergen noch rebasen noch cherry-picken**.

In diesem Clone liegen drei nicht committete Dateien:

- `.planning/STATE.md` — Forensics-Nebeneffekt; setzt unter anderem `completed_phases` fälschlich von 8 auf 7 und `state_head` auf den alten Branch
- `.planning/forensics/report-20260904-230931.md` — auf dem veralteten Branch erzeugter Bericht
- `docs/CURSOR_GSD_PHASE_04.5_HANDOFF.md` — unnötige Kopie dieses externen Handoffs

Keine dieser drei Dateien in diesem alten Branch committen. Sie dürfen bis zur späteren bewussten Bereinigung unverändert liegen bleiben. Die externe Source of Truth für den Handoff ist:

`/Users/puzzless/Documents/ChatGPT/ClaredGithzb/CURSOR_GSD_PHASE_04.5_HANDOFF.md`

Erstelle aus diesem Clone einen frischen linked Worktree von `origin/main`, ohne den schmutzigen Haupt-Worktree zu verändern:

```bash
git -C /Users/puzzless/Desktop/claredtool fetch origin
git -C /Users/puzzless/Desktop/claredtool worktree add \
  /Users/puzzless/Desktop/claredtool-phase-04.5 \
  -b gsd/phase-04.5-planning origin/main
```

Öffne danach `/Users/puzzless/Desktop/claredtool-phase-04.5` als neues Cursor-Projekt und führe sämtliche folgenden GSD-Schritte ausschließlich dort aus.

### Separater früherer Audit-Worktree

Zusätzlich existiert noch der frühere Codex-/Audit-Worktree:

- Pfad: `/Users/puzzless/Documents/ChatGPT/ClaredGithzb/claredtool-pr-work`
- Branch: `codex/gha-follow-up-optimizations`
- HEAD: `a87ca2a35678448804966cee7e517195cec0d11e`
- Zustand: zehn nicht committete Änderungen unter `.github/**`
- aktueller `origin/main`: `27e26b620d277fa16e8139ef78678b1bd0ee351b`

Dieser Worktree enthält ältere, teilweise inzwischen überholte Workflow-Varianten. Daher:

1. Dort **nichts committen, stagen, staschen, resetten, löschen oder auf `main` übertragen**.
2. Keine Datei aus diesem Worktree ungeprüft übernehmen.
3. Phase 04.5 ausschließlich im oben beschriebenen frischen Desktop-Worktree von `origin/main` bearbeiten.
4. Vor jeder Änderung bestätigen, dass `HEAD` den Merge-Commit `27e26b620d277fa16e8139ef78678b1bd0ee351b` enthält oder dessen Nachfolger auf `origin/main` ist.
5. Falls der vorgeschlagene Branch oder Pfad schon existiert, einen neuen eindeutigen Namen verwenden; keine bestehende Arbeit überschreiben.


## Verbindlicher Live-Stand nach Phase 04.4

PR [#115](https://github.com/clezcoding/claredtool/pull/115) wurde auf ausdrücklichen Wunsch des Users durch Kodiak mit dem Label `automerge` per Squash gemergt.

- PR-Head: `f6d0e254e4e2d0d336f1751c66b85a02f12842ac`
- Merge-Commit auf `main`: `27e26b620d277fa16e8139ef78678b1bd0ee351b`
- PR-Checks: vollständig grün
- `main` CI: erfolgreich — <https://github.com/clezcoding/claredtool/actions/runs/33922528310>
- `main` CodeQL (JavaScript/TypeScript und Rust): erfolgreich — <https://github.com/clezcoding/claredtool/actions/runs/33922528386>
- `main` Backend Image/Deploy: erfolgreich — <https://github.com/clezcoding/claredtool/actions/runs/33922528337>
- Gitleaks und Zizmor auf `main`: erfolgreich
- Backend-Images wurden gebaut, mit Trivy geprüft, per Cosign signiert und automatisch deployed.
- API- und Worker-Deploy wurden anhand der konkreten Coolify-Deployment-UUIDs abgewartet und verifiziert.
- Öffentlicher Readiness-Check nach dem Deploy: `status: ok`; PostgreSQL, Redis und Gotenberg `up`.
- Der Remote-Feature-Branch wurde durch Kodiak gelöscht.

## Teil A: Phase 04.4 nur dokumentarisch abgleichen

Phase 04.4 ist bereits als vollständig markiert. Sie darf **nicht neu geöffnet oder erneut ausgeführt** werden. Prüfe aber alle Phase-04.4-Artefakte gegen den aktuellen `main` und korrigiere ausschließlich veraltete Tatsachenbehauptungen.

Mindestens prüfen:

- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/phases/04.4-github-actions-optimization-ci-fan-out-security-workflows-de/04.4-VERIFICATION.md`
- `04.4-REVIEW.md`, `04.4-REVIEW-FIX.md`, `04.4-UAT.md`, `04.4-MANUAL-GITHUB.md` und vorhandene D-34-Evidenz
- alle Phase-04.4-Summaries, deren Behauptungen durch PR #115 überholt wurden

Bekannte veraltete Aussagen, die gegen `main` neu verifiziert werden müssen:

- Backend-CI ist wieder bewusst in `backend-unit` und `backend-e2e` getrennt; keine Aussage über einen aktuellen Job `backend-test` stehen lassen.
- Desktop-Signing verwendet auf `main` `windows-2025` und `macos-26`; alte Behauptungen zu `windows-2022` / `macos-15` als aktuellem Zustand korrigieren.
- Gitleaks führt im Workflow nur noch einen fail-closed Vollhistorien-Scan aus und verwendet explizit `.gitleaks.toml`; der SARIF-Upload bleibt erhalten.
- Backend-Deploy wartet auf die konkrete Coolify-Deployment-UUID, prüft Tag/Status und wartet auch Rollbacks ab.
- Worker `running:unknown` ist nur bei deaktiviertem Healthcheck zulässig.
- CodeQL erkennt `**/rust-toolchain.toml`.
- Squawk wird über einen eigenen Datenbank-Pfadfilter aktiviert.
- Dependabot gruppiert Docker- und Compose-Minor-/Patch-Updates.
- `labeler.yml` und `sync-labels.yml` wurden durch PR #115 nicht verändert.

Regeln für den Abgleich:

1. Keine historischen PLAN- oder SUMMARY-Dokumente umschreiben, wenn GSD sie als unveränderliche Ausführungshistorie behandelt. In diesem Fall einen klaren post-merge Addendum-/Verification-Eintrag verwenden.
2. Phase 04.4 bleibt `complete`; nur Evidenz, aktuelle Architektur und Nachträge korrigieren.
3. Keine neuen Workflow-Änderungen im Rahmen dieses Closeouts.
4. Keine GitHub-Einstellungen automatisch ändern. Offene Founder-Aufgaben wie Required Checks, Secret Scanning oder Push Protection nur als `human`/`manual` dokumentieren, sofern sie live noch offen sind.
5. Keine erfundenen Resultate: GitHub CLI und GitHub Connector für aktuelle Belege verwenden.

## Teil B: Phase 04.5 einfügen

Der aktuelle GSD-Stand zeigt Phase 5 als `planning`, aber noch ohne Plan. Füge deshalb vor Phase 5 eine dezimale Phase nach Phase 4 ein. Mit der aktuellen GSD-Core-Syntax:

```text
/gsd-phase --insert 4 "Repository Reliability, Performance & Maintainability Hardening"
```

Da bereits 4.1 bis 4.4 existieren, muss GSD daraus Phase **04.5** erzeugen. Falls GSD eine andere Nummer vorschlägt, nicht manuell improvisieren: Roadmap und Phase-Index prüfen und nur bei nachgewiesener Konsistenz fortfahren.

Danach den normalen GSD-Zyklus verwenden:

```text
/gsd-discuss-phase 4.5
/gsd-plan-phase 4.5 --research
```

Alternativ darf dieses Dokument als PRD-Eingabe verwendet werden:

```text
/gsd-plan-phase 4.5 --research --prd /Users/puzzless/Documents/ChatGPT/ClaredGithzb/CURSOR_GSD_PHASE_04.5_HANDOFF.md
```

## Ziel von Phase 04.5

Eine begrenzte technische Hardening-Phase zwischen CI-Optimierung und den Produktfeatures von Phase 5. Sie soll nur nachweisbare Qualitäts-, Wartbarkeits-, Performance- und Verifikationsschulden schließen, ohne neue Produktfunktionalität einzuführen.

GSD soll zuerst den aktuellen `origin/main` untersuchen und erst danach den exakten Umfang festlegen. Folgende Punkte sind **Research-Kandidaten, keine ungeprüften Pflichtlösungen**:

1. Den langen Inline-Coolify-Deploy-/Rollback-Code aus `backend-image.yml` auf Testbarkeit und Wartbarkeit prüfen. Eine Extraktion in ein versioniertes, lokal testbares Script nur planen, wenn sie Verhalten und Secret-Grenzen erhält und den Workflow tatsächlich vereinfacht.
2. Den aktuellen Vite-Produktionsbuild untersuchen: derzeit existiert eine Warnung zu einem etwa 787-kB-Chunk sowie eine ineffektive dynamische Importgrenze. Nur messbare, risikoarme Code-Splitting-Verbesserungen planen; keine UI- oder Routing-Neugestaltung.
3. Die AJV-Strict-Union-Warnungen in den Tax-Engine-Tests untersuchen. Nur Schema-/Test-Hygiene planen; keine Steuerlogik, Rule-Prioritäten oder Collision-Semantik erfinden.
4. Aktuelle Laufzeiten als Baseline aufnehmen: PR `desktop-rust` etwa 7:29 Minuten, `main` Rust-CodeQL etwa 8:58 Minuten, Backend-Image inklusive Deploy etwa 5 Minuten. Optimierungen nur bei messbarem Nutzen und ohne Security-/Coverage-Abbau.
5. Repo-weit nach belegtem totem Code, duplizierter Konfiguration, übergroßen Modulen, unnötigen Abhängigkeiten und fehlenden Grenztests suchen. Codebase-Knowledge-Graph bevorzugen; Textsuche nur für Konfigurationen und Literale.
6. Dokumentation und `.planning` auf aktuelle Architektur, tatsächliche Workflows und umsetzbare manuelle Betriebsaufgaben abgleichen.

## Explizite Nicht-Ziele von Phase 04.5

Diese Grenzen stammen aus bestehenden Projektentscheidungen und dürfen nicht durch ein allgemeines „Cleanup“ aufgehoben werden:

- PDF-Produktfluss, Tax-Decision-Audit und Offline-Sync bleiben Phase 5.
- Tenant-Isolation/Billing bleibt der dokumentierte v2-/SAAS-01-Bereich, sofern die Roadmap nichts anderes beschließt.
- Keine neue Priority-Tie- oder Collision-Semantik für die Tax Engine erfinden.
- Der dateibasierte `RuleStore` bleibt absichtliche Source of Truth.
- Der API-Container bleibt der einzige Produktions-Prisma-Migrator; keinen GitHub-hosted Production-Migrate-Job ergänzen.
- Keine Actions-Caches in signierten Desktop-Builds.
- Verhalten von `labeler.yml` und `sync-labels.yml` nicht beiläufig ändern.
- Keine Umstellung von Harden Runner `egress-policy: audit` auf `block` ohne vollständig gemessene Allowlist.
- Keine Produkt-, UI-, PDF-, Offline- oder Audit-Features vorziehen.
- Keine Produktions-Deployments, Release-Tags oder signierten Production-Builds während der Planung auslösen.
- Keine Änderungen aus `codex/gha-follow-up-optimizations` blind übernehmen.

## Anforderungen an die Phase-04.5-Planung

Die Planung muss:

1. neue eindeutige Requirement-IDs für 04.5 anlegen und vollständig auf die Phase mappen;
2. `04.5-CONTEXT.md`, `04.5-RESEARCH.md`, `04.5-VALIDATION.md` und ausführbare `04.5-XX-PLAN.md`-Dateien erzeugen;
3. jede Empfehlung mit Ist-Beleg, Zielmetrik, Risiko, Rückrollweg und konkretem Test versehen;
4. zwischen sicheren Quick Wins, messpflichtigen Experimenten und bewusst verworfenen Ideen unterscheiden;
5. bei CI-/Performance-Optimierungen Vorher-/Nachher-Walltime und Runner-Minuten definieren;
6. für Workflowänderungen Actionlint, Zizmor, Gitleaks, YAML-Parsing und Bash-Syntax als Gates beibehalten;
7. für Anwendungscode die bestehenden Desktop-, Backend-, Tax-Engine-, Prisma- und Rust-Prüfungen passend zum Änderungsbereich verlangen;
8. keine Akzeptanzkriterien wie „verbessert“, „sauberer“ oder „schneller“ ohne messbaren Grenzwert verwenden;
9. Pläne in kleine, logisch commitbare Waves zerlegen;
10. am Ende den GSD-Plan-Checker bestehen lassen und einen kurzen Scope-/Risiko-/Wave-Bericht ausgeben.

## Werkzeuge und Quellen

- Lokales Repository und `.planning` sind die primäre Source of Truth.
- Codebase-Memory/Knowledge-Graph für Code-Discovery und Abhängigkeitsanalyse verwenden.
- GitHub CLI und GitHub Connector für aktuellen PR-, Run- und Repository-Zustand verwenden.
- Context7 für aktuelle Bibliotheks- und Framework-Dokumentation verwenden.
- Bei GSD-Core-Verhalten ausschließlich aktuelle offizielle Dokumentation aus `open-gsd/gsd-core` verwenden.
- Keine Empfehlung allein aus Erinnerung oder aus dem alten Cursor-Worktree übernehmen.

## Erwartetes Ergebnis dieses Auftrags

- Phase 04.4 bleibt abgeschlossen und besitzt einen wahrheitsgemäßen Post-PR-#115-Nachweis.
- Phase 04.5 steht korrekt zwischen 04.4 und 5 in ROADMAP/STATE.
- Phase 04.5 ist vollständig recherchiert, diskutiert, geplant und vom Plan-Checker validiert.
- Phase 04.5 wurde **nicht ausgeführt**.
- Alle Änderungen liegen in einem frischen Branch/Worktree; der alte schmutzige Cursor-Worktree ist unangetastet.
- Nichts wird gepusht oder gemergt, bevor der User die Planung geprüft und ausdrücklich freigegeben hat.
