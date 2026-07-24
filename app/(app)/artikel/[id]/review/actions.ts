"use server";

import { revalidatePath } from "next/cache";
import { auth, requireRolle } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { schreibeAuditLog } from "@/lib/audit";
import { ersetzeAbschnitt, ersetzeTextbloecke, parseAbschnitte } from "@/lib/card-abschnitte";
import { pruefeArtikelErneut } from "@/lib/jobs";
import { htmlZuText } from "@/lib/entities";
import { ladeKiSchicht, EXCERPT_MAX_ZEICHEN } from "@/lib/ki";
import { ladeGhostZugang } from "@/lib/einstellungen";
import { erstelleGhostDraft, ladeFeatureImageHoch, type GhostZugang } from "@/lib/ghost-publish";

export interface BearbeitenErgebnis {
  ok: boolean;
  meldung: string;
}

// Übernimmt geänderte Abschnittstexte, setzt die Card neu zusammen und
// stößt die Prüfungen (Stilcheck, Score, Faktencheck) erneut an.
export async function aktualisiereAbschnittAction(
  artikelId: string,
  abschnittId: string,
  aenderungen: Array<{ index: number; text: string }>
): Promise<BearbeitenErgebnis> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, meldung: "Nicht angemeldet." };
  }

  const artikel = await prisma.artikel.findUnique({ where: { id: artikelId } });
  if (!artikel?.cardHtml) {
    return { ok: false, meldung: "Zum Artikel liegt keine Card vor." };
  }

  const abschnitt = parseAbschnitte(artikel.cardHtml).find((a) => a.id === abschnittId);
  if (!abschnitt) {
    return { ok: false, meldung: `Der Abschnitt "${abschnittId}" wurde nicht gefunden.` };
  }

  try {
    const neuerAbschnitt = ersetzeTextbloecke(
      abschnitt.html,
      new Map(aenderungen.map((aenderung) => [aenderung.index, aenderung.text]))
    );
    const neueCard = ersetzeAbschnitt(artikel.cardHtml, abschnittId, neuerAbschnitt);
    await prisma.artikel.update({ where: { id: artikelId }, data: { cardHtml: neueCard } });
    await pruefeArtikelErneut(artikelId);
    await schreibeAuditLog({
      userId: session.user.id,
      artikelId,
      aktion: "ARTIKEL_ABSCHNITT_BEARBEITET",
      details: { abschnittId, geaenderteBloecke: aenderungen.length },
    });
    revalidatePath(`/artikel/${artikelId}/review`);
    return { ok: true, meldung: "Abschnitt gespeichert. Die Card wurde neu zusammengesetzt und erneut geprüft." };
  } catch (fehler) {
    return {
      ok: false,
      meldung: fehler instanceof Error ? fehler.message : "Der Abschnitt konnte nicht gespeichert werden.",
    };
  }
}

// ── Ghost-Publishing (M3) ───────────────────────────────────────────────────

export interface PublishVorschlaegeErgebnis {
  ok: boolean;
  meldung?: string;
  headlines: string[];
  excerpts: string[];
}

// Liefert Headline- und Excerpt-Vorschläge (KI); einmal erzeugte Vorschläge
// werden am Artikel gespeichert und wiederverwendet.
export async function ladePublishVorschlaegeAction(artikelId: string): Promise<PublishVorschlaegeErgebnis> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, meldung: "Nicht angemeldet.", headlines: [], excerpts: [] };
  }
  const artikel = await prisma.artikel.findUnique({ where: { id: artikelId } });
  if (!artikel?.cardHtml) {
    return { ok: false, meldung: "Zum Artikel liegt keine Card vor.", headlines: [], excerpts: [] };
  }
  if (artikel.headlineVorschlaege.length >= 2 && artikel.excerpts.length >= 3) {
    return { ok: true, headlines: artikel.headlineVorschlaege, excerpts: artikel.excerpts };
  }
  try {
    const ki = await ladeKiSchicht();
    const vorschlaege = await ki.generierePublishVorschlaege(htmlZuText(artikel.cardHtml), artikel.titel);
    await prisma.artikel.update({
      where: { id: artikelId },
      data: { headlineVorschlaege: vorschlaege.headlines, excerpts: vorschlaege.excerpts },
    });
    return { ok: true, headlines: vorschlaege.headlines, excerpts: vorschlaege.excerpts };
  } catch (fehler) {
    return {
      ok: false,
      meldung: fehler instanceof Error ? fehler.message : "Die Vorschläge konnten nicht erzeugt werden.",
      headlines: [],
      excerpts: [],
    };
  }
}

