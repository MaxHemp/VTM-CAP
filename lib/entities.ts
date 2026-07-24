// HTML-Entity-Dekodierung, deckungsgleich zum Verhalten von Pythons
// html.unescape() für die in VTM-Cards verwendeten Entities
// (numerisch dezimal/hex plus gebräuchliche benannte Entities).

const BENANNTE_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  euro: "€",
  sect: "§",
  middot: "·",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  bdquo: "„",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  sbquo: "‚",
  laquo: "«",
  raquo: "»",
};

export function dekodiereEntities(eingabe: string): string {
  return eingabe
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dez: string) => String.fromCodePoint(parseInt(dez, 10)))
    .replace(/&([a-zA-Z]+);/g, (treffer, name: string) => BENANNTE_ENTITIES[name] ?? treffer);
}

// Kodiert Nicht-ASCII-Zeichen als numerische Entities (Konvention der
// VTM-Cards, robust für E-Mail-Clients).
export function kodiereNichtAscii(eingabe: string): string {
  return eingabe.replace(/[^\x20-\x7e\n\t]/g, (zeichen) => `&#${zeichen.codePointAt(0)};`);
}
