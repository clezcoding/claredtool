# Clared

Clared ist eine **kostenpflichtige SaaS-Desktop-App** für globale B2B-Rechnungsstellung mit integrierter Steuer-Engine. Backend, Authentik, Postgres und Redis laufen auf dem Coolify-Cluster des Anbieters — nicht beim Kunden, nicht Open Source, nicht kostenlos. Abonnenten verwalten ihre Gesellschaften, Kunden und Rechnungen und erhalten deterministische Steuerentscheidungen für grenzüberschreitende Umsätze.

## Language

**Entity**:
Eine rechtliche Organisationseinheit, die der Nutzer in Clared verwaltet — Gesellschaft, Holding, Zweigniederlassung, Einzelunternehmen oder vergleichbare Einheit mit steuerlicher Identität (Land, USt-IdNr./TRN, Unternehmerstatus). Eine Entity kann Rechnungen ausstellen, empfangen oder nur zur Strukturabbildung existieren (z. B. Holding ohne eigene Faktura). Clared modelliert Entities so breit und detailliert wie möglich: jede Einheit, für die Steuer-, Rechts- oder Rechnungskontext relevant ist, ist eine Entity.
_Avoid_: Gesellschaft (als Synonym — nur wenn der Kontext eindeutig eine einzelne Rechtsperson meint), Firma, Unternehmen, seller, Mandant

**Kunde**:
Die Gegenpartei auf einer Rechnung — Empfänger der Leistung und des Zahlungsanspruchs. Kann Unternehmen (B2B) oder Privatperson (B2C) sein. Derselbe Begriff wie „Mandant" in der Buchhaltungssprache; in Clared heißt es immer Kunde.
_Avoid_: Mandant, Client, buyer, account, customer (im UI und in Fachtexten — im Code und in der Tax-Engine siehe Rollenbegriffe)

**Rechnung**:
Das Geschäftsdokument mit Rechnungsnummer, Datum, **Positionen**, Beträgen und Steuerausweis — inklusive des gerenderten PDF. Eine Rechnung verbindet genau eine ausstellende Entity mit genau einem Kunden. Steuerliche Bewertung erfolgt **pro Position** über die Tax-Engine; Ergebnisse werden an der Rechnung gespeichert und ausgewiesen.
_Avoid_: Invoice (im UI und in Fachtexten), Bill, Beleg, transaction

**TransactionFacts**:
Der technische Snapshot der steuerrelevanten Fakten einer Rechnung zum Zeitpunkt der Engine-Evaluation (Länder, B2B/B2C-Flags, Leistungsart, Betrag, Datum usw.). Kein Nutzerbegriff — Entwickler- und Engine-Vokabular. Aus einer Rechnung abgeleitet, an die Tax-Engine übergeben.
_Avoid_: Rechnung (als Eingabeformat der Engine), Facts, Payload

**TaxDecision**:
Das Ergebnis der Tax-Engine-Evaluation zu einem TransactionFacts-Snapshot: Ort der Leistung, Steuerschuldner, Satz, Reverse-Charge, Rechtsreferenz, Textbaustein-ID. Primär **pro Position** — jede Position kann eine eigene TaxDecision haben; die Rechnung fasst Positionen und deren Steuerergebnisse zusammen. Wird persistiert und für PDF sowie Audit genutzt.
_Avoid_: Steuerergebnis (ungenau), tax result, calculation

**Position**:
Eine einzelne Zeile auf einer Rechnung: Bezeichnung, Menge, Einzelpreis und Nettobetrag. Eine Rechnung besteht aus einer oder mehreren Positionen. Jede Position trägt ihre eigene **Leistungsart** und erhält eine eigene **TaxDecision**.
_Avoid_: Line item, Posten, invoice item, Zeile

**Leistungsart**:
Die steuerliche Kategorie einer **Position** — z. B. Dienstleistung, digitale Leistung, Ware, Immobilie, Sonderfall. Gilt **pro Position**, nicht pro ganzer Rechnung. Bestimmt, welche TaxRules für diese Position greifen.
_Avoid_: supply type (in UI und Fachtexten), Leistungstyp, Produktkategorie

**Textbaustein**:
Ein vordefinierter Rechtstext für die Rechnung (z. B. Reverse-Charge-Hinweis). Die Tax-Engine wählt den passenden Textbaustein automatisch. Der Nutzer kann optional anpassen oder ersetzen; eine Anpassung ist ein **Lernfeedback** für die Engine.
_Avoid_: invoice text block (in UI und Fachtexten), Rechtstext, Disclaimer, Fußnote

**Lernfeedback**:
Eine bewusste Nutzerkorrektur an einer Engine-Empfehlung — z. B. Textbaustein geändert, Leistungsart korrigiert, Steuerentscheidung überschrieben. Clared erfasst die Abweichung, damit die Tax-Engine daraus lernt und künftige Empfehlungen verbessert. Kontinuierliches Lernen ist Kernverhalten, kein optionales Feature.
_Avoid_: Override, manuelles Tuning, Feedback-Button

## Rollen auf einer Rechnung

Auf einer konkreten Rechnung nimmt die ausstellende **Entity** die Rolle **Lieferant** (Tax-Engine: `supplier`) ein; der **Kunde** die Rolle **Leistungsempfänger** (Tax-Engine: `customer`). Rollen sind kontextabhängig — dieselbe Entity kann auf einer anderen Rechnung Kunde sein, wenn eine andere Entity an sie fakturiert.

**Lieferant**:
Die Entity, die auf einer Rechnung Leistung erbringt und den Zahlungsanspruch geltend macht.
_Avoid_: supplier (in UI und Fachtexten), seller, Aussteller

**Leistungsempfänger**:
Der Kunde, der auf einer Rechnung die Leistung bezieht und ggf. Steuerschuldner ist (Reverse Charge).
_Avoid_: customer (in UI und Fachtexten), buyer, Empfänger
