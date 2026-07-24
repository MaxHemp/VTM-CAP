# Umsetzungsplan Meilenstein M1 – Fundament

Stand: 2026-07-24 · Grundlage: `PROMPT_Claude_Code_VTM_Studio.md`, `design/` (Prototyp + Design-System 4.2), `brand-rules/`

## Ziel von M1

Lauffähiges, CI-geprüftes Fundament von **VTM Studio**: Projekt-Setup, vollständiges Prisma-Schema, Auth mit Rollen, App-Shell exakt nach `design/`, Pipeline-Board mit Beispieldaten sowie Einstellungsseite mit Ghost-Verbindungstest und verschlüsselter Key-Ablage. M1 liefert bewusst noch keine Verarbeitungs-Pipeline (M2), legt aber alle Verträge (Datenmodell, Status-Enum, Ordnerstruktur, CI) so an, dass M2–M5 ohne Umbauten andocken.

## Arbeitspakete

### 1. Projekt-Setup & Werkzeuge

- Next.js 15 (App Router) + TypeScript **strict**, Tailwind CSS 4, ESLint (flat config, `next/core-web-vitals` + `typescript-eslint strict`).
- Vitest für Unit-Tests (DB-frei, gemockte Repositories); Playwright wird installiert und konfiguriert, der E2E-Happy-Path folgt lt. Auftrag in M2/M3.
- npm-Scripts: `dev`, `build`, `lint`, `typecheck`, `test` (Unit), `test:integration` (nur CI, per Env-Flag `RUN_INTEGRATION=1` aktiv, sonst `skip`).
- `.env.example` mit allen Platzhaltern und Kommentaren (`DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_SECRET`, `ANTHROPIC_API_KEY`, `GHOST_URL`, `GHOST_ADMIN_API_KEY`, `SMTP_*`, `APP_URL`). Keine echten Werte im Repo.
- Optionale `docker-compose.yml` (Postgres 16 + Ghost 5) nur als Beilage für spätere lokale Entwicklung – wird in der Sandbox nie ausgeführt und von keinem Script vorausgesetzt.
- README-Grundgerüst: Setup Sandbox/CI-Weg vs. lokaler Docker-Weg, Architekturübersicht (wird pro Meilenstein fortgeschrieben).

### 2. CI: GitHub Actions (`.github/workflows/ci.yml`)

- **Job `check`** (bei jedem Push/PR): `npm ci` → `prisma generate` → `lint` → `typecheck` → `build` → Unit-Tests. Läuft komplett ohne Container.
- **Job `integration`**: Service-Container `postgres:16` und `ghost:5-alpine`. In M1 führt er `prisma migrate deploy` + einen ersten Prisma-Roundtrip-Test gegen Postgres aus (Schema-Absicherung). Der Ghost-Container wird bereits hochgefahren und per Healthcheck gewartet, damit der M3-Integrationstest (Setup-Endpoint → Integration + Admin API Key programmatisch anlegen) nur noch eingehängt werden muss. Lokal/Sandbox werden Integrationstests über das Env-Flag übersprungen.
- CI grün = Merge-Bedingung für jeden Meilenstein-PR.

### 3. Prisma-Schema (vollständiges Kern-Datenmodell)

Bereits in M1 komplett, damit spätere Meilensteine nur Logik ergänzen:

- `User` (rolle: `HERAUSGEBER` | `REDAKTEUR`) + Auth.js-Tabellen (Account, Session, VerificationToken)
- `Artikel`: titel, format, kategorie, status (`EINGEGANGEN | IN_AUFBEREITUNG | REVIEW | KUNDENFREIGABE | BEREIT | IN_GHOST`), sponsored, kunde, quelltextOriginal, quelltextHash, cardHtml, headlineVorschlaege[], excerpts[], qualitaetsScore, scoreDetails (JSON), stilcheckFindings (JSON), faktencheckClaims (JSON), ghostPostId, ghostDraftUrl
- `LinkedInPost` (artikelId, kanal `VTM | PERSONAL`, text, bildUrl, format)
- `FreigabeToken` (artikelId, token, kundeEmail, status, kommentar)
- `Einstellung` (Ghost-URL, verschlüsselte Keys als Ciphertext-Felder)
- `AuditLog` (userId, artikelId, aktion, details, timestamp)
- `Job` (artikelId, typ, status, schrittStatus JSON) – Grundlage der DB-Queue mit Status-Polling ab M2
- Seed-Script mit Beispielartikeln über alle Pipeline-Status (für das Board); Datenzugriff über ein schmales Repository-Interface, damit Unit-Tests DB-frei mocken können.

