# Auftrag: VTM Studio bauen (produktionsreife Web-App)

Baue die interne SaaS-Redaktionsplattform **VTM Studio** für das VersicherungsTech Magazin (VTM) als lauffähige Web-Anwendung. Die Plattform verwandelt hochgeladene Autorentexte automatisiert in publikationsreife Ghost-CMS-Artikel-Drafts im VTM-Design und erzeugt LinkedIn-Posts samt Beitragsbild im Corporate Design.

Arbeite meilensteinweise (M1 bis M5, unten definiert). Erstelle zuerst einen kurzen Umsetzungsplan pro Meilenstein, dann implementiere.

## Arbeitsumgebung: Claude Code Web auf diesem GitHub-Repo

- Du arbeitest in der Cloud-Sandbox von Claude Code Web direkt auf diesem Repository. **Pro Meilenstein ein Branch (`m1-fundament`, `m2-pipeline`, ...) und ein Pull Request** mit aussagekräftiger Beschreibung (was gebaut, wie getestet, was offen). Ein Meilenstein gilt als fertig, wenn die CI auf dem PR grün ist.
- **Kein Docker in der Sandbox voraussetzen.** Alles, was du in der Sandbox ausführst (Build, Lint, Typecheck, Unit-Tests), muss ohne Container laufen. Integrationstests, die Postgres oder Ghost brauchen, laufen ausschließlich in GitHub Actions (siehe unten) und werden lokal per Env-Flag übersprungen.
- Richte in M1 einen **GitHub-Actions-Workflow** ein: Job 1 `check` (install, lint, typecheck, build, Unit-Tests) bei jedem Push/PR; Job 2 `integration` mit Service-Containern `postgres:16` und `ghost:5-alpine` für die Prisma- und Ghost-Integrationstests.
- **Secrets niemals ins Repo.** Es existiert nur `.env.example` mit Platzhaltern und Kommentaren. Echte Keys setzt der Betreiber später beim Deployment beziehungsweise als GitHub-Actions-Secrets; die Integrationstests gegen den Ghost-Service-Container provisionieren sich ihre Zugangsdaten selbst (frische Instanz über den Setup-Endpoint initialisieren, Integration samt Admin API Key programmatisch anlegen) und benötigen keine echten Secrets.

## Beigelegte Referenzen (im Projektordner vorhanden)

- **`design/`** – entpackter Claude-Design-Prototyp. Er definiert Look, Layout, Screens und Komponenten verbindlich: Pipeline-Kanban, Artikel-Upload mit Verarbeitungs-Stepper, Artikel-Review (Dreispalt: Outline, Live-Preview mit Web/Outlook-Toggle, Prüf-Panel), Ghost-Publish-Modal, LinkedIn Studio mit Bild-Generator, Sponsored-Freigabe, Einstellungen. Übernimm das Designsystem exakt (Farben, Typografie, Abstände); portiere die Komponenten sauber in die Zielarchitektur statt den Prototyp-Code blind zu kopieren.
- **`brand-rules/`** – entpackte VTM-Produktionsskill `vtm-ghost-html-card`. Das ist die **Single Source of Truth für die Artikel-Generierung**:
  - `SKILL.md` – Workflow und Bauregeln (E-Mail-sicher + Ghost-Web-Theme-fest)
  - `references/redaktionsstruktur.md` – verbindliche Artikelstruktur und Qualitätsprüfung (13/16)
  - `references/komponenten.md` – alle HTML-Bausteine der Card (1:1 verwenden, Overrides niemals entfernen)
  - `references/sponsored-content.md` – Sponsored-Sonderregeln (Kundentext 1:1)
  - `assets/app-hinweis.html` – Pflichtblock am Artikelanfang
  - `scripts/stilcheck.py` – Prüfskript; portiere die Prüflogik nach TypeScript (`lib/stilcheck.ts`) und halte sie testgetrieben deckungsgleich

## Tech-Stack (fixiert, nicht diskutieren)

