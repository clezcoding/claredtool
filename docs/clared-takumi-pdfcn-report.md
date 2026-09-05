# Takumi + pdfcn für clared: Evaluations- und Migrations-Report

## Executive Summary

Dieser Report fasst eine tiefe Evaluierung von **Takumi** (takumi-pdf) und **pdfcn** als neue PDF-Engine für das clared-Invoicing-System zusammen, inklusive Vergleich mit der bisherigen Gotenberg/Chromium-Planung und Implikationen für E‑Invoicing und Multi-Tenant-Anpassbarkeit.[^1][^2][^3][^4][^5]
Die Kernempfehlung lautet: Für clared v1 ist Takumi + pdfcn eine sehr gut passende Engine-Kombination, da sie React-/shadcn-kompatibel, performant, kostengünstig auf dem selbst gehosteten Coolify-Cluster betreibbar und AI-/Template-freundlich ist; E‑Invoicing bleibt in beiden Architekturen (Takumi vs. Gotenberg) ein zusätzlicher Layer, der unabhängig vom PDF-Renderer implementiert werden muss.[^6][^7][^8][^9][^10]


## Kontext: clared-Architektur und PDF-Anforderungen

### Produkt- und Architekturkontext

- clared ist ein kommerzielles, proprietäres B2B-Invoicing-Produkt (Tauri Desktop für macOS/Windows) mit Fokus auf internationale Tax-Compliance für EU/DACH, UAE und US LLCs.[^7]
- Der Backend-Stack ist NestJS + Postgres + Redis + Authentik auf einem selbst gehosteten Coolify-Cluster, betrieben ausschließlich durch den Founder (kein Kunden-Self-Host, kein Free-Tier).[^11][^7]
- Das v1-PRD definiert PDF-01 als Requirement: Backend-renderte PDF-Rechnungen mit Templates, eingebettetem TaxDecision-Text und Mehrsprachigkeit (DE/EN) pro Mandant/Document.[^11][^7]

### Roadmap-Status vor der Evaluierung

- Die Roadmap Phase 4.3 hat eine Infrastruktur-Vorbereitung für PDF eingeplant: Gotenberg als Render-Service auf Coolify, BullMQ-Skeleton (Redis) für asynchrone pdf-generation, Worker-Prozess, Pino/OpenTelemetry/Grafana für Monitoring.[^12][^6]
- Phase 5 soll die Endnutzer-Funktionalität liefern: PDF-Download, TaxDecision-Audittrail, Offline-Sync über SQLite; PDF-Engine war bisher implizit Gotenberg/Chromium, ohne finalen Architekturentscheid.[^6][^11]
- clared setzt auf ein „Mockup-first“-Designsystem (Crafted Minimal, shadcn-ähnlich) und nutzt React 19/Vite/Tauri 2 für das Desktop-Frontend, was für eine React-basierte PDF-Engine besonders relevant ist.[^12][^6]


## Überblick: Takumi und pdfcn

### Takumi (takumi-pdf)

- Takumi ist eine JS/TS-Bibliothek und Runtime, die **JSX/HTML + CSS** in paginierte PDFs und OG-Images rendert, ohne Headless-Browser, und in Node.js, Cloudflare Workers, Browsern und Rust-Anwendungen läuft.[^4][^13][^14]
- Das Modul `takumi-pdf` rendert paged, selektierbaren Text als PDF direkt aus JSX; Benchmarks zeigen für ein zweiseitiges Invoice-Dokument (mit Seitennummerierung) Cold-Start-Zeiten um ~176 ms und Warm-Renderzeiten um ~26 ms, deutlich schneller als Puppeteer/Chrome oder react-pdf.[^15][^4]
- Takumi unterstützt Tailwind-ähnliche Utility-Klassen, ist aber nicht vollständig CSS-kompatibel mit Chromium; bestimmte Filter/Blur-Effekte werden nicht oder nur approximiert unterstützt.[^13][^15]

### pdfcn

