// Zerlegt eine Card anhand der VTM:ABSCHNITT-Kommentar-Marker in logische
// Abschnitte (Outline, Inline-Bearbeitung) und setzt sie wieder zusammen.
import { dekodiereEntities, kodiereNichtAscii } from "@/lib/entities";

export interface CardAbschnitt {
  id: string;
  label: string;
  html: string;
}

export interface TextBlock {
  index: number;
  text: string;
}

const ABSCHNITT_REGEX =
  /<!--VTM:ABSCHNITT id="([^"]+)" label="([^"]+)"-->([\s\S]*?)<!--\/VTM:ABSCHNITT-->/g;

export function parseAbschnitte(cardHtml: string): CardAbschnitt[] {
  const abschnitte: CardAbschnitt[] = [];
  for (const treffer of cardHtml.matchAll(ABSCHNITT_REGEX)) {
    abschnitte.push({ id: treffer[1]!, label: dekodiereEntities(treffer[2]!), html: treffer[3]!.trim() });
  }
  return abschnitte;
}

export function ersetzeAbschnitt(cardHtml: string, abschnittId: string, neuesHtml: string): string {
  const regex = new RegExp(
    `(<!--VTM:ABSCHNITT id="${abschnittId}" label="[^"]+"-->)[\\s\\S]*?(<!--/VTM:ABSCHNITT-->)`
  );
  if (!regex.test(cardHtml)) {
    throw new Error(`Abschnitt "${abschnittId}" wurde in der Card nicht gefunden.`);
  }
  return cardHtml.replace(regex, `$1\n${neuesHtml}\n$2`);
}

// Blattelemente mit reinem Textinhalt (ohne Kind-Tags) – die editierbaren
// Textblöcke eines Abschnitts.
const TEXTBLOCK_REGEX = /<(p|h2|div|a|li|strong|td)\b[^>]*>([^<>]+)<\/\1>/g;

export function extrahiereTextbloecke(abschnittHtml: string): TextBlock[] {
  const bloecke: TextBlock[] = [];
  let index = 0;
  for (const treffer of abschnittHtml.matchAll(TEXTBLOCK_REGEX)) {
    const roh = treffer[2]!;
    const text = dekodiereEntities(roh).replace(/\s+/g, " ").trim();
    if (text.length > 0 && text !== " ") {
      bloecke.push({ index, text });
    }
    index += 1;
  }
  return bloecke;
}

// Ersetzt die Textinhalte der Blattelemente eines Abschnitts. `aenderungen`
// ist nach Blattelement-Index adressiert (gleiche Zählung wie beim
// Extrahieren); Nicht-ASCII wird als numerische Entities kodiert (Konvention
// der Cards, robust im E-Mail-Versand).
export function ersetzeTextbloecke(abschnittHtml: string, aenderungen: Map<number, string>): string {
  let index = 0;
  return abschnittHtml.replace(TEXTBLOCK_REGEX, (gesamt, tag: string, alterInhalt: string) => {
    const aktuellerIndex = index;
    index += 1;
    const neu = aenderungen.get(aktuellerIndex);
    if (neu === undefined) {
      return gesamt;
    }
    const kodiert = kodiereNichtAscii(neu.replace(/</g, "").replace(/>/g, ""));
    return gesamt.replace(`>${alterInhalt}</${tag}>`, `>${kodiert}</${tag}>`);
  });
}
