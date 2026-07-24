"use server";

import type { ArtikelFormat } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { schreibeAuditLog } from "@/lib/audit";
import { pruefeDateiname } from "@/lib/extraktion";
import { fuehreNaechstenSchrittAus, JOB_SCHRITTE, type JobBriefing } from "@/lib/jobs";
import { FORMAT_LABELS } from "@/lib/status";

const MAX_DATEI_BYTES = 20 * 1024 * 1024;

export interface ErstellenErgebnis {
  ok: boolean;
  meldung?: string;
  artikelId?: string;
  jobId?: string;
}

export async function erstelleArtikelAction(formData: FormData): Promise<ErstellenErgebnis> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, meldung: "Nicht angemeldet." };
  }

  const datei = formData.get("datei");
  if (!(datei instanceof File) || datei.size === 0) {
    return { ok: false, meldung: "Bitte legen Sie ein Manuskript ab (DOCX, Markdown, TXT oder PDF)." };
  }
  if (datei.size > MAX_DATEI_BYTES) {
    return { ok: false, meldung: "Die Datei ist größer als 20 MB. Bitte reduzieren Sie die Dateigröße." };
  }
  try {
    pruefeDateiname(datei.name);
  } catch (fehler) {
    return { ok: false, meldung: fehler instanceof Error ? fehler.message : "Ungültiges Dateiformat." };
  }

  const kategorie = String(formData.get("kategorie") ?? "").trim();
  const format = String(formData.get("format") ?? "") as ArtikelFormat;
  const zentraleFrage = String(formData.get("zentraleFrage") ?? "").trim();
  const anlass = String(formData.get("anlass") ?? "").trim();
  const sponsored = formData.get("sponsored") === "1";
  const kunde = String(formData.get("kunde") ?? "").trim() || null;

  if (!FORMAT_LABELS[format]) {
    return { ok: false, meldung: "Bitte wählen Sie ein gültiges Artikelformat." };
  }
  if (sponsored && !kunde) {
    return { ok: false, meldung: "Bei Sponsored Content ist der Kundenname erforderlich." };
  }

  const daten = Buffer.from(await datei.arrayBuffer());
  const titel = datei.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Neuer Artikel";

  const briefing: JobBriefing = {
    kategorie,
    format,
    formatLabel: FORMAT_LABELS[format],
    zentraleFrage,
    anlass,
    sponsored,
    kunde,
  };

  const artikel = await prisma.artikel.create({
    data: {
      titel,
      format,
      kategorie: kategorie || null,
      sponsored,
      kunde,
      status: "EINGEGANGEN",
      autorId: session.user.id,
      upload: { create: { dateiname: datei.name, mime: datei.type || null, daten } },
      jobs: {
        create: {
          typ: "AUFBEREITUNG",
          status: "WARTEND",
          briefing: briefing as unknown as import("@prisma/client").Prisma.InputJsonValue,
          schrittStatus: JOB_SCHRITTE.map((definition) => ({
            schritt: definition.schritt,
            name: definition.name,
            status: "OFFEN",
          })),
        },
      },
    },
    include: { jobs: true },
  });

  await schreibeAuditLog({
    userId: session.user.id,
    artikelId: artikel.id,
    aktion: "ARTIKEL_HOCHGELADEN",
    details: { dateiname: datei.name, sponsored },
  });

  return { ok: true, artikelId: artikel.id, jobId: artikel.jobs[0]!.id };
}

export interface JobZustand {
  id: string;
  artikelId: string;
  status: string;
  schritt: number;
  fehler: string | null;
  schrittStatus: Array<{ schritt: number; name: string; status: string; info?: string }>;
}

// Poll-Tick der DB-Queue: führt den nächsten Schritt aus und liefert den
// aktuellen Job-Zustand für den Stepper zurück.
export async function verarbeiteNaechstenSchrittAction(jobId: string): Promise<JobZustand> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Nicht angemeldet.");
  }
  const job = await fuehreNaechstenSchrittAus(jobId);
  return {
    id: job.id,
    artikelId: job.artikelId,
    status: job.status,
    schritt: job.schritt,
    fehler: job.fehler,
    schrittStatus: (job.schrittStatus as JobZustand["schrittStatus"]) ?? [],
  };
}
