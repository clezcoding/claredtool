# Constraints

## Desktop-Client stack
- source: docs/clared-app-prd.md
- type: nfr
- content: Technologie: Tauri (Rust + Web-Frontend) oder Electron (Node.js + Web-Frontend). UI-Framework: React/TypeScript oder Vue/TypeScript. Empfohlene Ordner: apps/desktop/ (Tauri/Electron-App), packages/ui/ (Shared UI-Komponenten / Design-System).

## Backend-API stack and Coolify deployment
- source: docs/clared-app-prd.md
- type: nfr
- content: Technologie: Node.js (NestJS/Express), FastAPI, oder Rust (Axum) – wählbar. Empfohlener Stack: Node.js mit NestJS oder Express, Dockerisiert. Deployment: als Application in Coolify mit Git-Repo, Auto-Deploy und Environment-Variablen. Empfohlene Ordner: apps/backend/ (API + Tax-Engine), packages/tax-engine/ (Shared Library).

## Backend REST API endpoints
- source: docs/clared-app-prd.md
- type: api-contract
- content: POST /api/invoices – erstellt neue Rechnung. GET /api/invoices/:id – holt Rechnung. POST /api/tax/evaluate – ruft Tax-Engine für eine TransactionFacts-Struktur. GET /api/entities – Liste der Unternehmen (US LLC, EU-GmbH etc.). Client-Kommunikation: HTTP/HTTPS REST-API. Optional: WebSockets für Live-Updates (Hintergrundjobs).

## Tax-Engine service placement
- source: docs/clared-app-prd.md
- type: protocol
- content: Option 1 integriert im Backend (Module tax-engine): weniger Services, einfacher Start; Library mit Interfaces (evaluate(facts): decision). Option 2 separater Microservice: Skalierbarkeit, unabhängige Versionierung; API POST /tax/evaluate, GET /tax/rules. Für den Start reicht Variante 1; später kann die Engine ausgekoppelt werden.

## PostgreSQL on Coolify
- source: docs/clared-app-prd.md
- type: schema
- content: Primär PostgreSQL über Coolify. Service: postgresql mit persistentem Volume. DB-Name: clared. Benutzer: clared_app. Tabellen (Auszug): entities (Gesellschaften), customers (Kunden/Mandanten), invoices (Rechnungen), invoice_items (Positionen), tax_rules (persistierte TaxRules, optional zusätzlich zur Datei-DSL), audit_logs (Nachvollziehbarkeit von Engine-Entscheidungen). Aufgaben: Entities, Kunden, Rechnungen, TaxRules, Audit-Logs.

## Redis cache and queue
- source: docs/clared-app-prd.md
- type: nfr
- content: Service redis über Coolify (z.B. Template redis:alpine). Verwendung: Caching von häufig genutzten TaxDecisions; Queue für rechenintensive Tasks (PDF-Generierung, Emailversand).

## Supabase self-hosted BaaS option
- source: docs/clared-app-prd.md
- type: nfr
- content: Alternative to a fully custom backend: Supabase (self-hosted via Coolify) offers Postgres, Auth, Storage, Realtime, Edge Functions. Mögliche Architektur: Desktop-Client spricht direkt mit Supabase (REST/GraphQL) für CRUD (Entities, Customers, Invoices); eigene Tax-Engine als separater Service, angesprochen aus Supabase-Funktionen oder vom Desktop-Client; Authentik optional als zentraler IdP, Supabase als Ressourcen-Server. Alternativ: eigenes Backend, Supabase nur als Datenbank + Auth-Layer. Deployment über Coolify-Service-Templates mit Docker-Compose.

## Authentik deployment on Coolify
- source: docs/clared-app-prd.md
- type: nfr
- content: Service-Stack: Authentik-Server, Worker, Postgres, Redis (offizielle Docker-Compose-Beispiele). Konfiguration: AUTHENTIK_POSTGRESQL__HOST (Hostname des Postgres-Containers), AUTHENTIK_POSTGRESQL__USER=authentik, AUTHENTIK_POSTGRESQL__PASSWORD=Secret, AUTHENTIK_REDIS__HOST (Redis-Container), AUTHENTIK_SECRET_KEY (generierter Secret Key).

