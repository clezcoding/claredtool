# Clared Tax Engine – Architektur & AI-Kodier-Contract

Dieses Dokument beschreibt die technische Architektur der Steuer-Engine von Clared sowie den expliziten Kontrakt, der für AI-unterstütztes Coding optimiert ist.

## 1. Kern-Konzepte

- **TransactionFacts**: strukturierte Fakten über eine einzelne Transaktion (Rechnung), die der Engine übergeben werden.
- **TaxRule**: deklarative Regel, wie sie im JSON-Schema beschrieben ist (siehe separates DSL-Schema).
- **TaxDecision**: Ergebnis einer Regel-Evaluation (Ort der Leistung, Steuersatz, Reverse-Charge, Textbausteine, Audit-Informationen).
- **RuleStore**: persistente Ablage aller TaxRules inkl. Versionen und Quellen.
- **ExecutionEngine**: stateless Service, der Facts + Rules zu Decisions verarbeitet.

## 2. TransactionFacts-Schema (Konzeptuell)

Ein TransactionFacts-Objekt enthält mindestens:

- supplier_entity_id
- customer_entity_id
- supplier_country (ISO)
- customer_country (ISO)
- supplier_is_business
- customer_is_business
- supplier_vat_registered
- customer_vat_registered
- supplier_vat_id (UID, TRN etc.)
- customer_vat_id
- supply_type (service, digital_service, goods, property, special)
- channel (direct, marketplace, saas_subscription)
- transaction_date
- amount
- currency

Der Engine-Contract muss als Interfaces/Types explizit definiert werden, sodass AI in Cursor daraus direkt Typen, DTOs und Validierungslogik generieren kann.

## 3. TaxDecision-Schema (Konzeptuell)

Ein TaxDecision-Objekt enthält mindestens:

- place_of_supply_country
- tax_liability_party (supplier/customer)
- invoice_tax_rate
- invoice_tax_shown
- reverse_charge_flag
- legal_reference
- invoice_text_block_id
- applied_rule_id
- applied_rule_version
- source_citation (Liste von Links/IDs)
- audit_trace (z.B. Liste der geprüften Rules und deren Match-Status)

Zusätzlich können berechnete Beträge (tax_amount, net_amount, gross_amount) aufgenommen werden.

## 4. RuleStore

Der RuleStore kann:

- als SQL-Tabelle mit JSON-Feldern (conditions/effect) umgesetzt werden,
- oder als dateibasierte Konfiguration (YAML/JSON) mit Versionierung.

Wichtige Eigenschaften:

- Versionierung pro Regel (rule_id + version).
- Gültigkeitszeiträume (effective_from/effective_to).
- Referenzen auf offizielle Quellen (source_citation).
- Möglichkeit zum Hot-Reload oder Deploy von neuen Regelsets.

## 5. ExecutionEngine

Die ExecutionEngine folgt einem klaren Ablauf:

1. **Input**: TransactionFacts.
2. **Rule-Fetch**: Laden aller potentiell relevanten TaxRules aus dem RuleStore (z.B. gefiltert nach supplier_country, customer_country, supply_type, Datum).
3. **Evaluation**: Für jede TaxRule werden die Conditions gegen die Facts evaluiert (z.B. via generischem Matcher, der JSON-Bedingungen versteht).
4. **Selection**: Auswahl der passenden Regel(n) nach Priorität; typischerweise eine Hauptregel. Kollisionslogik wird explizit im PRD beschrieben.
5. **Decision**: Erzeugen des TaxDecision-Objekts basierend auf der Effektdefinition der ausgewählten Regel.
6. **Audit**: Speichern eines Audit-Trace (welche Regeln wurden geprüft, welche wurden gematcht, welche verworfen).

Die Engine ist stateless, d.h. jede Evaluation ist unabhängig und reproduzierbar. Dadurch lassen sich deterministische Tests schreiben.

## 6. Tests & Qualitätssicherung

Für AI-unterstütztes Coding sind Tests besonders wichtig:

- **Determinismus-Tests**: Für jede wichtige Regelklasse werden Testcases definiert (TransactionFacts + erwartete TaxDecision). AI kann diese Cases direkt aus der Decision-Matrix generieren.
- **Regression-Tests**: Bei Änderungen an Rules werden bestehende Testcases erneut ausgeführt, um sicherzustellen, dass keine unerwünschten Änderungen auftreten.
- **Explainability-Tests**: Sicherstellen, dass audit_trace und legal_reference korrekt befüllt sind, sodass die UI später eine verständliche Erklärung anzeigen kann.

## 7. AI-Kodier-Contract

Damit AI (z.B. Cursor) effizient helfen kann, werden folgende Punkte explizit festgelegt:

- Alle Schemas (TransactionFacts, TaxRule, TaxDecision) sind als Typsystem (TypeScript-Interfaces oder Rust-Structs) sauber definiert.
- Die JSON-Schema-Datei für TaxRule dient als Single Source of Truth; AI generiert daraus Typen und Validierungslogik.
- Die Decision-Matrix in Markdown dient als human-readable und AI-readable Spezifikation für Testfälle und Rule-Implementierung.
- Ein klar definierter Modul-Schnitt (z.B. taxEngine.evaluate(facts): decision) wird im Code festgelegt und im PRD dokumentiert.

## 8. Erweiterbarkeit

Die Architektur ist darauf ausgelegt, weitere Jurisdiktionen hinzuzufügen:

- Neue Rule-Module pro Land/Region (z.B. CH, UK, weitere GCC-Staaten) können als zusätzliche TaxRules im RuleStore ergänzt werden.
- Spezielle Branchenregeln (z.B. für E-Commerce, OnlyFans, Agenturmodell) können über zusätzliche Tags und spezialisierte Bedingungen abgebildet werden.

Durch die Trennung von Content (Rules) und Engine (Evaluierung) bleibt Clared langfristig wartbar und AI-freundlich.
