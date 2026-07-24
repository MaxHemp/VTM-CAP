"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { schreibeAuditLog } from "@/lib/audit";
import { ersetzeAbschnitt, ersetzeTextbloecke, parseAbschnitte } from "@/lib/card-abschnitte";
import { pruefeArtikelErneut } from "@/lib/jobs";

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