- pdfcn ist eine MIT-lizenzierte, Open-Source-PDF-Komponentenbibliothek für React, gebaut auf Takumi und Forme, mit Fokus auf copy-paste-Komponenten ähnlich shadcn/ui.[^16][^17][^18][^5]
- pdfcn liefert fertige Komponenten und Blocks (z.B. Page Header, Key-Value-Blöcke, Tabellen, Fußzeilen) sowie vordefinierte Invoice- und Report-Templates, die kompatibel mit shadcn/ui installiert werden und dann als Quellcode im Projekt liegen.[^19][^17][^20]
- Das Projekt positioniert sich explizit als AI-/LLM-freundlich: Ein `llms.txt` beschreibt pdfcn als Sammlung von PDF-Blocks, die LLMs zusammensetzen und modifizieren können; Themes und Komponenten sind darauf ausgelegt, von Code-Generatoren angepasst zu werden.[^21][^3]


## Vergleich: Takumi + pdfcn vs. Gotenberg + Chrome

### Performance und Skalierung

- Gotenberg basiert auf Headless Chromium: Jede PDF-Erzeugung durchläuft einen vollständigen Browser-Render (DOM, Layout, CSS/JS), was pro Dokument nennenswerte CPU- und RAM-Kosten verursacht; typische Puppeteer-/Chrome-Pipelines liegen für komplexe Dokumente in der Größenordnung von 0,7–2,8 Sekunden Cold-Start und ~200 ms warm.[^22][^23][^24][^15]
- Takumi-pdf vermeidet den Browser entirely und rendert in einer Rust/WASM-Engine innerhalb des Node-Prozesses; Benchmarks zeigen Warm-Renderzeiten für ein zweiseitiges Invoice-PDF von ~26 ms und signifikant geringere Cold-Start-Zeiten gegenüber Puppeteer/Chrome.[^2][^4][^15]
- Für clareds Zielgröße (z.B. 60 Firmen mit insgesamt ~500 Nutzern) bedeutet das: Ein kleiner Cluster von NestJS-APIs plus dedizierten PDF-Workern kann bei Takumi deutlich mehr PDF-Jobs pro CPU-Kern abwickeln, ohne zusätzliche Browser-Container oder separate Gotenberg-Services auf Coolify bereitstellen zu müssen.[^7][^4][^6]

### Sicherheit und Isolation

- Gotenberg bietet durch den separaten Chromium-Container eine klare Isolationsschicht: PDF-Rendering läuft in einem eigenen Prozess/Container, kann mit Resource Limits, internen Firewalls und separatem Monitoring gehärtet werden; Fehlerhafte HTML/CSS oder JS-Bugs betreffen in erster Linie den Renderer, nicht den API-Prozess.[^23][^24]
- Takumi/pdfcn laufen im selben Node-Prozess wie der NestJS-Worker; das reduziert Netzwerk-Angriffsfläche und Service-Komplexität, verlangt aber ein sehr bewusstes Ressourcen-Management (Job-Concurrency, CPU-Limits, Backpressure), damit rechenintensive Templates keine Worker lahmlegen.[^25][^26][^4]
- In beiden Fällen ist E-Invoicing-spezifische Sicherheit (z.B. Validierung, Signaturen, Auditability) ein separater Layer über der PDF-Engine; weder Gotenberg noch Takumi bringen out-of-the-box signierte E-Rechnungen oder XML-Embedding mit.[^27][^10][^28]

### Anpassbarkeit, Templates und AI-Workflows

- Gotenberg nutzt HTML+CSS als Template-Sprache; Layouts können aus bestehenden Web-Layouts abgeleitet werden, Designer-Freigaben lassen sich über HTML-Pipelines abbilden, aber die Template-Verwaltung läuft typischerweise über String-basierte Engines (Handlebars, Nunjucks, EJS) und per-Tenant-Templates (viele Dateien oder komplexe Branch-Logik).[^29][^22][^23]
- Takumi/pdfcn verwenden JSX/React-Komponenten als Template-Sprache; Templates sind wiederverwendbare Komponenten mit Props (z.B. Theme, LayoutVariant, customTexts) und damit natürlich typisiert, refaktorisierbar und direkt kompatibel mit clareds React/Tauri-Stack.[^17][^5][^4][^13]
- pdfcn und LLM-spezifische Dateien (llms.txt) sind explizit darauf ausgelegt, dass AI-Tools Komponenten/Blocks generieren und zusammensetzen: Blocks für Invoices, Reports und generische Dokumente plus Themes können von AI-generatoren angepasst werden, was sehr gut zum AI-first-Workflow des Projekts passt.[^3][^20][^21]

