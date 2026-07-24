"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ArtikelFormat, ArtikelStatus } from "@prisma/client";
import { requireRecht } from "@/lib/auth";
import { schreibeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { FORMAT_LABELS, STATUS_LABELS } from "@/lib/status";

export interface AktionsErgebnis {
  ok: boolean;
  meldung: string;
}

function fehlerMeldung(fehler: unknown, fallback: string): string {
  return fehler instanceof Error ? fehler.message : fallback;
}

export async function aktualisiereArtikelAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("artikelVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const artikelId = String(formData.get("artikelId") ?? "");
  const titel = String(formData.get("titel") ?? "").trim();
  const kategorie = String(formData.get("kategorie") ?? "").trim() || null;
  const format = String(formData.get("format") ?? "") as ArtikelFormat;
  const status = String(formData.get("status") ?? "") as ArtikelStatus;
  const sponsored = formData.get("sponsored") === "on";
  const kunde = String(formData.get("kunde") ?? "").trim() || null;

  if (!titel) {
    return { ok: false, meldung: "Bitte geben Sie einen Titel an." };
  }
  if (!(format in FORMAT_LABELS)) {
    return { ok: false, meldung: "Unbekanntes Format." };
  }
  if (!(status in STATUS_LABELS)) {
    return { ok: false, meldung: "Unbekannter Status." };
  }
  if (sponsored && !kunde) {
    return { ok: false, meldung: "Bei Sponsored Content geben Sie bitte den Kundennamen an." };
  }

  try {
    const vorher = await prisma.artikel.findUnique({ where: { id: artikelId } });
    if (!vorher) {
      return { ok: false, meldung: "Der Artikel wurde nicht gefunden." };
    }
    await prisma.artikel.update({
      where: { id: artikelId },
      data: { titel, kategorie, format, status, sponsored, kunde: sponsored ? kunde : null },
    });
    await schreibeAuditLog({
      userId: session.user.id,
      artikelId,
      aktion: "ARTIKEL_BEARBEITET",
      details: {
        titel,
        statusVorher: vorher.status,
        statusNachher: status,
        format,
        sponsored,
      },
    });
    revalidatePath("/pipeline");
    revalidatePath(`/artikel/${artikelId}`);
    return { ok: true, meldung: "Die Änderungen wurden gespeichert." };
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Speichern fehlgeschlagen.") };
  }
}

export async function loescheArtikelAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRecht("artikelVerwalten");
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Keine Berechtigung.") };
  }

  const artikelId = String(formData.get("artikelId") ?? "");
  const artikel = await prisma.artikel.findUnique({ where: { id: artikelId } });
  if (!artikel) {
    return { ok: false, meldung: "Der Artikel wurde nicht gefunden." };
  }

  try {
    // Löscht kaskadierend Uploads, Jobs, LinkedIn-Posts und Freigabelinks.
    // Der Audit-Eintrag wird ohne Artikelbezug geschrieben, damit er das
    // Löschen überdauert.
    await prisma.artikel.delete({ where: { id: artikelId } });
    await schreibeAuditLog({
      userId: session.user.id,
      aktion: "ARTIKEL_GELOESCHT",
      details: { titel: artikel.titel, status: artikel.status, sponsored: artikel.sponsored },
    });
  } catch (fehler) {
    return { ok: false, meldung: fehlerMeldung(fehler, "Löschen fehlgeschlagen.") };
  }
  revalidatePath("/pipeline");
  redirect("/pipeline");
}