export interface GhostDraftAktionErgebnis {
  ok: boolean;
  meldung?: string;
  editorUrl?: string;
  postId?: string;
}

// Legt den Artikel als Ghost-Draft an (Lexical-Dokument mit genau einer
// html-Card-Node). Bewusst NUR Draft, nie Publish – die menschliche
// Freigabe in Ghost bleibt der letzte Schritt.
export async function erstelleGhostDraftAction(
  artikelId: string,
  formData: FormData
): Promise<GhostDraftAktionErgebnis> {
  let session;
  try {
    session = await requireRolle("HERAUSGEBER");
  } catch (fehler) {
    return { ok: false, meldung: fehler instanceof Error ? fehler.message : "Keine Berechtigung." };
  }

  const artikel = await prisma.artikel.findUnique({ where: { id: artikelId } });
  if (!artikel?.cardHtml) {
    return { ok: false, meldung: "Zum Artikel liegt keine Card vor." };
  }

  const headline = String(formData.get("headline") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (!headline) {
    return { ok: false, meldung: "Bitte geben Sie eine Headline ein." };
  }
  if (excerpt.length > EXCERPT_MAX_ZEICHEN) {
    return {
      ok: false,
      meldung: `Der Excerpt ist ${excerpt.length} Zeichen lang. Ghost erlaubt maximal ${EXCERPT_MAX_ZEICHEN} Zeichen.`,
    };
  }

  let zugang: GhostZugang;
  if (process.env.MOCK_GHOST === "1") {
    zugang = { url: "https://ghost.example", adminApiKey: "mock:00" };
  } else {
    const gespeichert = await ladeGhostZugang();
    if (!gespeichert) {
      return {
        ok: false,
        meldung: "Ghost ist nicht verbunden. Bitte hinterlegen Sie URL und Admin API Key in den Einstellungen.",
      };
    }
    zugang = gespeichert;
  }

  try {
    let featureImageUrl: string | null = null;
    const bild = formData.get("featureImage");
    if (bild instanceof File && bild.size > 0) {
      featureImageUrl = await ladeFeatureImageHoch(
        zugang,
        bild.name,
        Buffer.from(await bild.arrayBuffer()),
        bild.type || "image/png"
      );
    }

    const ergebnis = await erstelleGhostDraft(zugang, {
      titel: headline,
      cardHtml: artikel.cardHtml,
      excerpt,
      tags,
      featureImageUrl,
    });

    await prisma.artikel.update({
      where: { id: artikelId },
      data: {
        titel: headline,
        status: "IN_GHOST",
        ghostPostId: ergebnis.postId,
        ghostDraftUrl: ergebnis.editorUrl,
      },
    });
    await schreibeAuditLog({
      userId: session.user.id,
      artikelId,
      aktion: "GHOST_DRAFT_ERSTELLT",
      details: { postId: ergebnis.postId, tags, featureImage: Boolean(featureImageUrl) },
    });
    revalidatePath(`/artikel/${artikelId}/review`);
    revalidatePath("/pipeline");
    return { ok: true, editorUrl: ergebnis.editorUrl, postId: ergebnis.postId };
  } catch (fehler) {
    return {
      ok: false,
      meldung: fehler instanceof Error ? fehler.message : "Der Ghost-Draft konnte nicht erstellt werden.",
    };
  }
}
