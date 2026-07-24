-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rolle" AS ENUM ('HERAUSGEBER', 'REDAKTEUR');

-- CreateEnum
CREATE TYPE "ArtikelStatus" AS ENUM ('EINGEGANGEN', 'IN_AUFBEREITUNG', 'REVIEW', 'KUNDENFREIGABE', 'BEREIT', 'IN_GHOST');

-- CreateEnum
CREATE TYPE "ArtikelFormat" AS ENUM ('EINORDNUNG', 'ANALYSE', 'PRAXIS_CASE', 'LEITFADEN', 'SPONSORED', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "LinkedInKanal" AS ENUM ('VTM', 'PERSONAL');

-- CreateEnum
CREATE TYPE "FreigabeStatus" AS ENUM ('OFFEN', 'FREIGEGEBEN', 'AENDERUNG_ANGEFRAGT', 'ABGELAUFEN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('WARTEND', 'LAEUFT', 'FERTIG', 'FEHLGESCHLAGEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "rolle" "Rolle" NOT NULL DEFAULT 'REDAKTEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Artikel" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "format" "ArtikelFormat" NOT NULL,
    "kategorie" TEXT,
    "status" "ArtikelStatus" NOT NULL DEFAULT 'EINGEGANGEN',
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "kunde" TEXT,
    "quelltextOriginal" TEXT,
    "quelltextHash" TEXT,
    "cardHtml" TEXT,
    "headlineVorschlaege" TEXT[],
    "excerpts" TEXT[],
    "qualitaetsScore" INTEGER,
    "scoreDetails" JSONB,
    "stilcheckFindings" JSONB,
    "faktencheckClaims" JSONB,
    "ghostPostId" TEXT,
    "ghostDraftUrl" TEXT,
    "autorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInPost" (
    "id" TEXT NOT NULL,
    "artikelId" TEXT NOT NULL,
    "kanal" "LinkedInKanal" NOT NULL,
    "text" TEXT NOT NULL,
    "bildUrl" TEXT,
    "format" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreigabeToken" (
    "id" TEXT NOT NULL,
    "artikelId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "kundeEmail" TEXT NOT NULL,
    "status" "FreigabeStatus" NOT NULL DEFAULT 'OFFEN',
    "kommentar" TEXT,
    "gueltigBis" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreigabeToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einstellung" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "ghostUrl" TEXT,
    "ghostAdminApiKey" TEXT,
    "anthropicApiKey" TEXT,
    "ctaStandardUrl" TEXT,
    "ctaStandardLabel" TEXT,
    "letzterGhostAbgleich" TIMESTAMP(3),
    "letzterGhostStatus" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Einstellung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "artikelId" TEXT,
    "aktion" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "artikelId" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'WARTEND',
    "schritt" INTEGER NOT NULL DEFAULT 0,
    "schrittStatus" JSONB,
    "fehler" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Artikel_status_idx" ON "Artikel"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FreigabeToken_token_key" ON "FreigabeToken"("token");

-- CreateIndex
CREATE INDEX "AuditLog_artikelId_idx" ON "AuditLog"("artikelId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artikel" ADD CONSTRAINT "Artikel_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedInPost" ADD CONSTRAINT "LinkedInPost_artikelId_fkey" FOREIGN KEY ("artikelId") REFERENCES "Artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreigabeToken" ADD CONSTRAINT "FreigabeToken_artikelId_fkey" FOREIGN KEY ("artikelId") REFERENCES "Artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_artikelId_fkey" FOREIGN KEY ("artikelId") REFERENCES "Artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_artikelId_fkey" FOREIGN KEY ("artikelId") REFERENCES "Artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

