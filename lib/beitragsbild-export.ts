// PNG-Export der SVG-Beitragsbilder in 2-facher Auflösung (serverseitig, sharp).
import sharp from "sharp";
import { BILD_FORMATE, EXPORT_FAKTOR, baueBeitragsbildSvg, type BeitragsbildOptionen } from "@/lib/beitragsbild";

export { EXPORT_FAKTOR };

export async function exportiereBeitragsbildPng(optionen: BeitragsbildOptionen): Promise<Buffer> {
  const svg = baueBeitragsbildSvg(optionen);
  // density skaliert die Vektor-Rasterung (72 dpi = 1x) – 2x bleibt gestochen scharf
  return sharp(Buffer.from(svg), { density: 72 * EXPORT_FAKTOR }).png().toBuffer();
}

export function exportDateiname(optionen: BeitragsbildOptionen): string {
  const { breite, hoehe } = BILD_FORMATE[optionen.format];
  return `vtm-beitragsbild-${optionen.template}-${breite * EXPORT_FAKTOR}x${hoehe * EXPORT_FAKTOR}.png`;
}