### Kosten und Betrieb auf Coolify

- Gotenberg/Chromium erfordert einen zusätzlichen Container (oder mehrere) auf dem Coolify-Cluster, mit nennenswertem RAM- und CPU-Bedarf, regelmäßigen Chrome-Updates und zusätzlichem Monitoring; dies erhöht die laufenden Infrastrukturausgaben und den betrieblichen Aufwand.[^24][^23][^6]
- Takumi/pdfcn sind reine Libraries; sie laufen innerhalb der bestehenden Node/NestJS-Deployments und verursachen keine zusätzlichen Service-Kosten oder extra Deployments auf Coolify – nur zusätzlichen CPU-Load, der durch Worker-Skalierung gesteuert wird.[^14][^4][^7]
- Da pdfcn/Takumi MIT-/OSS-lizenziert sind und keinerlei per-Request-Gebühren erheben, passen sie gut zum Ziel, clared vollständig auf selbst gehosteter Infrastruktur ohne externe PDF-SaaS-Abhängigkeiten zu betreiben.[^5][^3][^7]


## E-Invoicing (ZUGFeRD/Factur-X/XRechnung) und Takumi/pdfcn

### Was E-Invoicing formell verlangt

- ZUGFeRD/Factur-X sind hybride E-Invoice-Standards, bei denen eine PDF/A‑3-Datei die menschlich lesbare Rechnung darstellt, während eine eingebettete XML-Datei (basierend auf UN/CEFACT CII) die maschinenlesbaren Rechnungsdaten enthält; zusammen bilden sie eine EN‑16931-konforme E-Rechnung.[^8][^9][^30][^31][^10]
- XRechnung ist ein reines XML-Format für Deutschland, das ohne PDF auskommen kann, aber im Praxisbetrieb oft mit einem „Friendly PDF Copy“ kombiniert wird; sowohl XRechnung als auch Factur-X/ZUGFeRD unterliegen laufenden Updates der Spezifikation (z.B. ZUGFeRD 2.3.3 / Factur-X 1.0.7 in 2025).[^32][^33][^34][^35]
- Für clared bedeutet das: E-Invoicing erfordert zusätzlich zur PDF-Generierung eine strukturierte XML-Erzeugung (CII/XRechnung) und ein korrektes PDF/A‑3 + XML-Embedding – unabhängig davon, ob das sichtbare PDF aus Gotenberg/Chrome oder aus Takumi/pdfcn stammt.[^10][^28][^27]

### Pipeline mit Takumi/pdfcn für E-Invoicing

Eine mögliche clared-spezifische Pipeline (unabhängig vom Renderer):

1. **InvoiceModel & TaxDecision**  
   clared verfügt bereits über eine TaxEngine mit TransactionFacts→TaxDecision und ein strukturiertes Invoice-Modell; dieses kann als gemeinsame Quelle sowohl für das sichtbare PDF als auch für die E-Invoice-XML genutzt werden.[^11][^7]

2. **XML-Generator**  
   Ein separater Service (z.B. in Node oder einer anderen Sprache) transformiert InvoiceModel + TaxDecision in eine EN‑16931-konforme XML (Factur-X/ZUGFeRD oder XRechnung); existierende Bibliotheken (z.B. in PHP, Java, .NET) können hier als Referenz oder Brücke dienen.[^9][^36][^27][^10]

3. **PDF-Rendering mit Takumi/pdfcn**  
   Takumi/pdfcn rendert das sichtbare Invoice-PDF aus denselben Daten; das Layout ist über React-Komponenten definiert und kann Mandanten-spezifisch variiert werden (Logo, Farben, Sprachversion, Layoutvarianten).[^17][^4][^13][^5]

