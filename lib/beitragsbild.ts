// Beitragsbild-Generator (M4): drei SVG-Templates im VTM-CI.
// Cobalt-Verlauf #0D1C3C→#122952, Gold-Signaturstrich oben, Serifen-Headline,
// dezentes Datenraster, VTM-Wortmarke unten links; bei Sponsored die
// Kennzeichnungszeile „Anzeige · In Kooperation mit …" in Gold.
// Reine String-Erzeugung – läuft server- und clientseitig (Live-Vorschau).

export type BildTemplate = "konzept" | "zahl" | "zitat";
export type BildFormat = "1200x630" | "1080x1080";

export interface BeitragsbildOptionen {
  template: BildTemplate;
  format: BildFormat;
  titel: string;
  unterzeile: string;
  kicker?: string;
  sponsored?: boolean;
  kunde?: string | null;
}

export const BILD_FORMATE: Record<BildFormat, { breite: number; hoehe: number }> = {
  "1200x630": { breite: 1200, hoehe: 630 },
  "1080x1080": { breite: 1080, hoehe: 1080 },
};

// PNG-Export erfolgt in 2-facher Auflösung (lib/beitragsbild-export.ts)
export const EXPORT_FAKTOR = 2;

export const BILD_TEMPLATES: Array<{ wert: BildTemplate; label: string }> = [
  { wert: "konzept", label: "Konzept" },
  { wert: "zahl", label: "Zahl" },
  { wert: "zitat", label: "Zitat" },
];

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Einfacher Zeilenumbruch nach Zeichenbudget (Wortgrenzen).
export function umbrecheText(text: string, maxZeichen: number, maxZeilen: number): string[] {
  const woerter = text.replace(/\s+/g, " ").trim().split(" ");
  const zeilen: string[] = [];
  let aktuelle = "";
  for (const wort of woerter) {
    const kandidat = aktuelle ? `${aktuelle} ${wort}` : wort;
    if (kandidat.length > maxZeichen && aktuelle) {
      zeilen.push(aktuelle);
      aktuelle = wort;
    } else {
      aktuelle = kandidat;
    }
  }
  if (aktuelle) {
    zeilen.push(aktuelle);
  }
  if (zeilen.length > maxZeilen) {
    const gekuerzt = zeilen.slice(0, maxZeilen);
    gekuerzt[maxZeilen - 1] = `${gekuerzt[maxZeilen - 1]!.replace(/[.,;:]?$/, "")} …`;
    return gekuerzt;
  }
  return zeilen;
}

function tspans(zeilen: string[], x: number, ersteY: number, zeilenhoehe: number): string {
  return zeilen
    .map((zeile, index) => `<tspan x="${x}" y="${ersteY + index * zeilenhoehe}">${escapeXml(zeile)}</tspan>`)
    .join("");
}

const SERIF = "Georgia, 'Source Serif 4', 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', 'Courier New', monospace";
const GOLD = "#E4C36E";
const GOLD_TIEF = "#C99B32";

