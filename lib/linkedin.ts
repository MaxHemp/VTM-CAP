// LinkedIn-Schicht (M4).
//
// Nicht-Ziel v1: Es gibt KEIN direktes Posting über die LinkedIn API –
// Redakteure kopieren den Text bzw. laden das Beitragsbild herunter. Die
// API-Anbindung ist hier als sauber gekapselter Stub vorbereitet, damit sie
// später ohne Umbau andocken kann.

export type LinkedInKanalTyp = "VTM" | "PERSONAL";

export interface LinkedInPostEntwurf {
  kanal: LinkedInKanalTyp;
  text: string;
}

export interface LinkedInVeroeffentlichung {
  veroeffentlichePost(entwurf: LinkedInPostEntwurf): Promise<{ postUrn: string }>;
}

// Stub: bewusst nicht implementiert (v1 = Copy/Download).
export class LinkedInApiStub implements LinkedInVeroeffentlichung {
  async veroeffentlichePost(): Promise<{ postUrn: string }> {
    throw new Error(
      "Direktes LinkedIn-Posting ist in dieser Version bewusst nicht angebunden. Bitte kopieren Sie den Text und posten Sie manuell."
    );
  }
}

export const KANAL_HINWEISE: Record<LinkedInKanalTyp, string> = {
  VTM: "Unternehmensprofil, Sie-Form: These-Hook, Faktenabsätze, genau 3 ▪️-Bullets als vollständige Sätze, Abschluss „Jetzt lesen und mitdiskutieren.“, 5 Hashtags.",
  PERSONAL: "Persönliches Profil, Du-Form: nahbarer Einstieg, gleiche Faktentreue, persönliche Einordnung statt Corporate-Sprache.",
};

export interface VtmPostPruefung {
  verstoesse: string[];
  bestanden: boolean;
}

// Prüft die harten Formatregeln des VTM-Kanals (Auftrag M4):
// genau 3 ▪️-Bullets als vollständige Sätze, Abschluss
// „Jetzt lesen und mitdiskutieren.", 5 Hashtags, keine Em-Dashes,
// keine Emojis außer ▪️.
export function pruefeVtmPost(text: string): VtmPostPruefung {
  const verstoesse: string[] = [];

  const bulletZeilen = text.split("\n").filter((zeile) => zeile.trim().startsWith("▪️"));
  if (bulletZeilen.length !== 3) {
    verstoesse.push(`Erwartet: genau 3 ▪️-Bullets, gefunden: ${bulletZeilen.length}`);
  }
  for (const zeile of bulletZeilen) {
    const inhalt = zeile.replace("▪️", "").trim();
    if (!/[.!?]$/.test(inhalt)) {
      verstoesse.push(`Bullet ist kein vollständiger Satz: „${inhalt.slice(0, 40)}…“`);
    }
  }

  if (!text.includes("Jetzt lesen und mitdiskutieren.")) {
    verstoesse.push("Abschlusssatz „Jetzt lesen und mitdiskutieren.“ fehlt");
  }

  const hashtags = text.match(/#[\wÄÖÜäöüß]+/g) ?? [];
  if (hashtags.length !== 5) {
    verstoesse.push(`Erwartet: genau 5 Hashtags, gefunden: ${hashtags.length}`);
  }

  if (text.includes("—")) {
    verstoesse.push("Em-Dash gefunden");
  }

  // Emojis außer ▪️ (Bullet-Zeichen + Variation Selector sind erlaubt)
  const ohneBullet = text.replaceAll("▪️", "");
  const emojiRegex = /\p{Extended_Pictographic}/u;
  if (emojiRegex.test(ohneBullet)) {
    verstoesse.push("Emoji gefunden (erlaubt ist nur ▪️)");
  }

  return { verstoesse, bestanden: verstoesse.length === 0 };
}