4. **PDF/A‑3 + XML-Embedding**  
   Eine PDF-Bibliothek (z.B. PDFlib, webPDF oder eine Node-Lösung) erzeugt ein PDF/A‑3-Dokument, embeddet die XML als Datei, setzt notwendige Metadaten (XMP, ZUGFeRD/Factur-X-Profil) und validiert die resultierende E-Rechnung gegen entsprechende Validatoren.[^37][^28][^27][^10]

Dieser Ablauf ist identisch, egal ob der PDF-Renderer Takumi/pdfcn oder Gotenberg/Chromium ist; somit „disqualifiziert“ sich Takumi/pdfcn nicht für E-Invoicing, sondern verschiebt den Compliance-Fokus auf eine saubere XML-Pipeline und ein robustes PDF/A‑3-Embedding.[^31][^35][^10]


## Multi-Tenant-Templates und Mandanten-Customization

### Anforderungen von clared

- Jede Firma (Mandant) soll eigene Logos, Farben, Sprachvarianten, 1–5 unterschiedliche Designs und benutzerdefinierte Texte verwenden können; dies muss kompatibel mit dem Mehrsprachigkeits-Anspruch (z.B. Deutsch/Englisch) und den TaxDecision-Textblöcken sein.[^11][^7]
- clared ist ein Multi-Tenant-SaaS mit potenziell dutzenden Mandanten und hunderten Nutzer:innen; Template-Verwaltung muss programmatisch, versionierbar und testbar sein (kein manuelles Hochladen pro Kunde).[^7]

### Template-Strategie mit Takumi/pdfcn

- pdfcn bietet fertige Invoice-/Report-Komponenten und Themes, die per shadcn CLI ins Projekt kopiert werden; diese Komponenten lassen sich dann im clared-Monorepo (z.B. in `packages/pdf-templates`) als **Source of Truth** für PDF-Layouts verwalten.[^18][^5][^17]
- Mandanten-spezifische Anpassung kann über Konfigurationen laufen: z.B. Tabellen `tenant_templates` (Logo-URL, Primär-/Sekundärfarben, Standard-Sprache, LayoutVarianten) und Mappings, welche React-Komponenten/Props pro Mandant verwendet werden.[^5][^11][^7]
- AI/LLM-Tools können neue Template-Varianten in JSX erstellen oder existierende Komponenten (z.B. Header-/Footer-Blöcke, Tabellenlayouts) modifizieren, ohne separate HTML-Template-Engines oder String-basierte Templating-Systeme; dadurch bleiben Layouts eng an das bestehende React/Designsystem gekoppelt.[^20][^21][^3]

### Vergleich mit HTML/Gotenberg-Templates

- HTML-Templates (für Gotenberg) sind prinzipiell ebenso AI-fähig (LLMs können HTML+CSS generieren); der Workflow ist aber stärker String-basiert und verweist eher auf klassische Template-Engines (z.B. Handlebars) mit Platzhaltern und Branch-Logik.[^22][^23][^29]
- Multi-Tenant-Varianten (verschiedene Layouts, Farben, Logos) sind mit HTML ebenfalls möglich, aber die kombinatorische Komplexität erhöht sich schnell (viele Dateien, `if/else`-blöcke, Template-Vererbung); React-Komponenten mit Props und bedingten Subkomponenten sind hier strukturierter.[^29][^22][^5]
- Da clared bereits einen React-/shadcn-basierten UI-Stack nutzt, ist die Wiederverwendbarkeit von Layoutideen und Tokens (Spacing, Colors, Typografie) in einer JSX-basierten PDF-Engine höher als in einer HTML-only-Pipeline.[^6][^7][^17]


## Risiken und Limitierungen von Takumi/pdfcn

### Reifegrad, Ökosystem und Maintenance

