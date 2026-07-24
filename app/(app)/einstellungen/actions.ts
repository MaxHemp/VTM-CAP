"use server";

import { revalidatePath } from "next/cache";
import { auth, requireRecht } from "@/lib/auth";
import { schreibeAuditLog } from "@/lib/audit";
import { ladeBenutzerEin, normalisiereEmail, pruefeEmailFormat, zaehleWeitereTeamverwalter } from "@/lib/benutzer";
import { prisma } from "@/lib/db";
import { ladeGhostZugang, speichereEinstellungen, vermerkeGhostAbgleich } from "@/lib/einstellungen";
import { testeGhostVerbindung } from "@/lib/ghost";
import { RECHTE, extrahiereRechte, type RechteSatz } from "@/lib/rollen";

export interface AktionsErgebnis {
  ok: boolean;
  meldung: string;
}

function fehlerMeldung(fehler: unknown, fallback: string): string {
  return fehler instanceof Error ? fehler.message : fallback;
}

function rechteAusFormular(formData: FormData): RechteSatz {
  return extrahiereRechte(
    Object.fromEntries(RECHTE.map(({ schluessel }) => [schluessel, formData.get(`recht-${schluessel}`) === "on"]))
  );
}

// ── Ghost- und Redaktionseinstellungen ──────────────────────────────────────

export async function speichereGhostEinstellungenAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("einstellungenVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const ghostUrl = String(formData.get("ghostUrl") ?? "").trim();
  const ghostAdminApiKey = String(formData.get("ghostAdminApiKey") ?? "").trim();

  try {
    await speichereEinstellungen({
      ghostUrl,
      ...(ghostAdminApiKey ? { ghostAdminApiKey } : {}),
    });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "EINSTELLUNGEN_GHOST_GESPEICHERT",
      details: { ghostUrl, keyGeaendert: Boolean(ghostAdminApiKey) },
    });
    revalidatePath("/einstellungen");
    return {
      ok: true,
      meldung: ghostAdminApiKey
        ? "Ghost-URL und Admin API Key wurden gespeichert. Der Key liegt verschlüsselt in der Datenbank."
        : "Ghost-URL wurde gespeichert.",
    };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Speichern fehlgeschlagen.") };
  }
}

export async function testeGhostVerbindungAction(
  _vorher: AktionsErgebnis | null
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("einstellungenVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const zugang = await ladeGhostZugang();
  if (!zugang) {
    return {
      ok: false,
      meldung: "Bitte zuerst Ghost-URL und Admin API Key speichern, danach die Verbindung testen.",
    };
  }

  const ergebnis = await testeGhostVerbindung(zugang.url, zugang.adminApiKey);
  await vermerkeGhostAbgleich(ergebnis.ok ? "OK" : `FEHLER: ${ergebnis.fehler ?? "unbekannt"}`);
  await schreibeAuditLog({
    userId: session.user.id,
    aktion: "EINSTELLUNGEN_GHOST_VERBINDUNGSTEST",
    details: { ok: ergebnis.ok, fehler: ergebnis.fehler ?? null },
  });
  revalidatePath("/einstellungen");

  if (!ergebnis.ok) {
    return { ok: false, meldung: ergebnis.fehler ?? "Verbindungstest fehlgeschlagen." };
  }
  return {
    ok: true,
    meldung: `Verbindung erfolgreich: „${ergebnis.titel ?? "Ghost-Site"}“ (Ghost ${ergebnis.version ?? "unbekannte Version"}).`,
  };
}

export async function speichereRedaktionEinstellungenAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("einstellungenVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const anthropicApiKey = String(formData.get("anthropicApiKey") ?? "").trim();
  const ctaStandardUrl = String(formData.get("ctaStandardUrl") ?? "").trim();
  const ctaStandardLabel = String(formData.get("ctaStandardLabel") ?? "").trim();

  try {
    await speichereEinstellungen({
      ...(anthropicApiKey ? { anthropicApiKey } : {}),
      ctaStandardUrl,
      ctaStandardLabel,
    });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "EINSTELLUNGEN_REDAKTION_GESPEICHERT",
      details: { keyGeaendert: Boolean(anthropicApiKey), ctaStandardUrl },
    });
    revalidatePath("/einstellungen");
    return { ok: true, meldung: "Die Redaktionseinstellungen wurden gespeichert." };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Speichern fehlgeschlagen.") };
  }
}

// ── Eigenes Profil ──────────────────────────────────────────────────────────

