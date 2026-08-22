# Clared – Desktop-App PRD (macOS & Windows)

Dieses Dokument ergänzt die vorhandenen Tax-Engine-Dateien und beschreibt die Gesamtarchitektur von Clared als **kostenpflichtiges SaaS-Produkt**: Desktop-App plus Backend, Datenbank, Caching und Authentik — alles auf **dem Coolify-Cluster des Anbieters** (nicht Kunden-Self-Host, nicht Open Source, nicht kostenlos). Stripe/Abo-Checkout ist v2; die Plattform-Gruppe `clared-platform` gehört schon ins Token.

## 1. Produktkontext

Clared ist eine nativenartige (Tauri/Electron-basierte) Desktop-App für macOS und Windows, die über ein selbstgehostetes Backend (Coolify) mit Datenbank, Redis und Authentik als Identity Provider kommuniziert. Ziel ist eine atemberaubend schöne UI, eine modulare Tax-Engine und robuste Compliance für globale B2B-Umsätze.

## 2. Technische Gesamtarchitektur (High-Level)

### 2.1 Komponenten

- **Desktop-Client (Clared App)**
  - Technologie: Tauri (Rust + Web-Frontend) oder Electron (Node.js + Web-Frontend).
  - UI-Framework: React/TypeScript oder Vue/TypeScript.
  - Aufgaben: Rechnungs-UI, Entity- und Kundenverwaltung, Live-Tax-Vorschau, PDF-Erzeugung.

- **Backend-API (Clared Backend)**
  - Technologie: Node.js (NestJS/Express), FastAPI, oder Rust (Axum) – wählbar.
  - Aufgaben: Persistenz, Business-Logik, Delegation an Tax-Engine, Authentik-Integration.

- **Tax-Engine-Service**
  - Separate Service/Modul mit eigener Codebasis oder Teil des Backends.
  - Nutzt die in `clared-tax-rule-matrix.md`, `clared-tax-rule-dsl-schema.json` und `clared-tax-engine-architecture.md` beschriebenen Konzepte.

- **Datenbank**
  - Primär: PostgreSQL (über Coolify als Service).
  - Aufgaben: Entities, Kunden, Rechnungen, TaxRules, Audit-Logs.

- **Cache/Queue**
  - Redis (über Coolify als Service).
  - Aufgaben: Caching von TaxDecisions, Queues für PDF-Generierung, Email-Events etc.

- **Auth/SSO**
  - Authentik als selbstgehosteter Identity Provider (OIDC/OAuth2).
  - Aufgaben: Benutzerverwaltung, SSO, MFA, Rollen & Rechte.

Alle Serverkomponenten laufen auf dem Coolify-Cluster **des Anbieters**. Der Desktop-Client verbindet sich über HTTPS und OAuth2 mit diesem Backend. Kunden betreiben keinen eigenen Clared-Server.

## 3. Backend-Stack & Deployment (Coolify)

### 3.1 Backend-API-Service

- Empfohlener Stack: Node.js mit NestJS oder Express, Dockerisiert.
- Deployment: als "Application" in Coolify mit Git-Repo, Auto-Deploy und Environment-Variablen.
- Endpunkte (Beispiele):
  - `POST /api/invoices` – erstellt neue Rechnung.
  - `GET /api/invoices/:id` – holt Rechnung.
  - `POST /api/tax/evaluate` – ruft Tax-Engine für eine TransactionFacts-Struktur.
  - `GET /api/entities` – Liste deiner Unternehmen (US LLC, EU-GmbH etc.).

### 3.2 Tax-Engine-Service

Optionen:

1. **Integriert im Backend** (Module `tax-engine`):
   - Vorteil: weniger Services, einfacher Start.
   - Die Tax-Engine ist eine Library mit klaren Interfaces (`evaluate(facts): decision`).

2. **Separater Microservice**:
   - Vorteil: Skalierbarkeit, unabhängige Versionierung.
   - API: `POST /tax/evaluate`, `GET /tax/rules` etc.

Für den Start reicht Variante 1, später kann die Engine ausgekoppelt werden.

### 3.3 Datenbank (PostgreSQL auf Coolify)

- Nutzung des Coolify-Postgres-Services.
- Standard-Setup:
  - Service: `postgresql` mit persistentem Volume für Daten.
  - DB-Name: `clared`.
  - Benutzer: `clared_app`.
- Tabellen (Auszug):
  - `entities` – Gesellschaften (US LLC, EU-GmbH etc.).
  - `customers` – Kunden/Mandanten.
  - `invoices` – Rechnungen.
  - `invoice_items` – Positionen.
  - `tax_rules` – persistierte TaxRules (optional zusätzlich zur Datei-DSL).
  - `audit_logs` – Nachvollziehbarkeit von Engine-Entscheidungen.

### 3.4 Redis (Cache/Queue)

- Service: `redis` über Coolify (z.B. Template `redis:alpine`).
- Verwendung:
  - Caching von häufig genutzten TaxDecisions.
  - Queue für rechenintensive Tasks (PDF-Generierung, Emailversand).

## 4. Self-Hosted Backend-as-a-Service Optionen