- pdfcn ist ein vergleichsweise junges Projekt (Launch 2026), mit Fokus auf eine begrenzte, aber hochwertige Palette an Komponenten (Invoices, Reports, grundlegende Dokument-Bausteine); für sehr komplexe Anwendungsfälle (z.B. Charts, erweiterte Formulare) sind u.U. zusätzliche Eigenentwicklungen erforderlich.[^3][^20][^5]
- Takumi ist aktiv in Entwicklung; Release-Historie und Issues zeigen regelmäßige Verbesserungen (z.B. Export-Splitting nach Import/Require-Bedingungen, Bugfixes bei CSS-Einheiten) – was einerseits positiv für Weiterentwicklung, andererseits ein Risiko für Breaking Changes ist, wenn Versionen nicht bewusst gepinnt werden.[^38][^39][^40]
- Das Ökosystem (Beispiele, Tutorials, Third-Party-Tools) ist kleiner als bei etablierten Bibliotheken wie react-pdf oder PDFKit; clared müsste gewisse Pionierarbeit bei Patterns und Testing leisten.

### CSS-Support vs. Chromium

- Takumi-pdf unterstützt einen definierten Teil von CSS; einige visuelle Effekte (z.B. Filter, komplexe Shadows, bestimmte Layoutregeln) werden nicht oder nur approximiert gerendert; Chrome/Gotenberg bietet hier naturgemäß einen höheren Grad an CSS-Komplettheit.[^23][^24][^15]
- Für clared bedeutet das: PDF-Layouts sollten bewusst auf robuste CSS-Funktionalität beschränkt werden und nicht versuchen, jeden Effekt aus dem Tauri-Frontend 1:1 zu spiegeln; ein kontrollierter Designsystem-Ausschnitt (z.B. starke Typografie, klare Tabellen, keine komplexen Blurs) ist sinnvoll.[^15][^6]

### React-only und Architektur-Flexibilität

- pdfcn ist React-only; wenn clared zukünftig eine Nicht-React-Frontendvariante (oder rein serverseitige Renderer ohne React) einführen würde, müsste entweder ein separater React-basierten Rendering-Service weiterbetrieben werden oder eine alternative PDF-Engine ergänzt werden.[^20][^5]
- Im aktuellen clared-Kontext (Tauri/React) ist dies kein Problem, sollte aber bei langfristigen Roadmap-Entscheidungen (z.B. neue Plattformen) berücksichtigt werden.[^7]


## Empfehlung für clared und Migrationshinweise

### Kurzfristige Empfehlung (v1)

- Für clared v1 ist Takumi + pdfcn eine sehr geeignete Engine-Kombination:  
  - Sie ist stark auf React/Tauri-Stacks ausgerichtet und kompatibel mit dem bestehenden Designsystem;  
  - Sie ist ressourcen- und kosteneffizient im Betrieb auf einem selbst gehosteten Coolify-Cluster;  
  - Sie unterstützt AI-/LLM-gestützte Template-Generierung, Multi-Tenant-Layouts und schnelle Iteration;  
  - Sie verhindert nicht die spätere Einführung eines E-Invoicing-Layers (ZUGFeRD/Factur-X/XRechnung), der unabhängig vom Renderer aufgebaut wird.[^2][^4][^8][^10][^3][^5][^6][^7]

### Mittelfristige Empfehlung (E-Invoicing-Fähigkeit)

- Für E-Invoicing-Compliance ist eine separate XML- und PDF/A‑3-Embedding-Pipeline aufzubauen; empfohlen wird:  
  - Ein E-Invoicing-Modul, das InvoiceModel + TaxDecision in CII/XRechnung-XML transformiert;  
  - Eine PDF-Postprocessing-Komponente (z.B. via PDFlib oder webPDF), die das Takumi/pdfcn-PDF in PDF/A‑3 konvertiert und die XML-Datei als Anhang einbettet;  
  - Ein Validierungsprozess (z.B. via Facturwise-Validator), der generierte E-Rechnungen gegen EN‑16931 prüft.[^35][^27][^10][^37]
- Diese Pipeline lässt sich unabhängig von der gewählten PDF-Engine realisieren und kann daher zunächst parallel zur Migration von Gotenberg auf Takumi/pdfcn konzipiert werden.

### Migrationsleitlinien von Gotenberg auf Takumi/pdfcn

