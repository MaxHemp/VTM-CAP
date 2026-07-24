# VTM Studio

Interne Redaktionsplattform des **VersicherungsTech Magazins (VTM)**. VTM Studio verwandelt hochgeladene Autorentexte automatisiert in publikationsreife Ghost-CMS-Artikel-Drafts im VTM-Design und erzeugt LinkedIn-Posts samt Beitragsbild im Corporate Design.

Auftrag und Meilensteinplan: `PROMPT_Claude_Code_VTM_Studio.md` · Umsetzungsplan M1: `docs/PLAN_M1.md`

**Stand: Meilenstein M1 (Fundament)** – Projekt-Setup, Prisma-Datenmodell, Auth mit Rollen, App-Shell nach `design/`, Pipeline-Board, Einstellungen mit Ghost-Verbindungstest und verschlüsselter Key-Ablage. Upload/Pipeline (M2), Ghost-Publishing (M3), LinkedIn Studio (M4) und Sponsored-Freigabe (M5) folgen.

## Architekturüberblick

- **Next.js 15 (App Router) + TypeScript strict**, Tailwind CSS; Design-Tokens und Komponentenklassen 1:1 aus dem Design-System in `design/_ds` portiert (`app/globals.css`)
- **Prisma + PostgreSQL** (Neon-kompatibel); vollständiges Kern-Datenmodell bereits in M1 (`prisma/schema.prisma`): User/Rollen, Artikel mit Pipeline-Status, LinkedInPost, FreigabeToken, Einstellung, AuditLog, Job-Queue
- **Auth.js (NextAuth v5)** mit E-Mail-Magic-Link und Rollen `HERAUSGEBER` / `REDAKTEUR`; ohne SMTP-Konfiguration wird der Anmeldelink in der Server-Konsole ausgegeben
- **Ghost Admin API**: `lib/ghost.ts` erzeugt kurzlebige HS256-JWTs aus dem Admin API Key und testet die Verbindung über `GET /ghost/api/admin/site/` (Basis für das Publishing in M3)
- **Verschlüsselte Key-Ablage**: `lib/crypto.ts` (AES-256-GCM, Schlüssel aus `ENCRYPTION_SECRET`); API-Keys liegen nie im Klartext in der Datenbank und werden im UI nur maskiert angezeigt
- **Brand-Rules**: `brand-rules/` ist die Single Source of Truth für die Artikel-Generierung (ab M2)

```
app/            Routen: /login, /pipeline, /artikel, /einstellungen, /linkedin, /freigabe
components/     shell/ (Sidebar, Topbar), pipeline/, ui/
lib/            auth, crypto, ghost, einstellungen, audit, status, db
prisma/         schema.prisma, migrations/, seed.ts
tests/          unit/ (Vitest, DB-frei), integration/ (nur GitHub Actions)
.github/        workflows/ci.yml (Jobs: check + integration)
```

## Setup

### Weg A: Sandbox / CI (ohne Docker)

Build, Lint, Typecheck und Unit-Tests laufen vollständig ohne Container und ohne Datenbank:

```bash
npm ci
npx prisma generate
npm run lint
npm run build
npm run typecheck
npm test
```

Integrationstests (Postgres/Ghost) laufen **ausschließlich in GitHub Actions** gegen Service-Container (`postgres:16`, `ghost:5-alpine`) und werden lokal automatisch übersprungen (Env-Flag `RUN_INTEGRATION=1` fehlt).

### Weg B: Lokale Entwicklung mit Docker

```bash
cp .env.example .env        # Werte eintragen (mindestens DATABASE_URL, AUTH_SECRET, ENCRYPTION_SECRET)
docker compose up -d        # startet postgres:16 und ghost:5-alpine
npx prisma migrate deploy   # Schema anwenden
npx prisma db seed          # Beispieldaten für das Pipeline-Board
npm run dev                 # http://localhost:3000
```

Anmeldung: E-Mail-Adresse eingeben; ohne `SMTP_*`-Konfiguration erscheint der Magic-Link in der Konsole des Dev-Servers. Der erste Benutzer wird als `REDAKTEUR` angelegt; die Rolle `HERAUSGEBER` wird per SQL/Prisma Studio gesetzt (`npx prisma studio`).

## Deployment (Vercel + Neon)

1. Neon-Projekt anlegen, `DATABASE_URL` (Pooled Connection) kopieren
2. Repository bei Vercel importieren; Framework-Preset Next.js
3. Umgebungsvariablen setzen (siehe `.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_SECRET`, `APP_URL`, `SMTP_*`; `GHOST_URL`/`GHOST_ADMIN_API_KEY` und `ANTHROPIC_API_KEY` können alternativ verschlüsselt über die Einstellungsseite gepflegt werden
4. Migrationen beim Deploy anwenden: Build-Command auf `npx prisma migrate deploy && npm run build` setzen (oder Migrationsschritt in der CI ausführen)

Secrets liegen ausschließlich in `.env` bzw. als Vercel/GitHub-Actions-Secrets – niemals im Repository.

## Qualität

- CI (`.github/workflows/ci.yml`): Job `check` (install, lint, typecheck, build, Unit-Tests) bei jedem Push/PR; Job `integration` mit Service-Containern `postgres:16` und `ghost:5-alpine`. Grüne CI ist Merge-Bedingung.
- Unit-Tests (Vitest, DB-frei): Verschlüsselung (Roundtrip, Manipulationserkennung), Ghost-JWT und Verbindungstest (gemocktes `fetch`), Board-Gruppierung
- Ab M2/M3 kommen hinzu: `lib/stilcheck.ts` (deckungsgleich zu `brand-rules/scripts/stilcheck.py`), Excerpt-Längen, Lexical-Payload-Builder, Ghost-Draft-Integrationstest, Playwright-E2E-Happy-Path

## Screenshots

Screenshots der App-Shell, des Pipeline-Boards und der Einstellungsseite folgen mit dem Review des M1-PRs (die Screens entsprechen dem Prototyp in `design/VTM Studio.dc.html`).