### 4. Auth.js mit Magic-Link & Rollen

- Auth.js (NextAuth v5) mit E-Mail-Provider (Magic-Link via `SMTP_*`; in Entwicklung/CI Konsolen-Transport statt echtem Versand).
- Prisma-Adapter; Rolle am User, Rolle in Session/JWT verfügbar.
- Middleware: alle App-Routen geschützt; `/freigabe/[token]` (M5) bleibt ausgenommen – tokenbasiert ohne Account. Login-Seite im VTM-Design, UI Deutsch/Sie-Form.
- Rollen-Gate als Helper (`requireRolle('HERAUSGEBER')`) – in M1 genutzt für die Einstellungsseite (nur HERAUSGEBER darf Keys ändern).

### 5. Design-System-Portierung & App-Shell

- Tokens aus `design/_ds/.../tokens/*.css` (Farben, Typografie, Layout, Effekte, Fonts) als CSS-Custom-Properties in `app/globals.css` übernehmen und in der Tailwind-Konfiguration referenzieren – Werte 1:1 (Cobalt-Palette `--c-cobalt-950 #121e39` …, Blau, Brass/Gold, Status-Farben), keine Neuinterpretation.
- App-Shell nach Prototyp (`design/VTM Studio.dc.html`, Screen „Navigation"): dunkle Cobalt-Sidebar (238 px, `gradient-brand-deep` + radialem Blau-Akzent, VTM-Wortmarke, Navigationspunkte Pipeline / Neuer Artikel / LinkedIn Studio / Einstellungen, Nutzer-Fußzeile mit Abmelden), helle Arbeitsfläche (`--surface-soft`), Topbar je Screen.
- Komponenten werden sauber als React/Tailwind-Komponenten portiert (Button, Badge, Card, Tabelle, Modal-Grundgerüst, Empty/Loading/Error-State), nicht aus dem Prototyp kopiert. Prototyp-Screens „Artikel-Review", „Ghost-Modal", „LinkedIn Studio", „Sponsored-Freigabe" sind erst in M2–M5 dran; die Shell reserviert bereits Navigation und Routen.

### 6. Pipeline-Board (mit Beispieldaten)

- Route `/` bzw. `/pipeline`: Kanban nach Prototyp-Screen „Pipeline" – Spalten je Status (Eingegangen, In Aufbereitung, Review, Kundenfreigabe, Bereit, In Ghost), Artikelkarten mit Titel, Format-/Kategorie-Badge, Sponsored-Kennzeichnung (Brass/Gold), Qualitätsscore-Anzeige, Zeitstempel.
- Daten aus der DB (Seed); wo keine DB verfügbar ist (Sandbox-Unit-Tests) über das gemockte Repository. In M1 read-only – Statuswechsel übernimmt ab M2 die Pipeline; Karten verlinken auf (noch leere) Detail-Routen.
- Empty-State gemäß `design/`, präzise deutsche Texte.

### 7. Einstellungsseite mit Ghost-Verbindungstest & verschlüsselter Key-Ablage

- Route `/einstellungen` nach Prototyp-Screen „Einstellungen": Ghost-URL, Ghost Admin API Key, Anthropic API Key, Standard-CTA-Link (AI Insurance Briefing), SMTP-Anzeige.
- **Verschlüsselte Ablage:** Keys werden serverseitig mit AES-256-GCM verschlüsselt (`lib/crypto.ts`, Schlüssel aus `ENCRYPTION_SECRET` abgeleitet) in `Einstellung` gespeichert; UI zeigt nur maskierte Werte (letzte 4 Zeichen), niemals Klartext zurück an den Client.
- **Verbindungstest:** Server-Action ruft `GET {GHOST_URL}/ghost/api/admin/site/` mit kurzlebigem JWT aus dem Admin API Key (`lib/ghost.ts`: Key-Parsing `id:secret`, HS256-JWT, Header `Authorization: Ghost <token>`). Ergebnisanzeige mit Site-Titel/Version bei Erfolg, präzisen handlungsleitenden Fehlermeldungen bei falscher URL, ungültigem Key-Format oder abgelehntem Token. `lib/ghost.ts` ist damit die Basis für das M3-Publishing.
- Jede Einstellungsänderung schreibt einen `AuditLog`-Eintrag.

### 8. Tests & Definition of Done (M1)

Unit (Vitest, DB-frei):
- `lib/crypto.ts`: Roundtrip verschlüsseln/entschlüsseln, Manipulation wird erkannt (GCM-Auth-Tag)
- `lib/ghost.ts`: JWT-Erzeugung (kid, exp ≤ 5 min, aud `/admin/`), Key-Format-Validierung, Fehlerpfade (gemocktes `fetch`)
- Status-/Rollen-Helper und Board-Gruppierung nach Status

Integration (nur GitHub Actions): Prisma-Migration + Roundtrip gegen `postgres:16`.

DoD: CI (`check` + `integration`) grün · `npm run build` fehlerfrei · ESLint/TS strict sauber · UI vollständig Deutsch (Sie-Form), keine Emojis · `.env.example` vollständig · README-Setup beschrieben · Screens deckungsgleich mit `design/` (Sidebar, Pipeline, Einstellungen).

## Geplante Projektstruktur

```
app/
  (app)/pipeline/  (app)/einstellungen/  (app)/artikel/  login/
  api/auth/[...nextauth]/
components/   ui/ (portierte DS-Komponenten) · shell/ (Sidebar, Topbar) · pipeline/
lib/          auth.ts · crypto.ts · ghost.ts · db.ts · repositories/
prisma/       schema.prisma · seed.ts · migrations/
tests/        unit/ · integration/
.github/workflows/ci.yml
```

## Hinweise & Risiken

- **Branch:** Der Auftrag nennt `m1-fundament`; diese Session ist auf den Branch `claude/vtm-studio-m1-plan-wikami` festgelegt, daher laufen Plan und M1-Umsetzung über diesen Branch/PR. Die Meilenstein-Zuordnung bleibt „ein PR pro Meilenstein".
- Ghost-Verbindungstest ist in der Sandbox nur gegen eine erreichbare Ghost-Instanz real prüfbar; die Logik wird deshalb vollständig unit-getestet (gemocktes `fetch`), der echte Roundtrip folgt im M3-Integrationstest gegen `ghost:5-alpine`.
- Tailwind 4 + Next 15: Design-Tokens laufen als CSS-Variablen, damit die Prototyp-Werte exakt erhalten bleiben, unabhängig von Tailwind-Theme-Mechanik.
- Magic-Link-Versand braucht produktiv `SMTP_*`; in Entwicklung/CI wird der Link geloggt statt versendet – dokumentiert im README.

## Ausblick M2–M5 (Kurzfassung, Details je Meilenstein-PR)

M2 Upload + Verarbeitungsjob (Extraktion → Card-Generierung aus `brand-rules/` → `lib/stilcheck.ts` deckungsgleich zu `scripts/stilcheck.py` + LLM-Score 13/16 + Faktencheck) und Review-Screen mit Web/Outlook-Preview · M3 Ghost-Publishing als Lexical-Dokument mit genau einer html-Card-Node + Integrationstest gegen Ghost-Container · M4 LinkedIn Studio (Posts VTM/Personal, SVG→PNG-Beitragsbilder) · M5 Sponsored-Freigabe per Token, Diff-Ansicht, AuditLog-Ansicht, Feinschliff.
