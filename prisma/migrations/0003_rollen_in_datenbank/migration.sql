-- Rollen wandern aus dem Enum in die Datenbank (frei definierbare Rollen mit
-- Rechte-Flags). Die beiden Systemrollen erhalten feste IDs; bestehende
-- Benutzer werden anhand des bisherigen Enum-Werts überführt.

-- CreateTable
CREATE TABLE "BenutzerRolle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "beschreibung" TEXT,
    "istSystem" BOOLEAN NOT NULL DEFAULT false,
    "artikelVerwalten" BOOLEAN NOT NULL DEFAULT false,
    "publizieren" BOOLEAN NOT NULL DEFAULT false,
    "freigabenVerwalten" BOOLEAN NOT NULL DEFAULT false,
    "teamVerwalten" BOOLEAN NOT NULL DEFAULT false,
    "einstellungenVerwalten" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenutzerRolle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BenutzerRolle_name_key" ON "BenutzerRolle"("name");

-- Systemrollen anlegen (feste IDs, nicht änderbar)
INSERT INTO "BenutzerRolle"
  ("id", "name", "beschreibung", "istSystem", "artikelVerwalten", "publizieren", "freigabenVerwalten", "teamVerwalten", "einstellungenVerwalten", "updatedAt")
VALUES
  ('rolle-herausgeber', 'Herausgeber', 'Volle Verwaltung: Artikel, Publishing, Freigaben, Team und Einstellungen.', true, true, true, true, true, true, CURRENT_TIMESTAMP),
  ('rolle-redakteur', 'Redakteur', 'Redaktionelle Arbeit: Manuskripte hochladen, Reviews bearbeiten, LinkedIn-Posts erstellen.', true, false, false, false, false, false, CURRENT_TIMESTAMP);

-- Bestehende Benutzer überführen
ALTER TABLE "User" ADD COLUMN "rolleId" TEXT NOT NULL DEFAULT 'rolle-redakteur';
UPDATE "User" SET "rolleId" = 'rolle-herausgeber' WHERE "rolle" = 'HERAUSGEBER';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rolleId_fkey" FOREIGN KEY ("rolleId") REFERENCES "BenutzerRolle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Altes Enum entfernen
ALTER TABLE "User" DROP COLUMN "rolle";
DROP TYPE "Rolle";