## Authentik OIDC integration
- source: docs/clared-app-prd.md
- type: protocol
- content: Authentik as OIDC Provider. Backend as OAuth2 Client. Redirect URIs: https://clared-backend.yourdomain.com/auth/callback. Scopes: openid profile email. Flow: Desktop-App öffnet Browser-Window oder eingebetteten WebView; Nutzer authentifiziert sich gegen Authentik; Authentik gibt ID-Token/Access-Token zurück; Backend validiert Token und erzeugt Session/API-Key. Rollen: owner, accountant, viewer. Mapping: nur owner darf Entities anlegen; accountant darf Rechnungen sehen und exportieren.

## PDF generation engine
- source: docs/clared-app-prd.md
- type: nfr
- content: PDF-Engine im Backend (Node: pdfkit, Puppeteer/Playwright mit HTML-to-PDF; Rust: printpdf etc.). Templates in DB oder Dateisystem. Mehrsprachig (DE/EN etc.).

## Coolify service set
- source: docs/clared-app-prd.md
- type: nfr
- content: Alle Serverkomponenten auf Coolify-Cluster. Projektstart: Services Backend-App, Postgres, Redis, Authentik, optional Supabase. Logging/Monitoring: zusätzliche self-hosted Services auf Coolify (Grafana, Prometheus etc.).

## TransactionFacts schema
- source: docs/clared-tax-engine-architecture.md
- type: schema
- content: TransactionFacts-Objekt enthält mindestens: supplier_entity_id, customer_entity_id, supplier_country (ISO), customer_country (ISO), supplier_is_business, customer_is_business, supplier_vat_registered, customer_vat_registered, supplier_vat_id (UID, TRN etc.), customer_vat_id, supply_type (service, digital_service, goods, property, special), channel (direct, marketplace, saas_subscription), transaction_date, amount, currency. Engine-Contract muss als Interfaces/Types explizit definiert werden.

## TaxDecision schema
- source: docs/clared-tax-engine-architecture.md
- type: schema
- content: TaxDecision-Objekt enthält mindestens: place_of_supply_country, tax_liability_party (supplier/customer), invoice_tax_rate, invoice_tax_shown, reverse_charge_flag, legal_reference, invoice_text_block_id, applied_rule_id, applied_rule_version, source_citation (Liste von Links/IDs), audit_trace (z.B. Liste der geprüften Rules und deren Match-Status). Zusätzlich können berechnete Beträge (tax_amount, net_amount, gross_amount) aufgenommen werden.

## RuleStore
- source: docs/clared-tax-engine-architecture.md
- type: schema
- content: RuleStore kann als SQL-Tabelle mit JSON-Feldern (conditions/effect) umgesetzt werden, oder als dateibasierte Konfiguration (YAML/JSON) mit Versionierung. Eigenschaften: Versionierung pro Regel (rule_id + version); Gültigkeitszeiträume (effective_from/effective_to); Referenzen auf offizielle Quellen (source_citation); Möglichkeit zum Hot-Reload oder Deploy von neuen Regelsets.

## ExecutionEngine flow
- source: docs/clared-tax-engine-architecture.md
- type: protocol
- content: Ablauf: (1) Input: TransactionFacts. (2) Rule-Fetch: Laden aller potentiell relevanten TaxRules aus dem RuleStore (z.B. gefiltert nach supplier_country, customer_country, supply_type, Datum). (3) Evaluation: Für jede TaxRule werden die Conditions gegen die Facts evaluiert (z.B. via generischem Matcher, der JSON-Bedingungen versteht). (4) Selection: Auswahl der passenden Regel(n) nach Priorität; typischerweise eine Hauptregel. Kollisionslogik wird explizit im PRD beschrieben. (5) Decision: Erzeugen des TaxDecision-Objekts basierend auf der Effektdefinition der ausgewählten Regel. (6) Audit: Speichern eines Audit-Trace (welche Regeln wurden geprüft, welche wurden gematcht, welche verworfen). Engine is stateless: jede Evaluation unabhängig und reproduzierbar. Modul-Schnitt: taxEngine.evaluate(facts): decision.

