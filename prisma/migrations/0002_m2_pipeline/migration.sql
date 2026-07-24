-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "briefing" JSONB;

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "artikelId" TEXT NOT NULL,
    "dateiname" TEXT NOT NULL,
    "mime" TEXT,
    "daten" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Upload_artikelId_key" ON "Upload"("artikelId");

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_artikelId_fkey" FOREIGN KEY ("artikelId") REFERENCES "Artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

