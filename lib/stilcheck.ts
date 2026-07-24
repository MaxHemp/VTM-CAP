// VTM-Stilcheck: prüft eine Ghost-Single-Card auf Stil, Struktur und
// E-Mail-Sicherheit. Testgetrieben deckungsgleich portiert aus
// brand-rules/scripts/stilcheck.py – Prüfregeln und Meldungstexte
// entsprechen dem Python-Original (das dort auf der aus der <pre>-Box
// extrahierten, entity-dekodierten Card arbeitet; hier kommt die
// Card-HTML direkt herein).
import { dekodiereEntities } from "@/lib/entities";

export interface StilcheckErgebnis {
  wortzahl: number;
  gradients: number;
  fehler: string[];
  warnungen: string[];
  bestanden: boolean;
}

const BUZZWORDS = [
  "revolutionär",
  "disruptiv",
  "Gamechanger",
  "Game Changer",
  "bahnbrechend",
  "einzigartig",
  "sensationell",
  "zukunftsweisend",
  "alternativlos",
  "nahtlos",
  "Kundenfokus",
];

const EMAIL_UNSICHER: Array<[string, string]> = [
  ["<style", "<style>-Block in der Card"],
  ["display:flex", "Flexbox"],
  ["display: flex", "Flexbox"],
  ["display:grid", "CSS-Grid"],
  ["display: grid", "CSS-Grid"],
  ["<svg", "Inline-SVG"],
  ["::before", "Pseudo-Element"],
  ["::after", "Pseudo-Element"],
  ['class="vtm', "CSS-Klassen"],
];

function zaehleVorkommen(text: string, suchwert: string): number {
  let anzahl = 0;
  let index = text.indexOf(suchwert);
  while (index !== -1) {
    anzahl += 1;
    index = text.indexOf(suchwert, index + suchwert.length);
  }
  return anzahl;
}

export function pruefeCard(card: string, optionen: { sponsored?: boolean } = {}): StilcheckErgebnis {
  const sponsored = optionen.sponsored ?? false;
  const text = dekodiereEntities(card.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  const fehler: string[] = [];
  const warnungen: string[] = [];

  // --- Stil ---
  const wortzahl = text.length === 0 ? 0 : text.split(" ").length;
  if (text.includes("—")) {
    fehler.push(`Em-Dash gefunden (${zaehleVorkommen(text, "—")}x)`);
  }
  if (/ – /.test(text)) {
    fehler.push("En-Dash als Satzunterbrecher gefunden");
  }
  for (const buzzword of BUZZWORDS) {
    if (text.toLowerCase().includes(buzzword.toLowerCase())) {
      fehler.push(`Buzzword: ${buzzword}`);
    }
  }

  // --- E-Mail-Sicherheit ---
  for (const [schluessel, beschreibung] of EMAIL_UNSICHER) {
    if (card.includes(schluessel)) {
      fehler.push(`E-Mail-unsicher: ${beschreibung}`);
    }
  }

  // Web-Theme-Override-Prüfung
  const tabellen = card.match(/<table[^>]*>/g) ?? [];
  const tds = card.match(/<td[^>]*>/g) ?? [];
  const tabellenOhneOverride = tabellen.filter((t) => !t.includes("white-space:normal"));
  const tdsOhneBorder = tds.filter((t) => !t.includes("border:0"));
  if (tabellenOhneOverride.length > 0) {
    fehler.push(
      `${tabellenOhneOverride.length} Tabelle(n) ohne Web-Theme-Override (display:table; white-space:normal)`
    );
  }
  if (tdsOhneBorder.length > 0) {
    fehler.push(`${tdsOhneBorder.length} td(s) ohne border:0-Override`);
  }
  const tabellenOhneBgImage = tabellen.filter((t) => !t.includes("background-image:none"));
  const tdsOhneBgImage = tds.filter((t) => !t.includes("background-image:none"));
  if (tabellenOhneBgImage.length > 0) {
    fehler.push(`${tabellenOhneBgImage.length} Tabelle(n) ohne background-image:none (Theme-Schatten-Bilder!)`);
  }
  if (tdsOhneBgImage.length > 0) {
    fehler.push(`${tdsOhneBgImage.length} td(s) ohne background-image:none (Theme-Weiss-Gradient uebermalt Akzente!)`);
  }

  const gradients = zaehleVorkommen(card, "linear-gradient");
  const gradientTabellenOhneFallback = card.match(/<table(?![^>]*bgcolor)[^>]*linear-gradient/g) ?? [];
  if (gradientTabellenOhneFallback.length > 0) {
    fehler.push(`${gradientTabellenOhneFallback.length} Gradient-Tabelle(n) ohne bgcolor-Fallback`);
  }

  // --- Struktur (Redaktionsanleitung) ---
  const body = card.split("</style>").pop() ?? card;
  const struktur: Record<string, boolean> = {
    "App-Hinweisblock": body.includes("iOS App lesen"),
    "App-Block ist erstes sichtbares Element":
      body.indexOf("iOS App lesen") < 2500 && body.indexOf("iOS App lesen") !== -1,
    "Kategorie-Zeile ( | )": /[A-Za-zÄÖÜ].{0,40}\|.{0,40}(Einordnung|Analyse|Kommentar|Leitfaden|Praxis-Case|Case)/.test(
      text
    ),
    "Das Wichtigste": text.includes("Das Wichtigste"),
    "Quellen-Box": text.includes("Quellen") || text.includes("Quelle"),
    "Genau 1 CTA-Button":
      zaehleVorkommen(body, "display:inline-block; padding:12px 26px") +
        zaehleVorkommen(body, "display:inline-block; padding:13px 26px") ===
      1,
  };
  if (!sponsored) {
    struktur["Gegenargumente und Grenzen"] = text.includes("Gegenargumente");
    struktur["Was-tun-Abschnitt"] =
      text.includes("tun sollten") || text.includes("Konsequenzen") || text.includes("Standortbestimmung");
    struktur["Fazit"] = text.includes("Fazit");
  } else {
    struktur["Sponsored-Kennzeichnung (Anzeige)"] = text.includes("Anzeige");
    struktur["Sponsored-Footer (Kooperation)"] = text.includes("Kooperation");
    if (text.includes("Gegenargumente")) {
      warnungen.push("Sponsored: Gegenargumente-Abschnitt gefunden (sollte entfallen)");
    }
  }

  for (const [name, ok] of Object.entries(struktur)) {
    if (!ok) {
      fehler.push(`Struktur fehlt/verletzt: ${name}`);
    }
  }

  if (body.includes("#LINK-")) {
    warnungen.push("Platzhalter-Link (#LINK-...) noch nicht ersetzt");
  }

  return { wortzahl, gradients, fehler, warnungen, bestanden: fehler.length === 0 };
}