## Tax-engine tests and quality
- source: docs/clared-tax-engine-architecture.md
- type: nfr
- content: Determinismus-Tests: Für jede wichtige Regelklasse Testcases (TransactionFacts + erwartete TaxDecision); AI kann diese Cases direkt aus der Decision-Matrix generieren. Regression-Tests: Bei Änderungen an Rules bestehende Testcases erneut ausführen. Explainability-Tests: audit_trace und legal_reference korrekt befüllt, sodass die UI später eine verständliche Erklärung anzeigen kann.

## AI-Kodier-Contract
- source: docs/clared-tax-engine-architecture.md
- type: protocol
- content: Alle Schemas (TransactionFacts, TaxRule, TaxDecision) als Typsystem (TypeScript-Interfaces oder Rust-Structs) sauber definiert. Die JSON-Schema-Datei für TaxRule dient als Single Source of Truth; AI generiert daraus Typen und Validierungslogik. Die Decision-Matrix in Markdown dient als human-readable und AI-readable Spezifikation für Testfälle und Rule-Implementierung. Ein klar definierter Modul-Schnitt (z.B. taxEngine.evaluate(facts): decision) wird im Code festgelegt und im PRD dokumentiert.

## Tax-engine extensibility
- source: docs/clared-tax-engine-architecture.md
- type: nfr
- content: Neue Rule-Module pro Land/Region (z.B. CH, UK, weitere GCC-Staaten) als zusätzliche TaxRules im RuleStore. Spezielle Branchenregeln (z.B. für E-Commerce, OnlyFans, Agenturmodell) über zusätzliche Tags und spezialisierte Bedingungen. Trennung von Content (Rules) und Engine (Evaluierung).

## VAT/USt decision-matrix column schema
- source: docs/clared-tax-rule-matrix.md
- type: schema
- content: Spalten: id (eindeutige Kennung der Regel/Archetyp); supplier_region (Region/Land des leistenden Unternehmers, z.B. EU, EU:AT, US, UAE); customer_region (Region/Land des Leistungsempfängers); supplier_is_business (Bool); customer_is_business (Bool, B2B vs B2C); supplier_vat_registered (Bool); customer_vat_registered (Bool, UID/TRN o.ä.); supply_type (service, digital_service, goods, property, special); place_of_supply_region (resultierende Jurisdiktion); tax_liability_party (supplier oder customer / Reverse Charge); invoice_tax_rate (Steuersatz auf der Rechnung, numerisch z.B. 0, 20, 5); invoice_tax_shown (Bool); reverse_charge_flag (Bool); legal_reference (Text/IDs für Rechtsnormen); invoice_text_block_id (ID des Textbausteins). Matrix ist nicht abschließend; Regelklassen, Länder später über spezifische Rule-Module verfeinert.

