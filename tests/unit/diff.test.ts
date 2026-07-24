import { describe, expect, it } from "vitest";
import { normalisiereTypografie, normalisierterHash, pruefeTextUebernahme } from "@/lib/diff";
import { baueMockCard } from "@/lib/mock-card";
import { htmlZuText } from "@/lib/entities";

describe("normalisiereTypografie", () => {
  it("bereinigt Gedankenstriche, typografische Anführungszeichen und Whitespace", () => {
    expect(normalisiereTypografie("Die Zahl — nach Angaben des Kunden — stieg.")).toBe(
      "Die Zahl nach Angaben des Kunden stieg."
    );
    expect(normalisiereTypografie("Ein Test – mit En-Dash – und „Zitat“.")).toBe(
      'Ein Test mit En-Dash und "Zitat".'
    );
    expect(normalisiereTypografie("Viel  Raum   hier .")).toBe("Viel Raum hier.");
  });

  it("Hash-Vergleich: nur Typografie-Änderungen gelten als gleich", () => {
    const original = "Die Bearbeitungszeit sank — nach Unternehmensangaben — um ein Drittel.";
    const bereinigt = "Die Bearbeitungszeit sank, nach Unternehmensangaben, um ein Drittel.";
    const inhaltlichAnders = "Die Bearbeitungszeit sank um die Hälfte.";
    expect(normalisierterHash(original)).toBe(normalisierterHash(bereinigt));
    expect(normalisierterHash(original)).not.toBe(normalisierterHash(inhaltlichAnders));
  });
});

describe("pruefeTextUebernahme (Kundentext ↔ Card-Fließtext)", () => {
  const kundentext =
    "Die digitale Aktenverwaltung entlastet Maklerbetriebe im Tagesgeschäft spürbar. " +
    "Gemeinsam mit dem Kunden wurde die Umstellung in neun Monaten abgeschlossen. " +
    "Die Bearbeitungszeit pro Vorgang sank nach Unternehmensangaben um ein Drittel. " +
    "Komplexe Sonderfälle bleiben bewusst in der persönlichen Betreuung. " +
    "Die Datenhaltung erfüllt die aufsichtsrechtlichen Anforderungen an Revisionssicherheit. " +
    "Der Umstieg gelang ohne Unterbrechung des laufenden Betriebs.";

  function sponsoredCardText(rohtext: string): string {
    return htmlZuText(
      baueMockCard({
        kategorie: "Vertrieb",
        format: "Praxis-Case",
        sponsored: true,
        kunde: "d.velop",
        ctaLabel: "Mehr erfahren",
        ctaUrl: "https://example.com",
        rohtext,
      })
    );
  }

  it("vergibt den 1:1-Badge, wenn der Kundentext unverändert übernommen wurde", () => {
    const ergebnis = pruefeTextUebernahme(kundentext, sponsoredCardText(kundentext));
    expect(ergebnis.einsZuEins).toBe(true);
    expect(ergebnis.uebernommen).toBe(ergebnis.gesamt);
  });

  it("Typografie-Bereinigung (Em-Dash) verhindert den Badge NICHT", () => {
    const kundentextMitEmDash = kundentext.replace(
      "sank nach Unternehmensangaben um",
      "sank — nach Unternehmensangaben — um"
    );
    // Die Card enthält die bereinigte Fassung (VTM-CI erlaubt keine Em-Dashes)
    const ergebnis = pruefeTextUebernahme(kundentextMitEmDash, sponsoredCardText(kundentext));
    expect(ergebnis.einsZuEins).toBe(true);
  });

  it("erkennt inhaltlich veränderte Sätze und verweigert den Badge", () => {
    const cardMitAenderung = sponsoredCardText(
      kundentext.replace("um ein Drittel", "um die Hälfte")
    );
    const ergebnis = pruefeTextUebernahme(kundentext, cardMitAenderung);
    expect(ergebnis.einsZuEins).toBe(false);
    const geaendert = ergebnis.saetze.find((satz) => !satz.uebernommen);
    expect(geaendert?.satz).toContain("um ein Drittel");
  });
});
