// Verarbeitungspipeline als einfache DB-Queue: Der Client pollt und stößt
// pro Poll-Tick den jeweils nächsten Schritt an (POST /api/jobs/[id]/schritt).
// Kein Redis, kein externer Worker; jeder Schritt ist eine kurze,
// serverless-taugliche Einheit.
import type { Job, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { extrahiereText, quelltextHash } from "@/lib/extraktion";
import { ladeKiSchicht } from "@/lib/ki";
import { pruefeCard } from "@/lib/stilcheck";
import { dekodiereEntities } from "@/lib/entities";
import { ladeEinstellungenFuerAnzeige } from "@/lib/einstellungen";
import { schreibeAuditLog } from "@/lib/audit";
import type { CardBriefing } from "@/lib/brand-prompt";

export const JOB_SCHRITTE = [
  { schritt: 1, name: "Extraktion des Rohtexts" },
  { schritt: 2, name: "Card-Generierung (VTM-Design)" },
  { schritt: 3, name: "Stilcheck, Qualitätsscore, Faktencheck" },
  { schritt: 4, name: "Persistenz und Statuswechsel" },
] as const;

export const STANDARD_CTA_LABEL = "AI Insurance Briefing abonnieren";
export const STANDARD_CTA_URL =
  "https://www.linkedin.com/newsletters/ai-insurance-briefing-7376977231333453824/";

export interface JobBriefing {
  kategorie: string;
  format: string;
  formatLabel: string;
  zentraleFrage: string;
  anlass: string;
  sponsored: boolean;
  kunde: string | null;
}

interface SchrittEintrag {
  schritt: number;
  name: string;
  status: "OFFEN" | "FERTIG" | "FEHLGESCHLAGEN";
  info?: string;
}

function schrittListe(erledigtBis: number, fehlgeschlagen?: number, infos?: Map<number, string>): SchrittEintrag[] {
  return JOB_SCHRITTE.map((definition) => ({
    schritt: definition.schritt,
    name: definition.name,
    status:
      definition.schritt === fehlgeschlagen
        ? "FEHLGESCHLAGEN"
        : definition.schritt <= erledigtBis
          ? "FERTIG"
          : "OFFEN",
    ...(infos?.has(definition.schritt) ? { info: infos.get(definition.schritt) } : {}),
  }));
}

function leseInfos(job: Job): Map<number, string> {
  const infos = new Map<number, string>();
  const eintraege = (job.schrittStatus as unknown as SchrittEintrag[] | null) ?? [];
  for (const eintrag of eintraege) {
    if (eintrag.info) {
      infos.set(eintrag.schritt, eintrag.info);
    }
  }
  return infos;
}

function cardZuText(cardHtml: string): string {
  return dekodiereEntities(cardHtml.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

// Führt genau einen Verarbeitungsschritt aus und gibt den aktualisierten Job
// zurück. Idempotent gegenüber fertigen/fehlgeschlagenen Jobs.
export async function fuehreNaechstenSchrittAus(jobId: string): Promise<Job> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { artikel: { include: { upload: true } } },
  });
  if (!job) {
    throw new Error("Der Verarbeitungsjob wurde nicht gefunden.");
  }
  if (job.status === "FERTIG" || job.status === "FEHLGESCHLAGEN") {
    return job;
  }

  const naechsterSchritt = job.schritt + 1;
  const infos = leseInfos(job);
  const briefing = job.briefing as unknown as JobBriefing;
  const artikel = job.artikel;

  try {
    if (naechsterSchritt === 1) {
      if (!artikel.upload) {
        throw new Error("Zum Artikel liegt kein hochgeladenes Manuskript vor.");
      }
      const ergebnis = await extrahiereText(Buffer.from(artikel.upload.daten), artikel.upload.dateiname);
      await prisma.artikel.update({
        where: { id: artikel.id },
        data: {
          quelltextOriginal: ergebnis.text,
          quelltextHash: quelltextHash(ergebnis.text),
          status: "IN_AUFBEREITUNG",
        },
      });
      infos.set(1, `${ergebnis.wortzahl.toLocaleString("de-DE")} Wörter erkannt`);
    } else if (naechsterSchritt === 2) {
      if (!artikel.quelltextOriginal) {
        throw new Error("Es liegt kein extrahierter Rohtext vor.");
      }
      const einstellungen = await ladeEinstellungenFuerAnzeige();
      const cardBriefing: CardBriefing = {
        kategorie: briefing.kategorie,
        format: briefing.formatLabel,
        zentraleFrage: briefing.zentraleFrage,
        anlass: briefing.anlass,
        sponsored: briefing.sponsored,
        kunde: briefing.kunde,
        ctaLabel: einstellungen.ctaStandardLabel || STANDARD_CTA_LABEL,
        ctaUrl: einstellungen.ctaStandardUrl || STANDARD_CTA_URL,
      };
      const ki = await ladeKiSchicht();
      const cardHtml = await ki.generiereCard(cardBriefing, artikel.quelltextOriginal);
      if (!cardHtml.includes("<table")) {
        throw new Error("Die Card-Generierung hat keine gültige HTML-Card geliefert.");
      }
      await prisma.artikel.update({ where: { id: artikel.id }, data: { cardHtml } });
      infos.set(2, "HTML-Card nach brand-rules erzeugt");
    } else if (naechsterSchritt === 3) {
      if (!artikel.cardHtml || !artikel.quelltextOriginal) {
        throw new Error("Für die Prüfschritte fehlen Card oder Rohtext.");
      }
      const stilcheck = pruefeCard(artikel.cardHtml, { sponsored: artikel.sponsored });
      const einstellungen = await ladeEinstellungenFuerAnzeige();
      const cardBriefing: CardBriefing = {
        kategorie: briefing.kategorie,
        format: briefing.formatLabel,
        zentraleFrage: briefing.zentraleFrage,
        anlass: briefing.anlass,
        sponsored: briefing.sponsored,
        kunde: briefing.kunde,
        ctaLabel: einstellungen.ctaStandardLabel || STANDARD_CTA_LABEL,
        ctaUrl: einstellungen.ctaStandardUrl || STANDARD_CTA_URL,
      };
      const ki = await ladeKiSchicht();
      const cardText = cardZuText(artikel.cardHtml);
      const [score, claims] = await Promise.all([
        ki.bewerteQualitaet(cardText, cardBriefing),
        ki.extrahiereFakten(artikel.quelltextOriginal, cardText),
      ]);
      await prisma.artikel.update({
        where: { id: artikel.id },
        data: {
          stilcheckFindings: stilcheck as unknown as Prisma.InputJsonValue,
          qualitaetsScore: score.summe,
          scoreDetails: score as unknown as Prisma.InputJsonValue,
          faktencheckClaims: claims as unknown as Prisma.InputJsonValue,
        },
      });
      infos.set(
        3,
        `${stilcheck.fehler.length} Stilcheck-Fehler, Score ${score.summe}/16, ${claims.length} Kernaussagen`
      );
    } else if (naechsterSchritt === 4) {
      await prisma.artikel.update({ where: { id: artikel.id }, data: { status: "REVIEW" } });
      await schreibeAuditLog({
        artikelId: artikel.id,
        aktion: "ARTIKEL_AUFBEREITET",
        details: { jobId: job.id },
      });
      infos.set(4, "Artikel steht im Review");
    } else {
      throw new Error(`Unbekannter Verarbeitungsschritt ${naechsterSchritt}.`);
    }
  } catch (fehler) {
    const meldung = fehler instanceof Error ? fehler.message : "Unbekannter Fehler bei der Verarbeitung.";
    return prisma.job.update({
      where: { id: job.id },
      data: {
        status: "FEHLGESCHLAGEN",
        fehler: meldung,
        schrittStatus: schrittListe(job.schritt, naechsterSchritt, infos) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  const fertig = naechsterSchritt >= JOB_SCHRITTE.length;
  return prisma.job.update({
    where: { id: job.id },
    data: {
      schritt: naechsterSchritt,
      status: fertig ? "FERTIG" : "LAEUFT",
      schrittStatus: schrittListe(naechsterSchritt, undefined, infos) as unknown as Prisma.InputJsonValue,
    },
  });
}

// Führt die Prüfschritte nach einer Textänderung im Review erneut aus.
export async function pruefeArtikelErneut(artikelId: string): Promise<void> {
  const artikel = await prisma.artikel.findUniqueOrThrow({ where: { id: artikelId } });
  if (!artikel.cardHtml || !artikel.quelltextOriginal) {
    throw new Error("Für die erneute Prüfung fehlen Card oder Rohtext.");
  }
  const stilcheck = pruefeCard(artikel.cardHtml, { sponsored: artikel.sponsored });
  const einstellungen = await ladeEinstellungenFuerAnzeige();
  const cardBriefing: CardBriefing = {
    kategorie: artikel.kategorie ?? "",
    format: artikel.format,
    zentraleFrage: "",
    anlass: "",
    sponsored: artikel.sponsored,
    kunde: artikel.kunde,
    ctaLabel: einstellungen.ctaStandardLabel || STANDARD_CTA_LABEL,
    ctaUrl: einstellungen.ctaStandardUrl || STANDARD_CTA_URL,
  };
  const ki = await ladeKiSchicht();
  const cardText = cardZuText(artikel.cardHtml);
  const [score, claims] = await Promise.all([
    ki.bewerteQualitaet(cardText, cardBriefing),
    ki.extrahiereFakten(artikel.quelltextOriginal, cardText),
  ]);
  await prisma.artikel.update({
    where: { id: artikelId },
    data: {
      stilcheckFindings: stilcheck as unknown as Prisma.InputJsonValue,
      qualitaetsScore: score.summe,
      scoreDetails: score as unknown as Prisma.InputJsonValue,
      faktencheckClaims: claims as unknown as Prisma.InputJsonValue,
    },
  });
}
