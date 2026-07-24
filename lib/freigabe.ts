// Sponsored-Freigabe (M5): tokenisierte Links ohne Account, Entscheidung
// des Kunden, Benachrichtigung an den Herausgeber.
import { randomBytes } from "node:crypto";
import type { FreigabeToken, Artikel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { schreibeAuditLog } from "@/lib/audit";
import { sendeMail } from "@/lib/mail";

export const FREIGABE_GUELTIGKEIT_TAGE = 14;

export function baueFreigabeUrl(token: string): string {
  const basis = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  return `${basis}/freigabe/${token}`;
}

export async function erstelleFreigabeToken(artikelId: string, kundeEmail: string): Promise<FreigabeToken> {
  const token = randomBytes(24).toString("base64url");
  const gueltigBis = new Date(Date.now() + FREIGABE_GUELTIGKEIT_TAGE * 24 * 60 * 60 * 1000);
  const eintrag = await prisma.freigabeToken.create({
    data: { artikelId, token, kundeEmail, gueltigBis, status: "OFFEN" },
  });
  await prisma.artikel.update({ where: { id: artikelId }, data: { status: "KUNDENFREIGABE" } });
  return eintrag;
}

export interface TokenPruefung {
  token: FreigabeToken & { artikel: Artikel };
  abgelaufen: boolean;
}

export async function ladeFreigabeToken(tokenWert: string): Promise<TokenPruefung | null> {
  const token = await prisma.freigabeToken.findUnique({
    where: { token: tokenWert },
    include: { artikel: true },
  });
  if (!token) {
    return null;
  }
  const abgelaufen = Boolean(token.gueltigBis && token.gueltigBis.getTime() < Date.now());
  if (abgelaufen && token.status === "OFFEN") {
    await prisma.freigabeToken.update({ where: { id: token.id }, data: { status: "ABGELAUFEN" } });
    token.status = "ABGELAUFEN";
  }
  return { token, abgelaufen: token.status === "ABGELAUFEN" };
}

export async function entscheideFreigabe(
  tokenWert: string,
  entscheidung: "FREIGEGEBEN" | "AENDERUNG_ANGEFRAGT",
  kommentar: string
): Promise<{ ok: boolean; meldung: string }> {
  const geladen = await ladeFreigabeToken(tokenWert);
  if (!geladen) {
    return { ok: false, meldung: "Der Freigabelink ist ungültig." };
  }
  if (geladen.abgelaufen) {
    return { ok: false, meldung: "Der Freigabelink ist abgelaufen. Bitte fordern Sie einen neuen Link an." };
  }
  if (geladen.token.status !== "OFFEN") {
    return { ok: false, meldung: "Für diesen Link wurde bereits eine Rückmeldung übermittelt." };
  }

  await prisma.freigabeToken.update({
    where: { id: geladen.token.id },
    data: { status: entscheidung, kommentar: kommentar || null },
  });
  await prisma.artikel.update({
    where: { id: geladen.token.artikelId },
    data: { status: entscheidung === "FREIGEGEBEN" ? "BEREIT" : "REVIEW" },
  });
  await schreibeAuditLog({
    artikelId: geladen.token.artikelId,
    aktion: entscheidung === "FREIGEGEBEN" ? "FREIGABE_ERTEILT" : "FREIGABE_AENDERUNG_ANGEFRAGT",
    details: { kundeEmail: geladen.token.kundeEmail, kommentar: kommentar || null },
  });

  // Benachrichtigung an alle Herausgeber
  const herausgeber = await prisma.user.findMany({ where: { rolle: "HERAUSGEBER" } });
  const betreff =
    entscheidung === "FREIGEGEBEN"
      ? `Sponsored-Freigabe erteilt: ${geladen.token.artikel.titel}`
      : `Änderung angefragt: ${geladen.token.artikel.titel}`;
  const text =
    `Der Kunde (${geladen.token.kundeEmail}) hat zum Artikel "${geladen.token.artikel.titel}" ` +
    (entscheidung === "FREIGEGEBEN"
      ? "die Freigabe erteilt. Der Artikel steht jetzt auf BEREIT."
      : "eine Änderung angefragt. Der Artikel steht wieder auf REVIEW.") +
    (kommentar ? `\n\nKommentar des Kunden:\n${kommentar}` : "") +
    `\n\nVTM Studio`;
  for (const empfaenger of herausgeber) {
    try {
      await sendeMail({ an: empfaenger.email, betreff, text });
    } catch (fehler) {
      console.error("Benachrichtigung konnte nicht versendet werden:", fehler);
    }
  }

  return {
    ok: true,
    meldung:
      entscheidung === "FREIGEGEBEN"
        ? "Vielen Dank, die Freigabe wurde übermittelt. Die Redaktion wurde benachrichtigt."
        : "Vielen Dank, Ihre Änderungsanfrage wurde übermittelt. Die Redaktion meldet sich bei Ihnen.",
  };
}
