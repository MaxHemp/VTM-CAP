import { describe, expect, it } from "vitest";
import {
  ersetzeAbschnitt,
  ersetzeTextbloecke,
  extrahiereTextbloecke,
  parseAbschnitte,
} from "@/lib/card-abschnitte";
import { baueMockCard } from "@/lib/mock-card";
import { pruefeCard } from "@/lib/stilcheck";

const CARD = baueMockCard({
  kategorie: "Regulatorik",
  format: "Analyse",
  sponsored: false,
  ctaLabel: "AI Insurance Briefing abonnieren",
  ctaUrl: "https://example.com",
  rohtext:
    "Erster Satz des Manuskripts. Zweiter Satz mit Kernaussage. Dritter Satz. Vierter Satz. Fünfter Satz. Sechster Satz. Siebter Satz. Achter Satz.",
});

describe("parseAbschnitte", () => {
  it("findet alle Pflicht-Abschnitte in Reihenfolge", () => {
    const ids = parseAbschnitte(CARD).map((abschnitt) => abschnitt.id);
    expect(ids).toEqual([
      "app-hinweis",
      "kategorie",
      "lead",
      "wichtigste",
      "hauptteil-1",
      "hauptteil-2",
      "gegenargumente",
      "was-tun",
      "fazit",
      "quellen",
      "cta",
    ]);
  });

  it("dekodiert Entities im Label", () => {
    const abschnitte = parseAbschnitte(CARD);
    expect(abschnitte.find((a) => a.id === "hauptteil-2")?.label).toBe("Bedeutung für Versicherer");
  });
});

describe("Textblöcke bearbeiten", () => {
  it("extrahiert editierbare Textblöcke aus einem Abschnitt", () => {
    const fazit = parseAbschnitte(CARD).find((a) => a.id === "fazit")!;
    const bloecke = extrahiereTextbloecke(fazit.html);
    expect(bloecke.length).toBeGreaterThan(0);
    expect(bloecke.some((b) => b.text.includes("Fazit"))).toBe(true);
  });

  it("ersetzt Text, setzt die Card neu zusammen und bleibt stilcheck-konform", () => {
    const abschnitte = parseAbschnitte(CARD);
    const fazit = abschnitte.find((a) => a.id === "fazit")!;
    const bloecke = extrahiereTextbloecke(fazit.html);
    const textIndex = bloecke.find((b) => !b.text.includes("Fazit"))!.index;

    const neuerText = "Das überarbeitete Fazit beantwortet die Leitfrage präziser.";
    const neuerAbschnitt = ersetzeTextbloecke(fazit.html, new Map([[textIndex, neuerText]]));
    const neueCard = ersetzeAbschnitt(CARD, "fazit", neuerAbschnitt);

    expect(neueCard).toContain("&#252;berarbeitete Fazit");
    expect(neueCard).not.toContain("überarbeitete Fazit"); // Nicht-ASCII als Entities kodiert
    expect(pruefeCard(neueCard).fehler).toEqual([]);

    const neuGeparst = parseAbschnitte(neueCard);
    expect(neuGeparst.map((a) => a.id)).toEqual(abschnitte.map((a) => a.id));
  });

  it("wirft bei unbekanntem Abschnitt einen verständlichen Fehler", () => {
    expect(() => ersetzeAbschnitt(CARD, "gibt-es-nicht", "<p>x</p>")).toThrow(/nicht gefunden/);
  });
});