export function baueBeitragsbildSvg(optionen: BeitragsbildOptionen): string {
  const { breite, hoehe } = BILD_FORMATE[optionen.format];
  const quadratisch = optionen.format === "1080x1080";
  const rand = Math.round(breite * 0.055);
  const skala = breite / 1200;

  const kicker = (optionen.kicker || "VTM ANALYSE").toUpperCase();
  const sponsoredZeile = optionen.sponsored
    ? `ANZEIGE · IN KOOPERATION MIT ${(optionen.kunde ?? "PARTNER").toUpperCase()}`
    : "";

  let inhalt = "";
  if (optionen.template === "konzept") {
    const schrift = Math.round((quadratisch ? 64 : 58) * skala * (quadratisch ? 1.1 : 1));
    const zeilen = umbrecheText(optionen.titel, quadratisch ? 24 : 30, 4);
    const zeilenhoehe = Math.round(schrift * 1.22);
    const blockHoehe = zeilen.length * zeilenhoehe;
    const unterY = hoehe - rand - Math.round(64 * skala);
    const titelY = unterY - Math.round(34 * skala) - blockHoehe + zeilenhoehe;
    inhalt = `
  <circle cx="${breite * 1.02}" cy="${hoehe * -0.12}" r="${breite * 0.34}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>
  <circle cx="${breite * 0.86}" cy="${hoehe * 0.2}" r="${breite * 0.19}" fill="none" stroke="rgba(201,155,50,0.28)" stroke-width="1.5"/>
  <circle cx="${breite * 0.78}" cy="${hoehe * 0.3}" r="${5 * skala}" fill="#427EF0" stroke="#ffffff" stroke-width="2.5"/>
  <text font-family="${SERIF}" font-size="${schrift}" font-weight="600" fill="#ffffff" letter-spacing="-0.5">${tspans(zeilen, rand, titelY, zeilenhoehe)}</text>
  <text x="${rand}" y="${unterY}" font-family="${MONO}" font-size="${Math.round(19 * skala)}" fill="rgba(255,255,255,0.75)" letter-spacing="1.5">${escapeXml(optionen.unterzeile)}</text>`;
  } else if (optionen.template === "zahl") {
    const statSchrift = Math.round(150 * skala * (quadratisch ? 1.15 : 1));
    const labelZeilen = umbrecheText(optionen.unterzeile, quadratisch ? 34 : 44, 3);
    const labelHoehe = Math.round(26 * skala);
    const labelY = hoehe - rand - Math.round(60 * skala) - (labelZeilen.length - 1) * labelHoehe;
    inhalt = `
  <text x="${rand}" y="${labelY - Math.round(54 * skala)}" font-family="${MONO}" font-size="${statSchrift}" font-weight="600" fill="${GOLD}" letter-spacing="-2">${escapeXml(optionen.titel)}</text>
  <text font-family="${MONO}" font-size="${Math.round(19 * skala)}" font-weight="600" fill="rgba(255,255,255,0.78)" letter-spacing="2">${tspans(labelZeilen, rand, labelY, labelHoehe)}</text>`;
  } else {
    const schrift = Math.round((quadratisch ? 46 : 42) * skala * (quadratisch ? 1.15 : 1));
    const zeilen = umbrecheText(`„${optionen.titel}“`, quadratisch ? 30 : 40, 5);
    const zeilenhoehe = Math.round(schrift * 1.35);
    const startY = Math.round(hoehe * 0.42 - ((zeilen.length - 1) * zeilenhoehe) / 2);
    inhalt = `
  <text font-family="${SERIF}" font-size="${schrift}" font-style="italic" font-weight="500" fill="#ffffff">${tspans(zeilen, rand, startY, zeilenhoehe)}</text>
  <text x="${rand}" y="${hoehe - rand - Math.round(58 * skala)}" font-family="${MONO}" font-size="${Math.round(17 * skala)}" font-weight="600" fill="${GOLD}" letter-spacing="2">${escapeXml(optionen.unterzeile.toUpperCase())}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${breite}" height="${hoehe}" viewBox="0 0 ${breite} ${hoehe}">
  <defs>
    <linearGradient id="hintergrund" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0D1C3C"/>
      <stop offset="1" stop-color="#122952"/>
    </linearGradient>
    <linearGradient id="signatur" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${GOLD_TIEF}"/>
      <stop offset="0.55" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="rgba(228,195,110,0)"/>
    </linearGradient>
    <linearGradient id="rastermaske" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0.3" stop-color="#000000"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <pattern id="raster" width="${36 * skala}" height="${36 * skala}" patternUnits="userSpaceOnUse">
      <path d="M ${36 * skala} 0 L 0 0 0 ${36 * skala}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
    </pattern>
    <mask id="maske"><rect width="${breite}" height="${hoehe}" fill="url(#rastermaske)"/></mask>
  </defs>
  <rect width="${breite}" height="${hoehe}" fill="url(#hintergrund)"/>
  <rect width="${breite}" height="${hoehe}" fill="url(#raster)" mask="url(#maske)" opacity="0.9"/>
  <rect width="${Math.round(breite * 0.85)}" height="${Math.max(3, Math.round(4 * skala))}" fill="url(#signatur)"/>
  <text x="${rand}" y="${rand + Math.round(16 * skala)}" font-family="${MONO}" font-size="${Math.round(17 * skala)}" font-weight="600" fill="${GOLD}" letter-spacing="3">${escapeXml(kicker)}</text>
  ${sponsoredZeile ? `<text x="${breite - rand}" y="${rand + Math.round(16 * skala)}" text-anchor="end" font-family="${MONO}" font-size="${Math.round(14 * skala)}" font-weight="600" fill="${GOLD}" letter-spacing="2">${escapeXml(sponsoredZeile)}</text>` : ""}
  ${inhalt}
  <text x="${rand}" y="${hoehe - rand + Math.round(6 * skala)}" font-family="Arial, sans-serif" font-size="${Math.round(24 * skala)}" font-weight="800" fill="#ffffff" letter-spacing="-0.5">VersicherungsTech <tspan fill="#4B75FF">Magazin</tspan></text>
  <text x="${breite - rand}" y="${hoehe - rand + Math.round(4 * skala)}" text-anchor="end" font-family="${MONO}" font-size="${Math.round(13 * skala)}" fill="rgba(255,255,255,0.5)" letter-spacing="1.5">VERSICHERUNGSTECH-MAGAZIN.DE</text>
</svg>`;
}
