# Requirements

## REQ-desktop-client
- source: docs/clared-app-prd.md
- description: Clared is a native-like (Tauri/Electron-based) desktop app for macOS and Windows. Goal is a stunning UI, a modular tax engine, and robust compliance for global B2B revenues.
- acceptance: Desktop-Client Aufgaben: Rechnungs-UI, Entity- und Kundenverwaltung, Live-Tax-Vorschau, PDF-Erzeugung. Technologie: Tauri (Rust + Web-Frontend) oder Electron (Node.js + Web-Frontend). UI-Framework: React/TypeScript oder Vue/TypeScript.
- scope: Desktop-Client

## REQ-self-hosted-backend
- source: docs/clared-app-prd.md
- description: Desktop-App communicates with a self-hosted backend (Coolify) with database, Redis, and Authentik as Identity Provider. All server components run on the Coolify cluster.
- acceptance: Desktop-Client verbindet sich über HTTPS und OAuth2 mit dem Backend. Coolify-Services: Backend-App, Postgres, Redis, Authentik, optional Supabase.
- scope: Backend-API, Coolify

## REQ-invoice-management
- source: docs/clared-app-prd.md
- description: Create, persist, and retrieve invoices including line items.
- acceptance: POST /api/invoices erstellt neue Rechnung. GET /api/invoices/:id holt Rechnung. Tabellen: invoices, invoice_items.
- scope: Rechnungen

## REQ-entity-customer-management
- source: docs/clared-app-prd.md
- description: Entity- and customer management for companies (US LLC, EU-GmbH etc.) and customers/mandants.
- acceptance: GET /api/entities – Liste der Unternehmen (US LLC, EU-GmbH etc.). Tabellen: entities, customers. Nur owner darf Entities anlegen.
- scope: Entities, Kunden

## REQ-live-tax-evaluation
- source: docs/clared-app-prd.md
- description: Live tax preview via tax-engine evaluation of a TransactionFacts structure.
- acceptance: POST /api/tax/evaluate ruft Tax-Engine für eine TransactionFacts-Struktur. Desktop-Client Aufgabe: Live-Tax-Vorschau.
- scope: Tax-Engine

## REQ-tax-engine-modularity
- source: docs/clared-app-prd.md
- description: Modular tax engine as separate service/module. Uses concepts from clared-tax-rule-matrix.md, clared-tax-rule-dsl-schema.json, and clared-tax-engine-architecture.md.
- acceptance: Tax-Engine is a Library with clear interfaces (evaluate(facts): decision). Start: integrated in backend as module `tax-engine`. Later extractable as microservice with POST /tax/evaluate, GET /tax/rules. Für den Start reicht Variante 1 (integriert).
- scope: Tax-Engine

## REQ-authentik-sso-rbac
- source: docs/clared-app-prd.md
- description: Authentik as self-hosted Identity Provider for user management, SSO, MFA, roles and permissions.
- acceptance: Authentik as OIDC Provider. Backend as OAuth2 Client. Redirect URIs: https://clared-backend.yourdomain.com/auth/callback. Scopes: openid profile email. Flow: Desktop-App opens Browser-Window or embedded WebView for login; user authenticates against Authentik; Authentik returns ID-Token/Access-Token; Backend validates token and creates Session/API-Key. Roles: owner, accountant, viewer. Nur owner darf Entities anlegen. accountant darf Rechnungen sehen und exportieren.
- scope: Authentik, Auth/SSO

## REQ-offline-capability
- source: docs/clared-app-prd.md
- description: Offline capability with local storage of recently used data and later sync.
- acceptance: Lokale Speicherung von zuletzt genutzten Daten (IndexedDB/SQLite im Client). Sync-Mechanismus mit Backend, sobald Verbindung besteht.
- scope: Desktop-Client

## REQ-pdf-generation
- source: docs/clared-app-prd.md
- description: PDF generation from invoice data using templates and TaxDecision text blocks. Multilingual templates.
- acceptance: Flow: (1) Desktop-App sendet Invoice-Daten an Backend. (2) Backend ruft Tax-Engine und erhält TaxDecision. (3) Backend rendert PDF mit Template + TaxDecision-Textbausteinen. (4) Desktop-App lädt PDF herunter und zeigt es an. Templates stored in DB or filesystem. Mehrsprachig (DE/EN etc.). Queue for PDF-Generierung and Emailversand.
- scope: PDF-Generation

## REQ-audit-and-monitoring
- source: docs/clared-app-prd.md
- description: Application logging, tax-decision audit trail, and monitoring on Coolify.
- acceptance: Application-Logs im Backend (z.B. mit Pino/Winston). AuditLogs für jede Tax-Entscheidung (persistiert in audit_logs). Monitoring über zusätzliche self-hosted Services auf Coolify (Grafana, Prometheus etc.).
- scope: Logging, Audit-Logs
