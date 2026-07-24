"use server";

import { revalidatePath } from "next/cache";
import { requireRolle } from "@/lib/auth";
import { schreibeAuditLog } from "@/lib/audit";
import { ladeGhostZugang, speichereEinstellungen, vermerkeGhostAbgleich } from "@/lib/einstellungen";
import { testeGhostVerbindung } from "@/lib/ghost";

export interface AktionsErgebnis {
  ok: boolean;
  meldung: string;
}

function fehlerMeldung(fehler: unknown, fallback: string): string {
  return fehler instanceof Error ? fehler.message : fallback;
}

export async function speichereGhostEinstellungenAction(
  _vorher: AktionsErgebnis | null,
  formData: FormData
): Promise<AktionsErgebnis> {
  let session;
  try {
    session = await requireRolle("HERAUSGEBER");
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
  try {
    await requireRolle("HERAUSGEBER");
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
  const session = await requireRolle("HERAUSGEBER");
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
    session = await requireRolle("HERAUSGEBER");
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