- **Schritt 1:** Einführung eines dedizierten `pdf-templates`-Packages (z.B. in `packages/pdf-templates`) mit pdfcn/Takumi-basierten Invoice-Komponenten; paralleler Betrieb neben der bestehenden Gotenberg-Pipeline ist möglich.[^18][^17][^7]
- **Schritt 2:** Aufbau eines `InvoicePdfService` in NestJS, der Invoice/TaxDecision-Daten lädt und via Takumi/pdfcn PDF-Bytes generiert; zunächst kann dieser Service auf Entwicklungs-/Staging-Umgebungen laufen, während Gotenberg in Produktion verbleibt.[^4][^13][^6]
- **Schritt 3:** Einführung eines Feature-Toggles pro Mandant oder global, der bestimmt, ob PDFs via Gotenberg oder via Takumi/pdfcn erzeugt werden; so können schrittweise Tests und Rollouts erfolgen.  
- **Schritt 4:** Nach Stabilisierung (Monitoring der Renderzeiten, Fehlerquoten, Template-Abdeckung) kann Gotenberg aus der Produktion entfernt und durch Takumi/pdfcn als primäre Engine ersetzt werden; Gotenberg kann bei Bedarf als Fallback-Service für spezielle, sehr komplexe Layouts behalten werden.[^24][^6]
- **Schritt 5:** Parallel dazu kann eine separate E-Invoicing-Pipeline (XML + PDF/A‑3-Embedding) konzipiert und getestet werden, zunächst losgelöst vom konkreten Renderer, um spätere Umstellungen zu vereinfachen.[^28][^31][^10]


## Fazit

Takumi + pdfcn stellen für clared eine moderne, leistungsfähige und kosteneffiziente Alternative zur bisher geplanten Gotenberg/Chromium-Pipeline dar, insbesondere im Kontext eines React-/Tauri-basierten Desktop-Clients, eines selbst gehosteten Coolify-Backends und eines AI-gestützten Entwicklungsworkflows.[^2][^3][^5][^20][^6][^7]
E-Invoicing-Anforderungen (ZUGFeRD/Factur-X, XRechnung, EN‑16931) erfordern unabhängig vom PDF-Renderer eine zusätzliche XML- und PDF/A‑3-Embedding-Architektur; diese kann auf Takumi/pdfcn ebenso aufbauen wie auf Gotenberg und sollte als eigener Layer mit klarer Verantwortlichkeit entworfen werden.[^8][^9][^10][^35]

---

## References

