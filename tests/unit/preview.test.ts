import { describe, expect, it } from "vitest";
import { baueOutlookPreview, baueWebPreview, transformiereFuerOutlook } from "@/lib/preview";
import { baueMockCard } from "@/lib/mock-card";

const CARD = baueMockCard({
  kategorie: "Regulatorik",
  format: "Analyse",
  sponsored: false,
  ctaLabel: "AI Insurance Briefing abonnieren",
  ctaUrl: "https://example.com",
  rohtext: "Erster Satz. Zweiter Satz. Dritter Satz. Vierter Satz.",
});

describe("transformiereFuerOutlook", () => {
  it("entfernt border-radius und Gradients, behält bgcolor-Fallbacks", () => {
    const ergebnis = transformiereFuerOutlook(CARD);
    expect(ergebnis).not.toContain("border-radius");
    expect(ergebnis).not.toContain("linear-gradient");
    expect(ergebnis).toContain('bgcolor="#122952"');
    expect(ergebnis).toContain("background-color:#122952");
  });
});

describe("Preview-Dokumente", () => {
  it("Web-Ansicht rendert die Card im .gh-content-Wrapper mit Theme-Simulationsregeln", () => {
    const html = baueWebPreview(CARD, "Testheadline");
    expect(html).toContain('<div class="gh-content">');
    expect(html).toContain("Testheadline");
    // Die feindlichen Theme-Regeln aus SKILL.md Bauregel 10 sind aktiv:
    expect(html).toContain("white-space: nowrap");
    expect(html).toContain("td:first-child");
    expect(html).toContain(CARD);
  });

  it("Outlook-Ansicht enthält die transformierte Card ohne Verläufe", () => {
    const html = baueOutlookPreview(CARD, "Testheadline");
    expect(html).toContain("Testheadline");
    expect(html).not.toContain("linear-gradient");
  });
});
