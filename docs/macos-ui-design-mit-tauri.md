# UI- und UX-Leitfaden für macOS-Apps mit Tauri

> Vollständige Zusammenfassung der wichtigsten macOS-Designprinzipien und ihrer praktischen Umsetzung mit Tauri 2.

## Inhaltsverzeichnis

1. [Zielbild](#1-zielbild)
2. [Grundprinzipien guter macOS-Oberflächen](#2-grundprinzipien-guter-macos-oberflächen)
3. [Informationsarchitektur und Navigation](#3-informationsarchitektur-und-navigation)
4. [Native macOS-Struktur](#4-native-macos-struktur)
5. [Fensterverhalten](#5-fensterverhalten)
6. [Menüleiste und Befehle](#6-menüleiste-und-befehle)
7. [Tastaturbedienung](#7-tastaturbedienung)
8. [Maus, Trackpad und Drag-and-drop](#8-maus-trackpad-und-drag-and-drop)
9. [Layout, Abstände und responsive Fenster](#9-layout-abstände-und-responsive-fenster)
10. [Typografie](#10-typografie)
11. [Farben, Symbole und Materialien](#11-farben-symbole-und-materialien)
12. [Bedienelemente und Interaktionen](#12-bedienelemente-und-interaktionen)
13. [Feedback, Status und Fehler](#13-feedback-status-und-fehler)
14. [Animation und Bewegung](#14-animation-und-bewegung)
15. [Barrierefreiheit](#15-barrierefreiheit)
16. [Personalisierung und Einstellungen](#16-personalisierung-und-einstellungen)
17. [Performance und wahrgenommene Qualität](#17-performance-und-wahrgenommene-qualität)
18. [Tauri-Architektur](#18-tauri-architektur)
19. [Tauri-Funktionen für eine native Mac-Erfahrung](#19-tauri-funktionen-für-eine-native-mac-erfahrung)
20. [Empfohlene Web-UI-Basis](#20-empfohlene-web-ui-basis)
21. [Komponenten-Checkliste](#21-komponenten-checkliste)
22. [Häufige Fehler](#22-häufige-fehler)
23. [Abnahme-Checkliste](#23-abnahme-checkliste)
24. [Quellen](#24-quellen)

---

## 1. Zielbild

Eine gute macOS-App fühlt sich wie ein flexibles Desktop-Werkzeug an:

- vertraut und vorhersehbar
- präzise mit Maus und Trackpad bedienbar
- vollständig mit der Tastatur nutzbar
- an verschiedene Fenstergrößen anpassbar
- schnell und unmittelbar
- barrierefrei
- visuell ruhig und inhaltlich fokussiert
- sinnvoll in macOS integriert

Eine Tauri-App verwendet für ihre Oberfläche Webtechnologien, läuft auf macOS aber in einem nativen Anwendungsfenster. Daraus ergeben sich zwei Gestaltungsebenen:

1. **Web-UI:** Layout, Komponenten, Formulare, Typografie, Fokussteuerung und Animationen.
2. **Native Tauri-Hülle:** Fenster, Menüleiste, Dateidialoge, Betriebssystemintegration und App-Lebenszyklus.

Die zentrale Leitidee lautet:

> Die Inhalte dürfen mit Webtechnologien gebaut sein. Fenster, Menüleiste, Dialoge, Tastatursteuerung und Dateiverhalten sollten sich trotzdem wie macOS anfühlen.

---

## 2. Grundprinzipien guter macOS-Oberflächen

### 2.1 Zweck

Jedes Element muss einen erkennbaren Zweck erfüllen. Funktionen, Texte und visuelle Effekte verbrauchen Aufmerksamkeit. Was keinen ausreichenden Nutzen bietet, sollte nicht Teil der Oberfläche sein.

### 2.2 Kontrolle und Fehlertoleranz

Menschen sollen jederzeit verstehen, was passiert, und ihre Entscheidungen korrigieren können.

- Rückgängig machen ermöglichen
- laufende Vorgänge abbrechbar gestalten
- Zustände sichtbar machen
- irreversible Aktionen klar kennzeichnen
- Bestätigungsdialoge nur für tatsächlich riskante Vorgänge verwenden

### 2.3 Vertrautheit

Bekannte macOS-Muster reduzieren Lernaufwand:

- vertraute Symbole und Begriffe
- standardmäßige Positionen und Reihenfolgen
- erwartbare Tastaturkürzel
- konsistente Fenster- und Menülogik
- gleiche Darstellung für gleiches Verhalten

### 2.4 Flexibilität

Mac-Apps werden häufig über längere Zeit, mit mehreren Fenstern, Displays und Eingabemethoden verwendet. Eine gute Oberfläche unterstützt unterschiedliche Arbeitsweisen.

### 2.5 Einfachheit

Einfachheit bedeutet nicht, möglichst wenig anzuzeigen. Sie bedeutet, den häufigsten Weg klar zu machen und fortgeschrittene Möglichkeiten sinnvoll einzuordnen.

### 2.6 Sorgfalt

Kleine Details beeinflussen das Vertrauen in die gesamte App:

- saubere Ausrichtung
- konsistente Abstände
- gut gewählte Texte
- klare Zustände
- flüssiges Scrollen
- korrekte Hell-/Dunkel-Darstellung
- stabile Layouts bei Größenänderungen

### 2.7 Zugänglichkeit

Barrierefreiheit ist keine nachträgliche Ergänzung, sondern Teil der Komponenten- und Informationsarchitektur.

### 2.8 Zurückhaltende Freude

„Delight“ entsteht vor allem durch Schnelligkeit, Verlässlichkeit und gute Details. Dekorative Animationen, Konfetti oder starke Glaseffekte ersetzen keine gute Bedienung.

---

## 3. Informationsarchitektur und Navigation

Jede Ansicht sollte vier Fragen beantworten:

1. Wo bin ich?
2. Was kann ich hier tun?
3. Wohin kann ich als Nächstes gehen?
4. Wie komme ich zurück oder heraus?

### Empfehlungen

- Hauptbereiche klar benennen.
- Häufige Funktionen sichtbar halten.
- Fortgeschrittene Funktionen schrittweise offenlegen.
- Wichtige Informationen früh in der Leserichtung platzieren.
- Zusammengehörige Elemente durch Nähe und Ausrichtung verbinden.
- Navigation und Inhaltsaktionen visuell unterscheiden.
- Auswahlzustände eindeutig anzeigen.
- Leere Bereiche mit hilfreichen nächsten Schritten versehen.

### Geeignete Navigationsmuster

- **Sidebar:** Hauptbereiche, Sammlungen oder Quellen.
- **Toolbar:** häufige Aktionen für das aktuelle Fenster oder Dokument.
- **Inspector:** Eigenschaften des ausgewählten Objekts.
- **Tabs:** parallele Ansichten innerhalb eines klar begrenzten Kontexts.
- **Breadcrumbs oder Pfadanzeige:** bei hierarchischen Inhalten.
- **Suche:** bei größeren Informationsmengen, möglichst mit `⌘F` erreichbar.

### Vermeiden

- mobile Bottom Navigation
- Hamburger-Menüs als Hauptnavigation in großen Fenstern
- tiefe Verschachtelungen ohne Pfad- oder Zurück-Navigation
- unklare Sammelbegriffe wie „Home“ oder „Mehr“, wenn konkrete Namen möglich sind
- Modaldialoge als primäre Navigation

---

## 4. Native macOS-Struktur

Typische Bestandteile einer Mac-App sind:

- Anwendungsmenü in der systemweiten Menüleiste
- Fenster mit nativen Schließen-, Minimieren- und Vollbildschaltflächen
- Toolbar
- Sidebar
- Inhaltsbereich
- optionaler Inspector
- Settings-Fenster
- native Öffnen-, Speichern- und Druckdialoge
- Kontextmenüs

Nicht jede App benötigt alle Bestandteile. Die Struktur soll aus dem Arbeitsablauf entstehen.

### Native Komponenten bevorzugen, wo das Betriebssystem beteiligt ist

Mit Tauri bedeutet „nativ“ vor allem:

- Fensterverhalten über Tauri
- Menüleiste über die Tauri Menu API
- Datei- und Ordnerauswahl über das Dialog Plugin
- externe Dateien und URLs über das Opener Plugin
- Benachrichtigungen über das Notification Plugin
- Fensterzustand über das Window-State Plugin

Die eigentlichen Inhaltskomponenten werden weiterhin als HTML/CSS/JavaScript umgesetzt.

---

## 5. Fensterverhalten

Eine Mac-App muss bei verschiedenen Fenstergrößen stabil bleiben.

### Anforderungen

- sinnvolle Standardgröße
- sinnvolle Mindestbreite und Mindesthöhe
- freie Größenänderung
- Vollbild-Unterstützung
- korrekte Darstellung auf mehreren Displays
- Anpassung an unterschiedliche Auflösungen und Skalierungen
- Wiederherstellung von Größe und Position
- kein Verlust wichtiger Funktionen in kleinen Fenstern
- sinnvolle aktive und inaktive Fensterzustände

### Mehrfenster-Unterstützung

Mehrere Fenster sind sinnvoll, wenn Menschen:

- Dokumente parallel bearbeiten
- Inhalte vergleichen
- unterschiedliche Arbeitskontexte trennen
- einen Inspector oder eine Vorschau unabhängig positionieren müssen

Mehrere Fenster sollten nicht allein aus optischen Gründen verwendet werden.

### Titelleiste

Eine vollständig selbst gebaute Titelleiste kann native Funktionen verlieren. Für Tauri ist daher folgende Reihenfolge empfehlenswert:

1. native Fensterdekoration verwenden
2. bei Bedarf eine transparente native Titelleiste einsetzen
3. nur bei zwingendem Grund eine vollständig eigene Titelleiste bauen

Die macOS-„Traffic Lights“ sollten nicht künstlich nachgebaut werden. Bei einer eigenen Drag-Region muss außerdem klar definiert sein, welche Flächen das Fenster bewegen und welche interaktiv sind.

---

## 6. Menüleiste und Befehle

Die Menüleiste ist ein zentraler Bestandteil einer Mac-App. Sie dient nicht nur als alternative Navigation, sondern als vollständiges Verzeichnis der verfügbaren Befehle.

### Typische Menüs

- **App-Name:** Über, Einstellungen, Dienste, Ausblenden, Beenden
- **Ablage:** Neu, Öffnen, Schließen, Speichern, Exportieren
- **Bearbeiten:** Rückgängig, Wiederholen, Ausschneiden, Kopieren, Einfügen, Suchen
- **Darstellung:** Sidebar, Inspector, Zoom, Vollbild
- **Fenster:** Minimieren, Zoom, Fensterwechsel
- **Hilfe:** Hilfe, Dokumentation, Support

Nicht benötigte Menüs oder Einträge sollten weggelassen werden.

### Regeln

- Menüeinträge konkret benennen.
- Aktuell nicht verfügbare Befehle deaktivieren.
- Zustände mit Checkmarks darstellen, wenn ein Menüpunkt etwas ein- oder ausschaltet.
- App-Befehle mit passenden Tastenkürzeln versehen.
- Standardbefehle nicht mit anderer Bedeutung wiederverwenden.
- Menüaktionen, Toolbar-Aktionen und Kontextmenüs an dieselbe Befehlslogik anbinden.
- Eine Ellipse verwenden, wenn zunächst weitere Angaben benötigt werden, beispielsweise „Exportieren …“.

### Tauri

Tauri 2 kann native Menüs sowohl aus JavaScript als auch aus Rust erstellen. Unter macOS werden mehrstufige Menüs in der systemweiten Menüleiste dargestellt. Die obersten Einträge müssen als Submenus organisiert werden.

---

## 7. Tastaturbedienung

Eine Desktop-App sollte für häufige Arbeitsabläufe ohne Maus nutzbar sein.

### Standardkürzel respektieren

- `⌘C` – Kopieren
- `⌘V` – Einfügen
- `⌘X` – Ausschneiden
- `⌘Z` – Rückgängig
- `⇧⌘Z` – Wiederholen
- `⌘A` – Alles auswählen
- `⌘S` – Speichern
- `⇧⌘S` – Speichern unter
- `⌘O` – Öffnen
- `⌘F` – Suchen
- `⌘,` – Einstellungen
- `⌘W` – Fenster schließen
- `⌘Q` – App beenden

### Interaktionsregeln

- `Tab` bewegt den Fokus logisch vorwärts.
- `Shift+Tab` bewegt ihn rückwärts.
- `Enter` löst die primäre Aktion aus, wenn passend.
- `Space` aktiviert fokussierte Schaltflächen und Kontrollfelder.
- `Escape` bricht einen Vorgang ab oder schließt eine temporäre Ebene.
- Pfeiltasten navigieren innerhalb von Listen, Menüs und Auswahlgruppen.
- Der Tastaturfokus muss sichtbar sein.
- Nach dem Schließen eines Dialogs kehrt der Fokus sinnvoll zurück.

### Tauri-spezifische Aufteilung

- normale Komponenteninteraktionen: Frontend-Events und semantisches HTML
- App-Befehle: native Menüeinträge mit Accelerators
- systemweite Kürzel: Global-Shortcut Plugin, nur wenn die App auch im Hintergrund reagieren muss

Globale Shortcuts sollten sparsam verwendet werden, da sie mit anderen Apps kollidieren können.

---

## 8. Maus, Trackpad und Drag-and-drop

macOS-Nutzer erwarten präzise Zeigerinteraktionen.

### Anforderungen

- erkennbare Hover-Zustände
- Tooltips für unbeschriftete Symbole
- passende Cursorformen
- Rechtsklick-Kontextmenüs
- Mehrfachauswahl, wenn fachlich sinnvoll
- Drag-and-drop mit sichtbarem Zielzustand
- klare Drop-Zonen
- Auswahl darf beim Kontextmenü nicht überraschend verloren gehen
- Gesten nur als zusätzliche Abkürzung verwenden

### Direkte Manipulation

Beim Ziehen soll ein Element:

- dem Zeiger unmittelbar folgen
- nicht unerwartet an eine andere Position springen
- an Grenzen verständlichen Widerstand oder klare Begrenzung zeigen
- beim Loslassen nachvollziehbar landen
- während einer Bewegung erneut greifbar bleiben

### Zielgrößen

Als Orientierung empfiehlt Apple für macOS eine Standardgröße von ungefähr `28 × 28 pt` für Bedienelemente. `20 × 20 pt` gilt als Untergrenze und sollte nur in begründeten, dichten Oberflächen verwendet werden.

---

## 9. Layout, Abstände und responsive Fenster

### Hierarchie

Hierarchie entsteht durch:

- Position
- Abstand
- Größe
- Gewicht
- Kontrast
- Gruppierung
- Ausrichtung

Nicht jede Hierarchiestufe braucht eine zusätzliche Fläche oder Karte.

### Responsive Desktop-Layouts

Anders als auf mobilen Geräten wird eine Mac-Oberfläche kontinuierlich skaliert. Definiere daher nicht nur wenige Breakpoints, sondern robuste Größenbereiche.

Mögliche Anpassungen:

- Sidebar ein- und ausblendbar machen
- Inspector bei wenig Platz einklappen
- Toolbar-Aktionen in ein Overflow-Menü verschieben
- mehrspaltige Ansichten in eine Spalte überführen
- Beschriftungen verkürzen, ohne Bedeutung zu verlieren
- sekundäre Details schrittweise ausblenden

### Abstände

Ein kleines, konsistentes System ist besser als viele Einzelwerte. Beispiel:

- 4 px – Mikroabstand
- 8 px – eng verbundene Elemente
- 12 px – Control-Gruppen
- 16 px – normale Abschnitte
- 24 px – größere Gruppen
- 32 px – Hauptbereiche

Die konkreten Werte dürfen abweichen. Entscheidend ist die Konsistenz.

---

## 10. Typografie

### Grundregeln

- Systemschrift bevorzugen.
- Wenige Schriftgrößen und Schriftschnitte verwenden.
- Hierarchie aus Größe, Gewicht, Farbe und Zeilenhöhe gemeinsam bilden.
- Dünne Schriftschnitte bei kleinen Größen vermeiden.
- Lange Texte nicht unnötig breit setzen.
- Abschneiden von Text möglichst vermeiden.
- Lokalisierung und längere Übersetzungen berücksichtigen.

### macOS-Richtwerte

- normale UI-Schrift häufig etwa 13 pt
- 10 pt als Untergrenze, nicht als bevorzugte Standardgröße
- größere Überschriften enger setzen
- Fließtext mit komfortabler Zeilenhöhe versehen

macOS unterstützt nicht dasselbe Dynamic-Type-System wie iOS. Die Oberfläche sollte größere benutzerdefinierte Schriftgrößen trotzdem verkraften.

### CSS-Grundlage

```css
:root {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Text",
    system-ui,
    sans-serif;
}
```

---

## 11. Farben, Symbole und Materialien

### Farben

- semantische Rollen definieren: Hintergrund, Fläche, Text, Sekundärtext, Akzent, Warnung, Fehler, Erfolg
- Light Mode und Dark Mode unterstützen
- erhöhten Kontrast berücksichtigen
- nicht ausschließlich mit Farbe kommunizieren
- Akzentfarben für Aktionen und Auswahlzustände verwenden, nicht als Dekoration überall verteilen

### Symbole

- bekannte Metaphern verwenden
- Symbolstil konsistent halten
- nicht zu viele unterschiedliche Icon-Sets mischen
- unklare Symbole beschriften oder mit Tooltip versehen
- Icons nicht als Ersatz für verständliche Begriffe missbrauchen

SF Symbols können nicht automatisch wie eine normale Webfont vorausgesetzt werden. Für eine Tauri-Web-UI ist ein konsistentes, rechtlich passendes SVG-Icon-Set oder eine gezielte native Integration erforderlich.

### Transparenz und Materialien

Transparente Materialien können Hierarchie erzeugen, sollten aber nicht die Lesbarkeit beeinträchtigen.

- Material hauptsächlich für Navigation und schwebende Steuerungsebenen einsetzen.
- Große Inhaltsflächen ruhig halten.
- Kontrast auf wechselnden Hintergründen prüfen.
- keine mehrfach gestapelten hellen Glasflächen verwenden.
- reduzierte Transparenz unterstützen.
- Effekte nicht als Ersatz für räumliche Struktur verwenden.

---

## 12. Bedienelemente und Interaktionen

### Allgemeine Regeln

- gleiche Darstellung bedeutet gleiches Verhalten
- unmittelbares Feedback beim Drücken
- eindeutige Hover-, Active-, Focus-, Selected- und Disabled-Zustände
- Steuerung nahe am beeinflussten Inhalt
- verständliche, konkrete Beschriftungen
- Standardkomponenten bevorzugen, wenn sie die Anforderungen erfüllen

### Schaltflächen

- primäre Aktion klar erkennen lassen
- nicht mehrere gleich starke primäre Aktionen nebeneinander platzieren
- Verben als Beschriftung verwenden
- zerstörerische Aktionen eindeutig kennzeichnen
- reine Icon-Buttons mit zugänglichem Namen und Tooltip versehen

### Formulare

- sichtbare Labels verwenden
- erwartetes Format erklären
- inline und möglichst früh validieren
- eingegebene Daten bei Fehlern nicht verlieren
- Fehlermeldung direkt am Feld darstellen
- Submit nicht grundlos deaktivieren, wenn dadurch der Fehler unsichtbar bleibt

### Auswahl und Tabellen

- Auswahlzustand muss auch ohne Farbe erkennbar sein
- Mehrfachauswahl und deren Modifikatortasten konsistent unterstützen
- Spalten sinnvoll ausrichten
- Sortierung sichtbar machen
- Kontextaktionen auf die aktuelle Auswahl beziehen
- bei großen Datenmengen Suche und Filter anbieten

---

## 13. Feedback, Status und Fehler

Feedback lässt sich in vier Kategorien einteilen:

1. Status
2. Abschluss
3. Warnung
4. Fehler

### Status

- laufende Vorgänge sichtbar machen
- bei längeren Vorgängen Fortschritt oder Aktivität zeigen
- Hintergrundprozesse nicht unnötig modal darstellen
- Abbrechen anbieten, wenn technisch und fachlich sinnvoll

### Abschluss

- kleine, eindeutige Änderungen müssen nicht mit einem Dialog bestätigt werden
- wichtige Abschlüsse kurz und klar bestätigen
- nach Möglichkeit den neuen Zustand selbst als Bestätigung nutzen

### Warnungen

- nur vor einem realen Risiko warnen
- Folgen verständlich erklären
- sichere Alternative anbieten
- Standardschaltfläche bewusst wählen

### Fehler

Eine gute Fehlermeldung erklärt:

1. was nicht funktioniert hat
2. welche Auswirkung das hat
3. wie das Problem behoben oder umgangen werden kann

Technische Details gehören nur dann in die Hauptmeldung, wenn sie der Zielgruppe helfen. Andernfalls können sie in einem aufklappbaren Detailbereich angeboten werden.

### Rückgängig statt Bestätigung

Bei leicht umkehrbaren Aktionen ist ein Undo-Muster häufig besser als ein Bestätigungsdialog. Bestätigungsdialoge sollten für irreversible oder besonders folgenreiche Aktionen reserviert bleiben.

---

## 14. Animation und Bewegung

### Zweck

Animation soll:

- Ursache und Wirkung verbinden
- räumliche Beziehungen erklären
- Zustandswechsel verständlich machen
- unmittelbares Feedback geben

### Prinzipien

- Eingaben sofort beantworten.
- Bewegung am aktuellen sichtbaren Zustand beginnen.
- Animationen unterbrechbar halten.
- Ein- und Austritt räumlich konsistent gestalten.
- Bewegte Elemente am Auslöser verankern.
- Momentum nur bei tatsächlich impulsartigen Gesten verwenden.
- unnötiges Überschwingen vermeiden.

### Geeignete Dauer

Kurze UI-Übergänge sollten meist schnell und zurückhaltend sein. Eine feste Dauer ist weniger wichtig als das Gefühl unmittelbarer Reaktion. Bewegungen dürfen die Arbeit nicht verzögern.

### Reduzierte Bewegung

Bei `prefers-reduced-motion: reduce`:

- große Verschiebungen durch kurze Überblendungen ersetzen
- Parallax- und Federbewegungen deaktivieren
- Schleifen und dekorative Bewegung vermeiden
- notwendiges Zustandsfeedback beibehalten

---

## 15. Barrierefreiheit

Eine zugängliche Oberfläche ist:

- **intuitiv:** vertraute und konsistente Interaktionen
- **wahrnehmbar:** Bedeutung nicht nur über eine Darstellungsform
- **anpassbar:** Unterstützung verschiedener Eingabe- und Ausgabemethoden

### Semantisches HTML

- `<button>` statt klickbarer `<div>`
- `<a>` für Navigation und externe Ziele
- `<label>` für Formulareingaben
- `<nav>`, `<main>`, `<aside>` und `<header>` für Regionen
- echte Überschriften in logischer Reihenfolge
- `<dialog>` oder ein vollständig zugängliches Dialogmuster

ARIA ergänzt HTML, ersetzt aber keine korrekten nativen Elemente.

### Tastatur und Fokus

- alle Kernfunktionen ohne Maus erreichbar
- sichtbarer Fokus
- logische Fokusreihenfolge
- Fokusfalle nur in echten modalen Dialogen
- Fokus nach Schließen an den Auslöser zurückgeben
- keine positiven `tabindex`-Werte

### VoiceOver

- verständliche zugängliche Namen
- Zustand und Rolle von Controls erkennbar
- dynamische Statusmeldungen bei Bedarf über Live Regions
- dekorative Bilder vor Screenreadern verbergen
- sinnvolle Alternativtexte für informative Bilder

### Visuelle Zugänglichkeit

- ausreichender Kontrast
- Informationen nicht nur über Farbe
- größere Schriften und Zoom verkraften
- reduzierte Transparenz unterstützen
- wichtige Inhalte nicht zeitgesteuert verschwinden lassen

### Testen

- VoiceOver
- vollständige Tastaturbedienung
- macOS Full Keyboard Access
- Light Mode und Dark Mode
- erhöhter Kontrast
- reduzierte Bewegung
- reduzierte Transparenz
- Browser-Zoom beziehungsweise größere App-Schrift

---

## 16. Personalisierung und Einstellungen

Mac-Nutzer erwarten bei produktiven Apps häufig eine gewisse Anpassbarkeit.

Mögliche Optionen:

- Sidebar ein- und ausblenden
- Toolbar konfigurieren
- Inspector-Position oder Sichtbarkeit merken
- Schriftgröße einstellen
- Standardordner wählen
- Tastaturkürzel anpassen, wenn die App komplex ist
- Verhalten beim Start festlegen
- Darstellung oder Farbschema wählen

Einstellungen sollten nach Themen gruppiert und über `⌘,` erreichbar sein. Änderungen sollten möglichst unmittelbar sichtbar werden.

---

## 17. Performance und wahrgenommene Qualität

Eine schöne Oberfläche wirkt schlecht, wenn sie verzögert reagiert.

### Prioritäten

- schneller App-Start
- unmittelbares Feedback auf Eingaben
- flüssiges Scrollen
- keine unnötigen Layout-Sprünge
- große Listen virtualisieren
- schwere Arbeit nicht im UI-Thread ausführen
- optimistische Updates nur mit sauberem Fehler-Rollback
- Ladezustände stabil dimensionieren
- Fenster erst anzeigen, wenn der initiale Zustand bereit ist, falls sonst sichtbares Flackern entsteht

### Tauri-spezifisch

- rechenintensive oder systemnahe Arbeit gegebenenfalls in Rust ausführen
- zwischen Frontend und Rust nur notwendige Daten übertragen
- Commands klar begrenzen
- lange Rust-Operationen asynchron gestalten
- große Payloads und häufige Event-Kaskaden vermeiden

---

## 18. Tauri-Architektur

### Ebene 1: Web-Frontend

Verantwortlich für:

- Informationsarchitektur
- Layout
- Sidebar, Toolbar und Inspector-Inhalte
- Formulare
- lokale Komponenteninteraktion
- Fokussteuerung
- Screenreader-Semantik
- visuelle Zustände
- responsive Fensterlayouts
- Animationen

Das verwendete Framework ist zweitrangig. React, Vue, Svelte, Solid oder Vanilla JavaScript können dieselben Qualitätsziele erreichen.

### Ebene 2: Tauri JavaScript APIs und Plugins

Verantwortlich für:

- Fenstersteuerung
- native Menüs
- Dialoge
- Datei- und URL-Öffnung
- Benachrichtigungen
- Zwischenablage
- Fensterzustand
- Updates
- Betriebssysteminformationen

### Ebene 3: Rust

Verantwortlich für:

- vertrauenswürdige Systemzugriffe
- Dateiverarbeitung
- rechenintensive Aufgaben
- sichere Speicherung
- eigene native Integrationen
- Geschäftslogik, die nicht im WebView liegen soll

### Sicherheitsprinzip

Nur tatsächlich benötigte Tauri-Berechtigungen freigeben. Tauri 2 blockiert potenziell gefährliche Plugin-Funktionen standardmäßig und verwendet Capabilities beziehungsweise Permissions zur Freigabe.

---

## 19. Tauri-Funktionen für eine native Mac-Erfahrung

| Aufgabe | Empfohlene Umsetzung |
|---|---|
| Layout und Komponenten | HTML/CSS und Frontend-Framework |
| Semantik und Barrierefreiheit | HTML, ARIA und Fokussteuerung |
| macOS-Menüleiste | Tauri Menu API |
| Fenstersteuerung | Tauri Window API |
| Fensterposition und -größe merken | Window-State Plugin |
| Öffnen- und Speichern-Dialoge | Dialog Plugin |
| Dateien und URLs extern öffnen | Opener Plugin |
| App-Benachrichtigungen | Notification Plugin |
| systemweite Shortcuts | Global-Shortcut Plugin |
| persistente Einstellungen | Store Plugin oder eigene Rust-Lösung |
| sichere Geheimnisse | Stronghold oder Plattform-Keychain-Integration |
| App-Updates | Updater Plugin |
| Einmalige App-Instanz | Single-Instance Plugin |
| eigene Betriebssystemfunktionen | Rust Commands oder eigenes Plugin |

### 19.1 Fensterzustand

Das offizielle Window-State Plugin kann Fenstergröße und -position wiederherstellen. Um sichtbares Springen beim Start zu vermeiden, kann das Fenster zunächst unsichtbar erstellt und nach der Wiederherstellung angezeigt werden.

### 19.2 Native Dialoge

Das Dialog Plugin sollte für folgende Vorgänge verwendet werden:

- Datei öffnen
- mehrere Dateien auswählen
- Ordner wählen
- Speicherort bestimmen
- systemnahe Warn- und Bestätigungsdialoge

Ein HTML-Datei-Upload wirkt für klassische Desktop-Dateiverarbeitung oft unpassend.

### 19.3 Menüleiste

Menüeinträge können aus JavaScript oder Rust angelegt werden. Alle Oberflächenzugänge sollten dieselbe interne Aktion verwenden, damit Menü, Shortcut, Toolbar und Kontextmenü synchron bleiben.

### 19.4 Titelleiste

Tauri unterstützt native, transparente und vollständig eigene Titelleisten. Auf macOS sollte eine vollständig eigene Titelleiste nur gewählt werden, wenn der visuelle Nutzen den Verlust nativer Funktionen rechtfertigt.

### 19.5 Plattformkonfiguration

Tauri unterstützt plattformspezifische Konfigurationsdateien wie `tauri.macos.conf.json`. Damit lassen sich macOS-spezifische Werte getrennt von Windows- und Linux-Konfigurationen verwalten.

---



### Wichtige Hinweise

- Den Fokusindikator niemals pauschal entfernen.
- Browser-Default-Stile nur ersetzen, wenn alle Zustände neu gestaltet werden.
- `color-scheme` früh definieren.
- Systemfarben oder eigene semantische Tokens verwenden.
- feste Pixelhöhen bei mehrzeiligem Text vermeiden.
- keine Interaktion ausschließlich an Hover binden.
- native HTML-Elemente als Ausgangspunkt verwenden.

---

## 20. Komponenten-Checkliste

### App-Fenster

- [ ] sinnvolle Startgröße
- [ ] Mindestgröße definiert
- [ ] frei skalierbar
- [ ] Vollbild funktioniert
- [ ] Zustand wird wiederhergestellt
- [ ] kein sichtbares Springen beim Start
- [ ] korrekte Darstellung auf mehreren Displays

### Sidebar

- [ ] klare Auswahl
- [ ] per Tastatur navigierbar
- [ ] ein- und ausblendbar, wenn sinnvoll
- [ ] Breite sinnvoll begrenzt
- [ ] lange Namen werden verständlich behandelt
- [ ] Kontextmenüs beziehen sich auf den richtigen Eintrag

### Toolbar

- [ ] nur häufige Aktionen
- [ ] klare Gruppierung
- [ ] Tooltips für reine Icons
- [ ] Disabled-Zustände sind verständlich
- [ ] Overflow bei kleinen Fenstergrößen
- [ ] Aktionen ebenfalls in der Menüleiste auffindbar

### Formulare

- [ ] sichtbare Labels
- [ ] logische Tab-Reihenfolge
- [ ] Inline-Validierung
- [ ] Fehlermeldungen mit Lösungshinweis
- [ ] Datenverlust bei Fehlern verhindert
- [ ] Enter- und Escape-Verhalten geprüft

### Dialoge

- [ ] nur für klar begrenzte Aufgaben
- [ ] Fokus bleibt im modalen Dialog
- [ ] Escape schließt oder bricht ab
- [ ] Fokus kehrt zum Auslöser zurück
- [ ] primäre und destruktive Aktion klar unterscheidbar
- [ ] native Dateidialoge für Dateivorgänge

### Listen und Tabellen

- [ ] Auswahlzustand eindeutig
- [ ] Tastaturnavigation
- [ ] Mehrfachauswahl korrekt
- [ ] Sortierung sichtbar
- [ ] große Datenmengen performant
- [ ] Leer-, Lade- und Fehlerzustand vorhanden

### Benachrichtigungen und Toasts

- [ ] nur für relevante Ereignisse
- [ ] wichtige Informationen verschwinden nicht zu schnell
- [ ] nicht als Ersatz für Inline-Fehler verwendet
- [ ] systemweite Benachrichtigung nur bei echtem Hintergrundnutzen

---

## 21. Häufige Fehler

### Designfehler

- eine mobile Oberfläche unverändert auf den Mac übertragen
- riesige Überschriften und übergroße Buttons
- Karten um jeden Inhaltsblock
- zu viele abgerundete Container
- Glassmorphism ohne funktionale Hierarchie
- schwacher Kontrast bei Sekundärtext
- nur Icons ohne Beschriftung oder Tooltip
- unklare oder generische Begriffe
- Animationen, die Arbeit verzögern

### Desktop-Fehler

- keine echte Menüleiste
- keine Tastaturkürzel
- unvollständige Tastaturnavigation
- kein sichtbarer Fokus
- starres Fensterlayout
- keine Wiederherstellung von Größe und Position
- ungeeignete Web-Dateiuploads statt nativer Dialoge
- Kontextmenüs fehlen bei objektbezogenen Aktionen

### Tauri-Fehler

- eine vollständig eigene Titelleiste ohne zwingenden Grund
- globale Shortcuts für normale App-Befehle
- unnötig breite Permissions oder Capabilities
- schwere Arbeit im Frontend-Thread
- unterschiedliche Logik für Menü, Toolbar und Shortcut
- unkontrollierte Datenübertragung zwischen WebView und Rust
- native Plugins installieren, aber ihre Berechtigungen nicht sauber begrenzen

### Accessibility-Fehler

- klickbare `<div>`-Elemente
- Fokusindikator mit `outline: none` entfernen
- positive `tabindex`-Werte
- Bedeutung nur durch Farbe vermitteln
- Dialoge ohne Fokusmanagement
- Icon-Buttons ohne zugänglichen Namen
- Animationen trotz reduzierter Bewegung
- automatisch verschwindende wichtige Meldungen

---

## 22. Abnahme-Checkliste

### Struktur und Verständlichkeit

- [ ] Der Zweck der App ist innerhalb weniger Sekunden erkennbar.
- [ ] Die wichtigste Aktion ist klar.
- [ ] Hauptnavigation und Inhaltsaktionen sind unterscheidbar.
- [ ] Jede Ansicht erklärt Ort, Möglichkeiten und Ausgang.
- [ ] Häufige Abläufe benötigen möglichst wenige Schritte.

### macOS-Integration

- [ ] Eine vollständige native Menüleiste ist vorhanden.
- [ ] Standardkürzel funktionieren erwartungsgemäß.
- [ ] Einstellungen sind über `⌘,` erreichbar.
- [ ] Dateioperationen verwenden native Dialoge.
- [ ] Fensterverhalten entspricht macOS-Erwartungen.
- [ ] Kontextmenüs sind dort verfügbar, wo sie Nutzen bieten.

### Fenster und Layout

- [ ] Layout funktioniert bei Mindest-, Standard- und großer Fenstergröße.
- [ ] Sidebar und Inspector reagieren sinnvoll auf wenig Platz.
- [ ] Inhalte werden nicht abgeschnitten.
- [ ] Fenstergröße und -position werden wiederhergestellt.
- [ ] Vollbild und mehrere Displays wurden getestet.

### Eingabe

- [ ] Alle Kernfunktionen sind per Tastatur erreichbar.
- [ ] Fokusreihenfolge ist logisch.
- [ ] Fokus ist immer sichtbar.
- [ ] Hover-, Active- und Disabled-Zustände sind vorhanden.
- [ ] Drag-and-drop zeigt erlaubte Ziele und Ergebnis klar an.

### Typografie und Darstellung

- [ ] Systemschrift oder eine begründete Alternative wird verwendet.
- [ ] Text ist auch bei längerer Nutzung gut lesbar.
- [ ] Light Mode und Dark Mode funktionieren.
- [ ] Kontrast ist ausreichend.
- [ ] Symbole sind konsistent und verständlich.
- [ ] Transparenz beeinträchtigt die Lesbarkeit nicht.

### Feedback

- [ ] Eingaben erhalten sofortige Rückmeldung.
- [ ] Laden, Leere, Erfolg und Fehler sind gestaltet.
- [ ] längere Vorgänge zeigen Status oder Fortschritt.
- [ ] destruktive Aktionen sind rückgängig oder angemessen abgesichert.
- [ ] Fehlermeldungen erklären Problem und Lösung.

### Barrierefreiheit

- [ ] semantisches HTML wird verwendet.
- [ ] VoiceOver-Test wurde durchgeführt.
- [ ] Full Keyboard Access wurde getestet.
- [ ] Bedeutung hängt nicht nur von Farbe ab.
- [ ] reduzierte Bewegung wird respektiert.
- [ ] reduzierte Transparenz wird respektiert.
- [ ] größere Schrift beziehungsweise Zoom bricht das Layout nicht.

### Tauri und Sicherheit

- [ ] nur benötigte Plugins sind installiert.
- [ ] Capabilities sind minimal definiert.
- [ ] Systemzugriffe liegen in klar begrenzten Commands.
- [ ] Menü, Toolbar und Shortcuts verwenden dieselbe Befehlslogik.
- [ ] Fensterzustand wird zuverlässig gespeichert.
- [ ] Fehler zwischen Frontend und Rust werden verständlich behandelt.
- [ ] Updates und Signierung sind für die Distribution eingeplant.

### Abschlussfrage

> Ist die Oberfläche verständlich, vorhersehbar, tastaturfähig, frei skalierbar, barrierefrei und in wenigen Sekunden als echte Mac-App erkennbar?

---

## 23. Quellen

### Apple Human Interface Guidelines

- [Designing for macOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos/)
- [Design Principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Keyboards](https://developer.apple.com/design/human-interface-guidelines/keyboards/)
- [Menus](https://developer.apple.com/design/human-interface-guidelines/menus)
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

### Tauri 2

- [Window Customization](https://v2.tauri.app/learn/window-customization/)
- [Window Menu](https://v2.tauri.app/learn/window-menu/)
- [Window State Plugin](https://v2.tauri.app/plugin/window-state/)
- [Dialog Plugin](https://v2.tauri.app/plugin/dialog/)
- [Official Plugins](https://v2.tauri.app/plugin/)
- [Configuration](https://v2.tauri.app/reference/config/)

---

*Stand: 22. August 2026. Der technische Teil bezieht sich auf Tauri 2.*