- **Next.js 15 (App Router) + TypeScript**, Tailwind CSS; UI-Komponenten gemäß `design/`
- **Prisma + PostgreSQL** (produktiv Neon-kompatibel; Unit-Tests laufen DB-frei gegen gemockte Repositories, DB-Integrationstests nur in GitHub Actions gegen den Postgres-Service-Container; eine optionale `docker-compose.yml` liegt bei für spätere lokale Entwicklung, wird aber in der Sandbox nie ausgeführt)
- **Auth.js (NextAuth)** mit E-Mail-Magic-Link; Rollen: HERAUSGEBER, REDAKTEUR; Sponsored-Freigabe für Kunden über tokenisierte Links ohne Account
- **Anthropic API** (Modell `claude-sonnet-4-6`) für Analyse, Card-Generierung, Qualitätsscore, Excerpts, LinkedIn-Posts
- **Ghost Admin API** (JWT mit Admin API Key) für Draft-Erstellung und Image-Upload
- Datei-Parsing: `mammoth` (DOCX), `pdf-parse` (PDF), Markdown/TXT nativ
- Bildrendering: SVG-Templates serverseitig zu PNG via `sharp` (oder `@resvg/resvg-js`)
- Jobs: einfache DB-Queue mit Status-Polling (kein Redis, kein externer Worker)

## Datenmodell (Kern)

`User` (rolle), `Artikel` (titel, format, kategorie, status[EINGEGANGEN|IN_AUFBEREITUNG|REVIEW|KUNDENFREIGABE|BEREIT|IN_GHOST], sponsored, kunde, quelltextOriginal, quelltextHash, cardHtml, headlineVorschlaege[], excerpts[], qualitaetsScore, scoreDetails JSON, stilcheckFindings JSON, faktencheckClaims JSON, ghostPostId, ghostDraftUrl), `LinkedInPost` (artikelId, kanal[VTM|PERSONAL], text, bildUrl, format), `FreigabeToken` (artikelId, token, kundeEmail, status, kommentar), `Einstellung` (Ghost-URL, verschlüsselte Keys), `AuditLog`.

## Meilensteine

### M1 – Fundament
Projekt-Setup, Prisma-Schema, Auth mit Rollen, App-Shell nach `design/` (dunkle Cobalt-Sidebar, helle Arbeitsfläche), Pipeline-Board mit Beispieldaten, Einstellungsseite mit Ghost-Verbindungstest (GET /admin/site) und verschlüsselter Key-Ablage.

### M2 – Artikel-Pipeline (Kernfeature)
Upload (DOCX/MD/TXT/PDF) + Briefing-Formular → Verarbeitungsjob mit Stepper-Status:
1. **Extraktion** des Rohtexts
2. **Card-Generierung** via Anthropic API: Systemprompt wird zur Laufzeit aus `brand-rules/` zusammengesetzt (SKILL.md + redaktionsstruktur.md + komponenten.md + app-hinweis.html; bei sponsored zusätzlich sponsored-content.md mit Vorrang und Kundentext-1:1-Anweisung). Output: vollständige HTML-Card nach den Bausteinen, App-Block zuerst, genau ein CTA (Standard-Link AI Insurance Briefing aus den Einstellungen).
3. **Checks**: `lib/stilcheck.ts` (deckungsgleich zu `scripts/stilcheck.py`), danach LLM-Qualitätsscore gegen die 8 Kategorien aus redaktionsstruktur.md (0–2 Punkte, Schwelle 13/16), plus Faktencheck-Extraktion: Kernaussagen als Liste mit Klassifikation BELEGT (mit Quellenangabe aus dem Text) / ABLEITUNG / PROGNOSE.
4. **Persistenz** + Statuswechsel nach REVIEW.

Review-Screen exakt nach `design/`: Outline links (bei sponsored: Gegenargumente/Wertung ausgegraut), Mitte iframe-Preview mit Umschalter **Web-Ansicht** (rendert die Card innerhalb eines `.gh-content`-Wrappers mit den echten Theme-Tabellenregeln aus `lib/ghost-theme-simulation.css`, siehe SKILL.md Bauregel 10) und **Outlook-Ansicht** (strippt border-radius und ersetzt Gradients durch bgcolor-Vollfarben), rechts Prüf-Panel mit den drei Tabs. Editierbarkeit: Abschnittstexte inline änderbar, Card wird bei Änderung neu zusammengesetzt und erneut geprüft.