export async function aktualisiereProfilAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, meldung: "Nicht angemeldet." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = normalisiereEmail(String(formData.get("email") ?? ""));
  const formatFehler = pruefeEmailFormat(email);
  if (formatFehler) {
    return { ok: false, meldung: formatFehler };
  }

  try {
    const anderer = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (anderer && anderer.id !== session.user.id) {
      return { ok: false, meldung: `„${email}“ wird bereits von einem anderen Zugang verwendet.` };
    }
    const vorher = await prisma.user.findUnique({ where: { id: session.user.id } });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name || null, email },
    });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "PROFIL_AKTUALISIERT",
      details: { emailVorher: vorher?.email, emailNachher: email },
    });
    revalidatePath("/einstellungen");
    const emailGeaendert = vorher?.email !== email;
    return {
      ok: true,
      meldung: emailGeaendert
        ? `Ihr Profil wurde gespeichert. Künftige Anmeldelinks gehen an ${email}.`
        : "Ihr Profil wurde gespeichert.",
    };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Speichern fehlgeschlagen.") };
  }
}

// ── Team und Zugänge ────────────────────────────────────────────────────────

export async function ladeBenutzerEinAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("teamVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const email = String(formData.get("email") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const rolleId = String(formData.get("rolleId") ?? "");

  try {
    const benutzer = await ladeBenutzerEin({ email, name, rolleId });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "BENUTZER_EINGELADEN",
      details: { email: benutzer.email, rolle: benutzer.rollenName },
    });
    revalidatePath("/einstellungen");
    return {
      ok: true,
      meldung: `${benutzer.email} wurde eingeladen (Rolle „${benutzer.rollenName}“) und kann sich jetzt anmelden. Die Einladung wurde per E-Mail versendet.`,
    };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Die Einladung ist fehlgeschlagen.") };
  }
}

export async function aktualisiereBenutzerAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("teamVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const benutzerId = String(formData.get("benutzerId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = normalisiereEmail(String(formData.get("email") ?? ""));
  const rolleId = String(formData.get("rolleId") ?? "");

  const formatFehler = pruefeEmailFormat(email);
  if (formatFehler) {
    return { ok: false, meldung: formatFehler };
  }

  try {
    const benutzer = await prisma.user.findUnique({ where: { id: benutzerId }, include: { rolle: true } });
    if (!benutzer) {
      return { ok: false, meldung: "Der Benutzer wurde nicht gefunden." };
    }
    const neueRolle = await prisma.benutzerRolle.findUnique({ where: { id: rolleId } });
    if (!neueRolle) {
      return { ok: false, meldung: "Die gewählte Rolle existiert nicht (mehr). Bitte laden Sie die Seite neu." };
    }
    const anderer = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (anderer && anderer.id !== benutzerId) {
      return { ok: false, meldung: `„${email}“ wird bereits von einem anderen Zugang verwendet.` };
    }
    if (
      benutzer.rolle.teamVerwalten &&
      !neueRolle.teamVerwalten &&
      (await zaehleWeitereTeamverwalter(benutzerId)) === 0
    ) {
      return {
        ok: false,
        meldung:
          "Dieser Zugang ist der letzte mit dem Recht „Team verwalten“. Geben Sie das Recht zuerst einer anderen Person, sonst sperren Sie die Verwaltung aus.",
      };
    }
    await prisma.user.update({
      where: { id: benutzerId },
      data: { name: name || null, email, rolleId },
    });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "BENUTZER_AKTUALISIERT",
      details: {
        benutzer: email,
        rolleVorher: benutzer.rolle.name,
        rolleNachher: neueRolle.name,
        emailVorher: benutzer.email,
      },
    });
    revalidatePath("/einstellungen");
    return { ok: true, meldung: `Der Zugang von ${email} wurde aktualisiert (Rolle „${neueRolle.name}“).` };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Speichern fehlgeschlagen.") };
  }
}

export async function entferneBenutzerAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("teamVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const benutzerId = String(formData.get("benutzerId") ?? "");

  try {
    if (benutzerId === session.user.id) {
      return { ok: false, meldung: "Sie können Ihren eigenen Zugang nicht entfernen." };
    }
    const benutzer = await prisma.user.findUnique({ where: { id: benutzerId }, include: { rolle: true } });
    if (!benutzer) {
      return { ok: false, meldung: "Der Benutzer wurde nicht gefunden." };
    }
    if (benutzer.rolle.teamVerwalten && (await zaehleWeitereTeamverwalter(benutzerId)) === 0) {
      return { ok: false, meldung: "Der letzte Zugang mit dem Recht „Team verwalten“ kann nicht entfernt werden." };
    }
    await prisma.user.delete({ where: { id: benutzerId } });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "BENUTZER_ENTFERNT",
      details: { email: benutzer.email, rolle: benutzer.rolle.name },
    });
    revalidatePath("/einstellungen");
    return {
      ok: true,
      meldung: `Der Zugang von ${benutzer.email} wurde entfernt. Bereits hochgeladene Artikel bleiben erhalten.`,
    };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Das Entfernen ist fehlgeschlagen.") };
  }
}