1. [Nein. Das sollte an Fragen reichen.
Erstelle nun erneut mit allen Infos ein Dokument als .md Datei welches ALLES was wir besprochen haben beeinhaltet also eine Art PRD.Mache diese so detailiert und ausführlich wie möglich. Bedenke: Das Tool heißt clared
Und zusätzlich die Rule‑Engine‑Architektur für clared skizzieren](https://www.perplexity.ai/search/1eb00c42-87c0-4209-a65d-c333688b4acf) - clared ist ein self-hosted B2B-Dokument- und Invoicing-System für international nutzbare, regelbasie...

2. [pdfcn renders your PDF invoice in 26 ms with no Chrome](https://botmonster.com/web-dev/pdfcn-pdf-components-for-react/) - pdfcn PDF components for React copy into your codebase like shadcn, render invoices in 26 ms with no...

3. [pdfcn Review: React PDF Components for AI Coding Tools](https://ainovatools.com/tools/pdfcn) - Explore pdfcn, a free MIT-licensed React PDF component library with shadcn/ui install, themes, block...

4. [kane50613/takumi: Render OG images and paged PDFs ...](https://github.com/kane50613/takumi) - Render OG images and paged PDFs from JSX, HTML, and CSS. No headless browser. Takumi renders images ...

5. [pdfcn - Open Source Alternatives](https://www.opensourcealternatives.to/item/pdfcn) - Generate polished, accessible PDF documents in React using copy-paste components built on Takumi and...

6. [ROADMAP.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44885987/adc956d4-7981-4bc0-91d3-f1f04d52c0c6/ROADMAP.md) - Clared ships as a stunning Tauri desktop app whose core loop is create invoice see live tax get PDF ...

7. [PROJECT.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44885987/aabb980d-23c2-4624-8973-ef9579f27f7b/PROJECT.md) - Clared is a commercial SaaS desktop app macOS and Windows that lets subscribed operators create B2B ...

8. [ZUGFeRD/Factur-X](https://www.ferd-net.de/standards/zugferd) - ZUGFeRD ist ein kostenfrei verfügbares, branchenübergreifendes Datenformat für den elektronischen Re...

9. [Factur-X EN](https://fnfe-mpe.org/factur-x/factur-x_en/) - Factur-X is a Franco-German standard for hybrid e-invoice (PDF for users and XML data for process au...

10. [The ZUGFeRD and Factur-X Formats for electronic Invoices - PDFlib](https://www.pdflib.com/pdf-knowledge-base/zugferd-and-factur-x/)

11. [REQUIREMENTS.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44885987/50e4efe1-0d1a-4335-801a-c8254c932ef9/REQUIREMENTS.md) - Defined 2026-08-19 Core Value Beautiful interactive invoice live-tax PDF loop on the desktop create ...

12. [STATE.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44885987/cf93522d-358a-462d-9bc1-96a5ec7e3164/STATE.md) - --- gsdstateversion 1.0 milestone v1.0 currentphase 04.5 currentphasename Repository Reliability, Pe...

13. [Introduction - Takumi](https://takumi.kane.tw/docs/pdf) - Render JSX to paged, selectable-text PDF with takumi-pdf.

14. [takumi-pdf - A CDN for npm and GitHub](https://www.jsdelivr.com/package/npm/takumi-pdf) - A free, fast, and reliable CDN for takumi-pdf. Render paged PDFs from JSX, HTML, and CSS. No headles...

15. [Comparison - Takumi](https://takumi.kane.tw/docs/pdf/comparison) - takumi-pdf against Puppeteer and react-pdf, measured.

16. [Introduction | pdfcn](https://www.pdfcn.dev/docs) - Copy-paste PDF components for React. Built on Takumi and Forme, works with the shadcn CLI.

17. [pdfcn: Copy-paste PDF Components Built on Takumi and Forme](https://next.jqueryscript.net/shadcn-ui/pdf-components-takumi-and-forme/) - Build invoices, reports, forms, tables, charts, and branded PDFs in React with copy-paste pdfcn comp...

18. [README.md - shadcn-labs/pdfcn · GitHub](https://download.plaud.ai/shadcn-labs/pdfcn/blob/main/README.md) - Beautiful pdf components, built on Takumi and Forme. 100% Free, Zero config, one command setup. - sh...

19. [pdfcn — UI Components & Libraries | Hidden Gems Library](https://vibing.inc/library/pdfcn-vg-2089) - shadcn-distributed React components for generating PDFs: page headers, key-value blocks, tables, foo...

20. [pdfcn – Open-Source Shadcn PDF Components for React](https://allshadcn.com/components/pdfcn-beautiful-shadcn-style-pdf-components-for-react/) - pdfcn is a free, open-source PDF component library for React, built on Takumi and Forme with shadcn-...

21. [llms.txt](https://www.pdfcn.dev/llms.txt)

22. [From HTML Templates to Well-Formatted PDFs](https://medium.com/@mprasad96/from-html-templates-to-well-formatted-pdfs-using-puppeteer-and-nestjs-1263bdff641c) - Use case

23. [Convert HTML to PDF](https://gotenberg.dev/docs/convert-with-chromium/convert-html-to-pdf) - Converts an index.html file (and optional assets) to PDF using Headless Chromium. Reference addition...

24. [Generating PDFs from HTML using Gotenberg: A practical ...](https://medium.com/@annabi.medamine/generating-pdfs-from-html-using-gotenberg-a-practical-integration-story-d1792080c00b) - In modern web platforms — whether it’s e-commerce, admin portals, or content management systems — th...

25. [PDF Generation with PDFKit: Invoices, Reports, and Certificates](https://ecosire.com/blog/pdfkit-invoice-generation-guide) - Generate professional PDFs with PDFKit in Node.js. Covers invoice templates, tables, headers, footer...

26. [Microservices - Generating PDF with Node.js & PDFKit](https://community.sap.com/t5/technology-blog-posts-by-sap/microservices-generating-pdf-with-node-js-pdfkit/ba-p/13513444) - Overview Portable Document Format (PDF) is one of the most common document formats used for electron...

27. [ZUGFeRD Invoices: PDF/A‑3, CII XML, and XMP Metadata ...](https://ax.docentric.com/zugferd-e-invoices-compliance-explained/) - This article explains what ZUGFeRD is, what components it requires, and how it relates to UBL, XRech...

28. [ZUGFeRD & Factur-X — PDF/A-3 E-Invoicing with webPDF](https://docs.webpdf.de/docs/server/pdfa/zugferd/) - Embed ZUGFeRD and Factur-X XML invoice data in PDF/A-3 with webPDF. Supports ZUGFeRD 1.0, ZUGFeRD 2....

29. [🧾 How to Generate a PDF in a NestJS Project Using Handlebars and AWS S3](https://medium.com/@truptidwagh/how-to-generate-a-pdf-in-a-nestjs-project-using-handlebars-and-aws-s3-8c5f95a2b96a) - If you’re working on a backend project and want to generate a PDF document (like a proposal, invoice...

30. [ZUGFeRD/Factur-X](https://www.ferd-net.de/en/standards/zugferd/factur-x)

31. [Factur-X/ZUGFeRD - GitHub Pages](https://gflohr.github.io/e-invoice-eu/en/docs/e-invoice-formats/factur-x-zugferd/) - Factur-X/ZUGFeRD invoices are special PDF documents with machine-readable invoice information attach...

32. [Factur-X vs XRechnung: Which Format for Germany and France?](https://www.invoicenavigator.eu/compare/factur-x-vs-xrechnung) - Factur-X is a hybrid PDF+XML format for France and Germany. XRechnung is pure XML for Germany. Both ...

33. [Compliance Alert – Release of hybrid invoice formats ZUGFeRD 2.3.3 and Factur-X 1.0.7](https://pageroab.zendesk.com/hc/en-us/articles/27324118329746-Compliance-Alert-Release-of-hybrid-invoice-formats-ZUGFeRD-2-3-3-and-Factur-X-1-0-7) - Update: Compliance Alert – Release of hybrid invoice formats ZUGFeRD 2.3.3 and Factur-X 1.0.7 Date: ...

34. [Neue Version: ZUGFeRD 2.3 und Factur-X 1.0.07 für E- ...](https://blog.seeburger.com/de/frankreich-und-deutschland-veroeffentlichen-ihre-neue-version-des-gemeinsamen-standards-fuer-die-elektronische-rechnungsstellung-zugferd-2-3-und-factur-x-1-0-07-von-ferd-und-fnfe-mpe/) - Die PDF-Datei liefert die lesbare, visuelle Darstellung der Rechnung, während die XML-Datei die stru...

35. [XRechnung vs ZUGFeRD 2026: Differences & Which to Use](https://norman.finance/de/en/blog/xrechnung-zugferd-germany) - XRechnung or ZUGFeRD – what's the difference? Which format does your GmbH or freelance business need...

36. [GitHub - atgp/factur-x: PHP library to manage your Factur-X / ZUGFeRD 2.0 PDF invoices files](https://github.com/atgp/factur-x) - PHP library to manage your Factur-X / ZUGFeRD 2.0 PDF invoices files - atgp/factur-x

37. [Free ZUGFeRD, Factur-X & XRechnung Validator - Facturwise](https://www.facturwise.com/en/validate) - Upload a PDF or XML invoice and instantly check ZUGFeRD, Factur-X or XRechnung compliance against EN...

38. [Split package export types per import/require condition (#795) · kane50613/takumi@9604fd7](https://github.com/kane50613/takumi/commit/9604fd7) - Render OG images and paged PDFs from JSX, HTML, and CSS. No headless browser. Runs on Node.js, Cloud...

39. [Issues · kane50613/takumi](https://github.com/kane50613/takumi/issues) - Render OG images and paged PDFs from JSX, HTML, and CSS. No headless browser. Runs on Node.js, Cloud...

40. [Releases · kane50613/takumi](https://github.com/kane50613/takumi/releases) - Render OG images and paged PDFs from JSX, HTML, and CSS. No headless browser. Runs on Node.js, Cloud...

