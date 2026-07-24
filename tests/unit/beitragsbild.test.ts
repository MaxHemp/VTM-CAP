import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { BILD_FORMATE, baueBeitragsbildSvg, umbrecheText } from "@/lib/beitragsbild";
import { EXPORT_FAKTOR, exportDateiname, exportiereBeitragsbildPng } from "@/lib/beitragsbild-export";

const BASIS = {
  titel: "Das Lizenz-Aus bei Neodigital",
  unterzeile: "Analyse für IT-Entscheider",
} as const;

describe("baueBeitragsbildSvg", () => {
  it("enthält Cobalt-Verlauf, Gold-Signaturstrich, Datenraster und VTM-Wortmarke", () => {
    const svg = baueBeitragsbildSvg({ ...BASIS, template: "konzept", format: "1200x630" });
    expect(svg).toContain('width="1200" height="630"');
    expect(svg).toContain("#0D1C3C");
    expect(svg).toContain("#122952");
    expect(svg).toContain('id="signatur"');
    expect(svg).toContain('id="raster"');
    expect(svg).toContain("VersicherungsTech");
    expect(svg).toContain("VERSICHERUNGSTECH-MAGAZIN.DE");
  });

  it("rendert die Sponsored-Kennzeichnung in Gold", () => {
    const svg = baueBeitragsbildSvg({
      ...BASIS,
      template: "konzept",
      format: "1080x1080",
      sponsored: true,
      kunde: "d.velop",
    });
    expect(svg).toContain("ANZEIGE · IN KOOPERATION MIT D.VELOP");
    expect(svg).toContain("#E4C36E");
    expect(svg).toContain('width="1080" height="1080"');
  });

  it("escaped XML-Sonderzeichen in Nutzereingaben", () => {
    const svg = baueBeitragsbildSvg({
      template: "zitat",
      format: "1200x630",
      titel: 'Weniger <Lizenz> & mehr "Plattform"',
      unterzeile: "Quelle & Autor",
    });
    expect(svg).toContain("&lt;Lizenz&gt;");
    expect(svg).toContain("&amp;");
    expect(svg).not.toContain("<Lizenz>");
  });

  it("bricht lange Titel um und begrenzt die Zeilenzahl", () => {
    const zeilen = umbrecheText("Ein sehr langer Titel ".repeat(10), 30, 4);
    expect(zeilen).toHaveLength(4);
    expect(zeilen[3]!.endsWith("…")).toBe(true);
    for (const zeile of zeilen.slice(0, 3)) {
      expect(zeile.length).toBeLessThanOrEqual(31);
    }
  });
});

describe("PNG-Export (sharp)", () => {
  it.each(["konzept", "zahl", "zitat"] as const)(
    "exportiert Template %s in 2-facher Auflösung",
    async (template) => {
      const png = await exportiereBeitragsbildPng({
        ...BASIS,
        template,
        format: "1200x630",
      });
      const metadaten = await sharp(png).metadata();
      expect(metadaten.format).toBe("png");
      expect(metadaten.width).toBe(BILD_FORMATE["1200x630"].breite * EXPORT_FAKTOR);
      expect(metadaten.height).toBe(BILD_FORMATE["1200x630"].hoehe * EXPORT_FAKTOR);
    }
  );

  it("benennt die Exportdatei nach Template und Pixelmaßen", () => {
    expect(exportDateiname({ ...BASIS, template: "zahl", format: "1080x1080" })).toBe(
      "vtm-beitragsbild-zahl-2160x2160.png"
    );
  });
});