### M3 – Ghost-Publishing
Publish-Modal (Headline mit 2 KI-Vorschlägen, 3 Excerpt-Varianten mit Zeichenzähler ≤300, Tags, Feature-Image-Upload). **Kritisches Detail:** Den Post über die Admin API als **Lexical-Dokument mit genau einer html-Card-Node** anlegen, die die komplette VTM-Card enthält. NICHT den `?source=html`-Konvertierungspfad verwenden, wenn er die Card in native Blöcke zerlegt (das zerstört die Inline-Styles). Schreibe einen Integrationstest, der in GitHub Actions gegen den `ghost:5-alpine`-Service-Container läuft (Instanz beim Teststart über den Setup-Endpoint provisionieren, Admin API Key programmatisch anlegen) und verifiziert, dass der erstellte Draft die Card unverändert als html-Card enthält; lokal/Sandbox wird der Test per Env-Flag übersprungen. Feature Image via `/admin/images/upload/`. Erfolg: ghostDraftUrl speichern, Status IN_GHOST, Link im UI.

### M4 – LinkedIn Studio
Post-Generator mit Kanal-Umschalter: **VTM-Kanal** (Sie-Form, These-Hook, Faktenabsätze, genau 3 Bullets mit ▪️ als vollständige Sätze, Abschluss „Jetzt lesen und mitdiskutieren.", 5 Hashtags, keine Em-Dashes, keine Emojis außer ▪️) und **Personal** (Du-Form, nahbarer, gleiche Faktentreue). 2–3 Varianten, Copy-Button, Zeichenzähler.
Beitragsbild-Generator: drei SVG-Templates im VTM-CI (Cobalt-Verlauf #0D1C3C→#122952, Gold-Signaturstrich oben, Serifen-Headline, dezentes Datenraster, VTM-Wortmarke unten links, bei sponsored Kennzeichnungszeile „Anzeige · In Kooperation mit …" in Gold), Formate 1200×630 und 1080×1080, editierbare Titel-/Unterzeile mit Live-Vorschau, PNG-Export in 2facher Auflösung.

### M5 – Sponsored-Freigabe & Feinschliff
Kundenansicht unter `/freigabe/[token]`: Artikelvorschau, **Diff-Ansicht Kundentext vs. Card-Fließtext** (Normalisierung: nur Typografie-Änderungen wie Gedankenstrich-Bereinigung gelten als gleich) mit Badge „Text 1:1 übernommen" nur bei bestandener Prüfung (quelltextHash-Vergleich der normalisierten Texte), Kommentarfeld, Buttons Freigeben / Änderung anfragen, E-Mail-Benachrichtigung an den Herausgeber. AuditLog-Ansicht, Empty/Loading/Error-States überall gemäß `design/`, Responsive-Pass.

## Qualität & Definition of Done

- Pro Meilenstein ein PR; GitHub-Actions-CI (check + integration) grün ist Merge-Bedingung
- `npm run build` ohne Fehler; ESLint + TypeScript strict sauber (läuft vollständig in der Sandbox ohne Docker)
- Unit-Tests (Vitest): stilcheck.ts (Fixtures: eine valide Card aus `brand-rules`-Bausteinen = 0 Fehler; Cards mit Em-Dash, Flexbox, fehlendem background-image:none, zweitem CTA = jeweils erkannter Fehler), Excerpt-Längen, Lexical-Payload-Builder
- Integrationstest Ghost-Draft (M3, in Actions) und ein Playwright-E2E-Happy-Path gegen die lokal gestartete App mit gemockter Ghost-/Anthropic-Schicht: Upload → Review → Publish-Modal
- Secrets ausschließlich via `.env` (`ANTHROPIC_API_KEY`, `GHOST_ADMIN_API_KEY`, `GHOST_URL`, `DATABASE_URL`, `AUTH_SECRET`, `SMTP_*`); `.env.example` pflegen
- README mit Setup (Sandbox/CI-Weg UND lokaler Docker-Weg getrennt beschrieben), Deploy-Anleitung (Vercel + Neon), Screenshots, Architekturübersicht

## Nicht-Ziele (v1)

Kein Multi-Tenant/Billing, kein direktes LinkedIn-API-Posting (nur Copy/Download; API-Anbindung als sauber gekapselter Stub `lib/linkedin.ts` vorbereiten), kein automatisches Publishing (immer nur Ghost-**Draft**, nie Publish — die menschliche Freigabe in Ghost bleibt bewusst der letzte Schritt), keine Websuche im Faktencheck (Klassifikation nur aus dem Dokument; Interface so bauen, dass eine Recherche-Stufe später andockbar ist).

## Sprache & Ton

UI vollständig Deutsch, Sie-Form. Keine verspielten Elemente, keine Emojis im UI. Fehlermeldungen präzise und handlungsleitend.
