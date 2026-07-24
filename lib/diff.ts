// Vergleich Kundentext ↔ Card-Fließtext für die Sponsored-Freigabe (M5).
//
// Normalisierung: NUR Typografie-Änderungen gelten als gleich (Em-/En-Dash-
// Bereinigung, typografische Anführungszeichen, geschützte Leerzeichen,
// Whitespace). Der Badge „Text 1:1 übernommen" erscheint nur, wenn jeder
// Satz des Kundentexts normalisiert unverändert im Card-Fließtext steht
// (Hash-Vergleich der normalisierten Sätze).
import { createHash } from "node:crypto";

export function normalisiereTypografie(text: string): string {
  return text
    .replace(/ /g, " ") // geschütztes Leerzeichen
    .replace(/\s*—\s*/g, " ") // Em-Dash-Unterbrecher
    .replace(/\s+–\s+/g, " ") // En-Dash-Unterbrecher
    .replace(/[,;:]/g, " ") // Binnen-Interpunktion (Dash-↔-Komma-Bereinigung gilt als gleich)
    .replace(/[„“”«»]/g, '"')
    .replace(/[‚‘’‹›]/g, "'")
    .replace(/…/g, "...")
    .replace(/\s+([.!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalisierterHash(text: string): string {
  return createHash("sha256").update(normalisiereTypografie(text).toLowerCase(), "utf8").digest("hex");
}

export function zerlegeInSaetze(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((satz) => satz.trim())
    .filter((satz) => satz.length > 0);
}

export interface SatzVergleich {
  satz: string;
  uebernommen: boolean;
}

export interface UebernahmePruefung {
  saetze: SatzVergleich[];
  gesamt: number;
  uebernommen: number;
  einsZuEins: boolean;
}

// Prüft satzweise, ob der Kundentext (normalisiert) unverändert im
// Card-Fließtext enthalten ist.
export function pruefeTextUebernahme(kundentext: string, cardFliesstext: string): UebernahmePruefung {
  const kundenSaetze = zerlegeInSaetze(kundentext);
  const cardSatzHashes = new Set(zerlegeInSaetze(cardFliesstext).map((satz) => normalisierterHash(satz)));
  const normalisierteCard = normalisiereTypografie(cardFliesstext).toLowerCase();

  const saetze: SatzVergleich[] = kundenSaetze.map((satz) => {
    const hash = normalisierterHash(satz);
    const uebernommen =
      cardSatzHashes.has(hash) || normalisierteCard.includes(normalisiereTypografie(satz).toLowerCase());
    return { satz, uebernommen };
  });

  const uebernommenAnzahl = saetze.filter((eintrag) => eintrag.uebernommen).length;
  return {
    saetze,
    gesamt: saetze.length,
    uebernommen: uebernommenAnzahl,
    einsZuEins: saetze.length > 0 && uebernommenAnzahl === saetze.length,
  };
}