## VAT/USt decision-matrix rule classes
- source: docs/clared-tax-rule-matrix.md
- type: schema
- content: Regelklassen (id → place_of_supply_region, tax_liability_party, invoice_tax_rate, invoice_tax_shown, reverse_charge_flag, invoice_text_block_id): EU_DOMESTIC_B2B_SERVICE → EU:MS_A, supplier, local_rate, true, false, EU_DOMESTIC_SERVICE_STANDARD; EU_DOMESTIC_B2C_SERVICE → EU:MS_A, supplier, local_rate, true, false, EU_DOMESTIC_SERVICE_B2C; EU_INTRACOMM_B2B_SERVICE → EU:MS_B, customer, 0, false, true, EU_RC_B2B_SERVICE; EU_INTRACOMM_B2C_DIGITAL → EU:MS_B, supplier, local_rate_B, true, false, EU_DIGITAL_B2C; EU_EXPORT_SERVICE_TO_THIRD → THIRD_COUNTRY, supplier, 0_or_export, false_or_true, false_or_true, EU_EXPORT_SERVICE_B2B; EU_EXPORT_GOODS_TO_THIRD → EU:MS_A_OR_THIRD, supplier, 0_or_export, false_or_true, false_or_true, EU_EXPORT_GOODS_B2B; THIRD_TO_EU_B2B_SERVICE → EU:MS_B, customer, 0, false, true, EU_RC_IMPORT_SERVICE_B2B; THIRD_TO_EU_B2C_DIGITAL → EU:MS_B, supplier, local_rate_B, true, false, EU_DIGITAL_IMPORT_B2C; US_TO_EU_B2B_SERVICE → EU:MS_B, customer, 0, false, true, EU_RC_US_TO_EU_B2B; US_TO_EU_B2C_DIGITAL → EU:MS_B, supplier, local_rate_B, true, false, EU_DIGITAL_US_TO_EU_B2C; EU_TO_US_B2B_SERVICE → US, supplier_or_customer, 0_or_local, true_or_false, false_or_true, US_B2B_SERVICE_FROM_EU; EU_TO_US_B2C_DIGITAL → US, supplier, US_sales_tax, true, false, US_B2C_DIGITAL_FROM_EU; UAE_TO_EU_B2B_SERVICE → EU:MS_B, customer, 0, false, true, EU_RC_UAE_TO_EU_B2B; UAE_TO_EU_B2B_DIGITAL → EU:MS_B, customer, 0, false, true, EU_RC_UAE_TO_EU_DIGITAL_B2B; UAE_TO_EU_B2C_DIGITAL → EU:MS_B, supplier, local_rate_B, true, false, EU_DIGITAL_UAE_TO_EU_B2C; EU_TO_UAE_B2B_SERVICE → UAE, customer, 5, false, true, UAE_RC_IMPORT_SERVICE_B2B; EU_TO_UAE_B2B_DIGITAL → UAE, customer, 5, false, true, UAE_RC_IMPORT_DIGITAL_B2B; EU_TO_UAE_B2C_DIGITAL → UAE, supplier, 5, true, false, UAE_DIGITAL_EU_TO_UAE_B2C; EU_TO_EU_B2B_GOODS_INTRACOMM → EU:MS_B, customer, 0, false, true, EU_RC_INTRACOMM_GOODS_B2B; EU_TO_EU_B2C_GOODS_INTRACOMM → EU:MS_B_OR_MS_A, supplier, local_rate_B_or_A, true, false, EU_DISTANT_SELLING_GOODS_B2C; DOMESTIC_SPECIAL_PROPERTY → PROPERTY_LOCATION, supplier, local_rate, true, false, EU_PROPERTY_SPECIAL; DOMESTIC_SPECIAL_EVENT → EVENT_LOCATION, supplier, local_rate, true, false, EU_EVENT_SPECIAL; THIRD_TO_THIRD_B2B_SERVICE → depends_on_local, supplier_or_customer, local_or_0, true_or_false, false_or_true, THIRD_TO_THIRD_GENERIC_B2B.

## Clared Tax Rule JSON Schema
- source: docs/clared-tax-rule-dsl-schema.json
- type: schema
- content: JSON Schema draft/2020-12. title: Clared Tax Rule. type: object. additionalProperties: false. required: rule_id, version, conditions, effect. properties: rule_id (string); version (string); jurisdiction_scope (array of string); description (string); conditions (object, additionalProperties true) with supplier_country, customer_country, supplier_is_business, customer_is_business, supplier_vat_registered, customer_vat_registered, supply_type, channel, effective_from (date|null), effective_to (date|null), threshold_amount, threshold_currency; effect (object) required place_of_supply_country, tax_liability_party with place_of_supply_country (string), tax_liability_party (enum supplier|customer), invoice_tax_rate, invoice_tax_shown, reverse_charge_flag, legal_reference, invoice_text_block_id, additional_outputs (object); priority (integer); source_citation (array of string); tags (array of string).
