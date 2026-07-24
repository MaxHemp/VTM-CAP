import { afterEach, describe, expect, it } from "vitest";
import { LinkedInApiStub, pruefeVtmPost } from "@/lib/linkedin";
import { ladeKiSchicht } from "@/lib/ki";

afterEach(() => {
  delete process.env.MOCK_KI;
});

describe("pruefeVtmPost – harte Formatregeln des VTM-Kanals", () => {
  const gueltig = [
    "Die These steht am Anfang.",
    "",
    "Ein Faktenabsatz mit Einordnung.",
    "",
    "▪️ Erster Bullet als vollständiger Satz.",
    "▪️ Zweiter Bullet als vollständiger Satz.",
    "▪️ Dritter Bullet als vollständiger Satz.",
    "",
    "Jetzt lesen und mitdiskutieren.",
    "",
    "#VersicherungsTech #InsurTech #Versicherung #Digitalisierung #KI",
  ].join("\n");

  it("akzeptiert einen regelkonformen Post", () => {
    expect(pruefeVtmPost(gueltig)).toEqual({ verstoesse: [], bestanden: true });
  });

  it("erkennt falsche Bullet-Anzahl, fehlenden Abschluss, falsche Hashtag-Zahl, Em-Dash und Emojis", () => {
    const kaputt = gueltig
      .replace("▪️ Dritter Bullet als vollständiger Satz.\n", "")
      .replace("Jetzt lesen und mitdiskutieren.", "Bis bald! 🚀")
      .replace(" #KI", "")
      .replace("Einordnung.", "Einordnung — mit Einschub.");
    const ergebnis = pruefeVtmPost(kaputt);
    expect(ergebnis.bestanden).toBe(false);
    expect(ergebnis.verstoesse.join(" | ")).toContain("genau 3 ▪️-Bullets");
    expect(ergebnis.verstoesse.join(" | ")).toContain("Abschlusssatz");
    expect(ergebnis.verstoesse.join(" | ")).toContain("5 Hashtags");
    expect(ergebnis.verstoesse.join(" | ")).toContain("Em-Dash");
    expect(ergebnis.verstoesse.join(" | ")).toContain("Emoji");
  });
});

describe("Mock-KI: LinkedIn-Posts", () => {
  it("VTM-Kanal-Varianten bestehen die harten Formatregeln", async () => {
    process.env.MOCK_KI = "1";
    const ki = await ladeKiSchicht();
    const posts = await ki.generiereLinkedInPosts({
      kanal: "VTM",
      titel: "Testartikel",
      cardText:
        "Die Kernthese steht hier. Die Faktenlage ist dokumentiert. Erster Beleg aus dem Artikeltext. Zweiter Beleg mit Details. Dritte Konsequenz für Versicherer. Vierter Satz.",
      sponsored: false,
      kunde: null,
    });
    expect(posts.length).toBeGreaterThanOrEqual(2);
    expect(posts.length).toBeLessThanOrEqual(3);
    for (const post of posts) {
      const pruefung = pruefeVtmPost(post);
      expect(pruefung.verstoesse).toEqual([]);
    }
  });

  it("Personal-Varianten nutzen die Du-Form", async () => {
    process.env.MOCK_KI = "1";
    const ki = await ladeKiSchicht();
    const posts = await ki.generiereLinkedInPosts({
      kanal: "PERSONAL",
      titel: "Testartikel",
      cardText: "Erster Satz mit Inhalt und Länge. Zweiter Satz mit Inhalt und Länge. Dritter Satz mit Inhalt.",
      sponsored: false,
      kunde: null,
    });
    expect(posts.length).toBeGreaterThanOrEqual(2);
    expect(posts[0]).toContain("du");
  });

  it("Sponsored-Posts tragen die Anzeige-Kennzeichnung", async () => {
    process.env.MOCK_KI = "1";
    const ki = await ladeKiSchicht();
    const posts = await ki.generiereLinkedInPosts({
      kanal: "VTM",
      titel: "Sponsored-Artikel",
      cardText: "Satz eins mit ausreichend Inhalt. Satz zwei mit ausreichend Inhalt. Satz drei. Satz vier. Satz fünf.",
      sponsored: true,
      kunde: "d.velop",
    });
    expect(posts[0]).toContain("Anzeige");
    expect(posts[0]).toContain("d.velop");
  });
});

describe("LinkedIn-API-Stub", () => {
  it("lehnt direktes Posting mit verständlicher Meldung ab (Nicht-Ziel v1)", async () => {
    const stub = new LinkedInApiStub();
    await expect(stub.veroeffentlichePost()).rejects.toThrow(/bewusst nicht angebunden/);
  });
});
