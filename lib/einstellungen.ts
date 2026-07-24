// Zugriff auf die Singleton-Einstellungen. API-Keys werden ausschließlich
// verschlüsselt gespeichert (lib/crypto.ts) und nur maskiert ausgegeben.
import { prisma } from "@/lib/db";
import { entschluesseln, maskieren, verschluesseln } from "@/lib/crypto";

const SINGLETON_ID = "singleton";

export interface EinstellungenAnzeige {
  ghostUrl: string;
  ghostAdminApiKeyMaskiert: string | null;
  anthropicApiKeyMaskiert: string | null;
  ctaStandardUrl: string;
  ctaStandardLabel: string;
  letzterGhostAbgleich: Date | null;
  letzterGhostStatus: string | null;
}

export async function ladeEinstellungen() {
  return prisma.einstellung.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function ladeEinstellungenFuerAnzeige(): Promise<EinstellungenAnzeige> {
  const e = await ladeEinstellungen();
  return {
    ghostUrl: e.ghostUrl ?? "",
    ghostAdminApiKeyMaskiert: e.ghostAdminApiKey ? maskieren(entschluesseln(e.ghostAdminApiKey)) : null,
    anthropicApiKeyMaskiert: e.anthropicApiKey ? maskieren(entschluesseln(e.anthropicApiKey)) : null,
    ctaStandardUrl: e.ctaStandardUrl ?? "",
    ctaStandardLabel: e.ctaStandardLabel ?? "AI Insurance Briefing abonnieren",
    letzterGhostAbgleich: e.letzterGhostAbgleich,
    letzterGhostStatus: e.letzterGhostStatus,
  };
}

export interface EinstellungenUpdate {
  ghostUrl?: string;
  ghostAdminApiKey?: string;
  anthropicApiKey?: string;
  ctaStandardUrl?: string;
  ctaStandardLabel?: string;
}

export async function speichereEinstellungen(update: EinstellungenUpdate) {
  await ladeEinstellungen();
  return prisma.einstellung.update({
    where: { id: SINGLETON_ID },
    data: {
      ...(update.ghostUrl !== undefined ? { ghostUrl: update.ghostUrl || null } : {}),
      ...(update.ghostAdminApiKey ? { ghostAdminApiKey: verschluesseln(update.ghostAdminApiKey) } : {}),
      ...(update.anthropicApiKey ? { anthropicApiKey: verschluesseln(update.anthropicApiKey) } : {}),
      ...(update.ctaStandardUrl !== undefined ? { ctaStandardUrl: update.ctaStandardUrl || null } : {}),
      ...(update.ctaStandardLabel !== undefined ? { ctaStandardLabel: update.ctaStandardLabel || null } : {}),
    },
  });
}

export async function ladeGhostZugang(): Promise<{ url: string; adminApiKey: string } | null> {
  const e = await ladeEinstellungen();
  if (!e.ghostUrl || !e.ghostAdminApiKey) {
    return null;
  }
  return { url: e.ghostUrl, adminApiKey: entschluesseln(e.ghostAdminApiKey) };
}

export async function vermerkeGhostAbgleich(status: string) {
  await ladeEinstellungen();
  return prisma.einstellung.update({
    where: { id: SINGLETON_ID },
    data: { letzterGhostAbgleich: new Date(), letzterGhostStatus: status },
  });
}
