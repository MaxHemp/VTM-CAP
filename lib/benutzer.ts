// Benutzerverwaltung (Einladungs-Prinzip): Die Anmeldung ist auf hinterlegte
// E-Mail-Adressen beschränkt. Zugänge werden von der Rolle Herausgeber unter
// Einstellungen vergeben; die Einladung verschickt einen Link zur Login-Seite
// (passwortlos, Magic-Link).
import type { Rolle } from "@prisma/client";
import { baueAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/db";
import { sendeMail } from "@/lib/mail";

export function normalisiereEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function pruefeEmailFormat(email: string): string | null {
  const bereinigt = normalisiereEmail(email);
  if (!bereinigt) {
    return "Bitte geben Sie eine E-Mail-Adresse an.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(bereinigt)) {
    return `„${bereinigt}“ ist keine gültige E-Mail-Adresse.`;
  }
  return null;
}

// Anmeldung nur für eingeladene (= bereits angelegte) Benutzer.
export async function istAnmeldungErlaubt(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }
  const benutzer = await prisma.user.findUnique({
    where: { email: normalisiereEmail(email) },
    select: { id: true },
  });
  return Boolean(benutzer);
}

export function baueEinladungsMail(eintrag: { name: string | null; rolle: Rolle }): {
  betreff: string;
  text: string;
} {
  const anrede = eintrag.name ? `Guten Tag ${eintrag.name},` : "Guten Tag,";
  const rollenText = eintrag.rolle === "HERAUSGEBER" ? "Herausgeber" : "Redakteur";
  const loginUrl = `${baueAppUrl()}/login`;
  return {
    betreff: "Ihr Zugang zu VTM Studio",
    text:
      `${anrede}\n\n` +
      `für Sie wurde ein Zugang zur Redaktionsplattform VTM Studio angelegt (Rolle: ${rollenText}).\n\n` +
      `So melden Sie sich an:\n` +
      `1. Öffnen Sie ${loginUrl}\n` +
      `2. Geben Sie diese E-Mail-Adresse ein.\n` +
      `3. Sie erhalten einen Anmeldelink per E-Mail – ein Passwort gibt es nicht.\n\n` +
      `VersicherungsTech Magazin`,
  };
}

export async function ladeBenutzerEin(eintrag: {
  email: string;
  name: string | null;
  rolle: Rolle;
}): Promise<{ id: string; email: string }> {
  const email = normalisiereEmail(eintrag.email);
  const formatFehler = pruefeEmailFormat(email);
  if (formatFehler) {
    throw new Error(formatFehler);
  }
  const vorhanden = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (vorhanden) {
    throw new Error(`Für „${email}“ existiert bereits ein Zugang.`);
  }
  const benutzer = await prisma.user.create({
    data: { email, name: eintrag.name?.trim() || null, rolle: eintrag.rolle },
  });
  const mail = baueEinladungsMail({ name: benutzer.name, rolle: benutzer.rolle });
  await sendeMail({ an: email, betreff: mail.betreff, text: mail.text });
  return { id: benutzer.id, email };
}

// Schutzregel: Es muss immer mindestens ein Herausgeber übrig bleiben.
export async function zaehleWeitereHerausgeber(ausserBenutzerId: string): Promise<number> {
  return prisma.user.count({
    where: { rolle: "HERAUSGEBER", id: { not: ausserBenutzerId } },
  });
}