Zur Beschleunigung kannst du statt eines komplett eigenen Backends auch ein selbstgehostetes BaaS verwenden:

- **Supabase (self-hosted via Coolify)**
  - Bietet: Postgres, Auth, Storage, Realtime, Edge Functions.
  - Vorteile: schnelle API-Generierung, Auth inkl. OAuth, Row-Level-Security.
  - Deployment: über Coolify-Service-Templates mit Docker-Compose.

Mögliche Architektur:

- Clared-Desktop-Client spricht direkt mit Supabase (REST/GraphQL) für CRUD (Entities, Customers, Invoices).
- Eigene Tax-Engine läuft als separater Service und wird aus Supabase-Funktionen oder vom Desktop-Client direkt angesprochen.
- Authentik kann optional als zentraler IdP dienen, während Supabase als Ressourcen-Server fungiert.

Alternativ: Du baust dein eigenes Backend und nutzt Supabase nur als Datenbank + Auth-Layer.

## 5. Auth/SSO mit Authentik

### 5.1 Authentik Deployment (Coolify)

- Service-Stack: Authentik-Server, Worker, Postgres, Redis (siehe offizielle Docker-Compose-Beispiele).
- Konfiguration:
  - `AUTHENTIK_POSTGRESQL__HOST`: Hostname des Postgres-Containers.
  - `AUTHENTIK_POSTGRESQL__USER`: `authentik`.
  - `AUTHENTIK_POSTGRESQL__PASSWORD`: Secret.
  - `AUTHENTIK_REDIS__HOST`: Redis-Container.
  - `AUTHENTIK_SECRET_KEY`: generierter Secret Key.

### 5.2 Integration mit Clared Backend

- Authentik als OIDC Provider.
- Backend fungiert als OAuth2 Client:
  - Redirect URIs: `https://clared-backend.yourdomain.com/auth/callback`.
  - Scopes: `openid profile email` etc.

- Flow:
  1. Desktop-App öffnet Browser-Window oder eingebetteten WebView für Login.
  2. Nutzer authentifiziert sich gegen Authentik.
  3. Authentik gibt ID-Token/Access-Token zurück.
  4. Backend validiert Token und erzeugt Session/API-Key für Clared.

### 5.3 Rollen & Rechte

- Authentik verwaltet User-Rollen (z.B. `owner`, `accountant`, `viewer`).
- Backend mappt Rollen auf Berechtigungen:
  - Nur `owner` darf Entities anlegen.
  - `accountant` darf Rechnungen sehen und exportieren.

## 6. Desktop-Client Architektur

### 6.1 Projektstruktur

Empfohlene Ordner:

- `apps/desktop/` – Tauri/Electron-App.
- `apps/backend/` – API + Tax-Engine.
- `packages/tax-engine/` – Shared Library für Tax-Engine-Logik.
- `packages/ui/` – Shared UI-Komponenten (Design-System).

### 6.2 Kommunikation mit Backend

- HTTP/HTTPS-Requests über REST-API.
- Optional: WebSockets für Live-Updates (z.B. Hintergrundjobs).

### 6.3 Offline-Fähigkeit

- Lokale Speicherung von zuletzt genutzten Daten (IndexedDB/SQLite im Client).
- Sync-Mechanismus mit Backend, sobald Verbindung besteht.

## 7. PDF-Generation & Templates

- PDF-Engine im Backend (Node: pdfkit, Puppeteer/Playwright mit HTML-to-PDF; Rust: printpdf etc.).
- Templates:
  - Stored in DB oder im Dateisystem.
  - Mehrsprachig (DE/EN etc.).

- Flow:
  1. Desktop-App sendet Invoice-Daten an Backend.
  2. Backend ruft Tax-Engine und erhält TaxDecision.
  3. Backend rendert PDF mit Template + TaxDecision-Textbausteinen.
  4. Desktop-App lädt PDF herunter und zeigt es an.

## 8. Logging & Monitoring

- Application-Logs im Backend (z.B. mit Pino/Winston).
- AuditLogs für jede Tax-Entscheidung (persistiert in `audit_logs`).
- Monitoring über zusätzliche self-hosted Services auf Coolify (Grafana, Prometheus etc.).

## 9. Projektstart-Checkliste

1. **Repository-Struktur anlegen**
   - `apps/desktop`, `apps/backend`, `packages/tax-engine`, `packages/ui`.

2. **Tax-Engine Library initialisieren**
   - Code aus den bestehenden Dateien (`clared-tax-rule-matrix`, `clared-tax-rule-dsl-schema`, `clared-tax-engine-architecture`) umsetzen.

3. **Backend-Skeleton erstellen**
   - Basis-API mit Routing, DB-Anbindung, Authentik/OIDC-Client.

4. **Coolify-Deploy vorbereiten** (Cluster des Anbieters)
   - Services: Backend-App, Postgres, Redis, Authentik.

5. **Desktop-App-Skeleton bauen**
   - Tauri-Projekt mit Basis-Layout und API-Client.

Damit ist Clared als kostenpflichtiges SaaS spezifiziert: Desktop-App gegen das Backend auf dem Coolify des Anbieters.
