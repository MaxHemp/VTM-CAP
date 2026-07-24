"use server";

import { revalidatePath } from "next/cache";
import { requireRolle } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { schreibeAuditLog } from "@/lib/audit";
import { baueFreigabeUrl, erstelleFreigabeToken } from "@/lib/freigabe";
import { sendeMail } from "@/lib/mail";

export interface FreigabeLinkErgebnis {
  ok: boolean;
  meldung: string;
  url?: string;
}

export async function erstelleFreigabeLinkAction(
  artikelId: string,
  kundeEmail: string
): Promise<FreigabeLinkErgebnis> {
  let session;
  try {
    session = await requireRolle("HERAUSGEBER");
  } catch (fehler) {
    return { ok: false, meldung: fehler instanceof Error ? fehler.message : "Keine Berechtigung." };
  }

  const email = kundeEmail.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, meldung: "Bitte geben Sie eine gültige E-Mail-Adresse des Kunden an." };
  }
  const artikel = await prisma.artikel.findUnique({ where: { id: artikelId } });
  if (!artikel) {
    return { ok: false, meldung: "Der Artikel wurde nicht gefunden." };
  }
  if (!artikel.sponsored) {
    return { ok: false, meldung: "Freigabelinks gibt es nur für Sponsored-Artikel." };
  }
  if (!artikel.cardHtml) {
    return { ok: false, meldung: "Bitte schließen Sie zuerst die Aufbereitung ab (Card fehlt noch)." };
  }

  const token = await erstelleFreigabeToken(artikelId, email);
  const url = baueFreigabeUrl(token.token);
  await schreibeAuditLog({
    userId: session.user.id,
    artikelId,
    aktion: "FREIGABELINK_ERSTELLT",
    details: { kundeEmail: email },
  });
  try {
    await sendeMail({
      an: email,
      betreff: `Zur Freigabe: ${artikel.titel}`,
      text:
        `Guten Tag,\n\nder Sponsored-Artikel "${artikel.titel}" steht für Sie zur Freigabe bereit:\n\n${url}\n\n` +
        `Der Link ist 14 Tage gültig und benötigt keinen Account.\n\nVersicherungsTech Magazin`,
    });
  } catch (fehler) {
    console.error("Freigabelink-E-Mail konnte nicht versendet werden:", fehler);
  }

  revalidatePath("/freigabe");
  return { ok: true, meldung: `Freigabelink erstellt und an ${email} versendet.`, url };
}