// ── Rollen ──────────────────────────────────────────────────────────────────

export async function erstelleRolleAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("teamVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const beschreibung = String(formData.get("beschreibung") ?? "").trim() || null;
  const rechte = rechteAusFormular(formData);

  if (!name) {
    return { ok: false, meldung: "Bitte geben Sie einen Rollennamen an." };
  }

  try {
    const vorhanden = await prisma.benutzerRolle.findUnique({ where: { name } });
    if (vorhanden) {
      return { ok: false, meldung: `Eine Rolle „${name}“ existiert bereits.` };
    }
    await prisma.benutzerRolle.create({ data: { name, beschreibung, ...rechte } });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "ROLLE_ERSTELLT",
      details: { name, rechte },
    });
    revalidatePath("/einstellungen");
    return { ok: true, meldung: `Die Rolle „${name}“ wurde angelegt und kann jetzt zugewiesen werden.` };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Anlegen fehlgeschlagen.") };
  }
}

export async function aktualisiereRolleAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("teamVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const rolleId = String(formData.get("rolleId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const beschreibung = String(formData.get("beschreibung") ?? "").trim() || null;
  const rechte = rechteAusFormular(formData);

  if (!name) {
    return { ok: false, meldung: "Bitte geben Sie einen Rollennamen an." };
  }

  try {
    const rolle = await prisma.benutzerRolle.findUnique({ where: { id: rolleId } });
    if (!rolle) {
      return { ok: false, meldung: "Die Rolle wurde nicht gefunden." };
    }
    if (rolle.istSystem) {
      return { ok: false, meldung: "Die Systemrollen „Herausgeber“ und „Redakteur“ sind nicht änderbar." };
    }
    const gleicherName = await prisma.benutzerRolle.findUnique({ where: { name } });
    if (gleicherName && gleicherName.id !== rolleId) {
      return { ok: false, meldung: `Eine Rolle „${name}“ existiert bereits.` };
    }
    if (rolle.teamVerwalten && !rechte.teamVerwalten) {
      // Aussperr-Schutz: bliebe nach der Änderung niemand mit Team-Recht übrig?
      const verwalterAusserhalb = await prisma.user.count({
        where: { rolle: { teamVerwalten: true, id: { not: rolleId } } },
      });
      if (verwalterAusserhalb === 0) {
        return {
          ok: false,
          meldung:
            "Diese Änderung würde das Recht „Team verwalten“ vollständig entfernen und alle aussperren. Weisen Sie das Recht zuerst einer anderen Rolle mit Benutzern zu.",
        };
      }
    }
    await prisma.benutzerRolle.update({ where: { id: rolleId }, data: { name, beschreibung, ...rechte } });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "ROLLE_AKTUALISIERT",
      details: { name, rechte },
    });
    revalidatePath("/einstellungen");
    return { ok: true, meldung: `Die Rolle „${name}“ wurde gespeichert. Änderungen greifen sofort für alle Benutzer dieser Rolle.` };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Speichern fehlgeschlagen.") };
  }
}

export async function loescheRolleAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("teamVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const rolleId = String(formData.get("rolleId") ?? "");

  try {
    const rolle = await prisma.benutzerRolle.findUnique({
      where: { id: rolleId },
      include: { _count: { select: { benutzer: true } } },
    });
    if (!rolle) {
      return { ok: false, meldung: "Die Rolle wurde nicht gefunden." };
    }
    if (rolle.istSystem) {
      return { ok: false, meldung: "Die Systemrollen „Herausgeber“ und „Redakteur“ können nicht gelöscht werden." };
    }
    if (rolle._count.benutzer > 0) {
      return {
        ok: false,
        meldung: `Die Rolle „${rolle.name}“ ist noch ${rolle._count.benutzer === 1 ? "einem Zugang" : `${rolle._count.benutzer} Zugängen`} zugewiesen. Weisen Sie diesen zuerst eine andere Rolle zu.`,
      };
    }
    await prisma.benutzerRolle.delete({ where: { id: rolleId } });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "ROLLE_GELOESCHT",
      details: { name: rolle.name },
    });
    revalidatePath("/einstellungen");
    return { ok: true, meldung: `Die Rolle „${rolle.name}“ wurde gelöscht.` };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Löschen fehlgeschlagen.") };
  }
}