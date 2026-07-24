import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { baueEinladungsMail, normalisiereEmail, pruefeEmailFormat } from "@/lib/benutzer";

describe("normalisiereEmail", () => {
  it("trimmt und schreibt klein", () => {
    expect(normalisiereEmail("  Max.Mustermann@Beispiel.DE ")).toBe("max.mustermann@beispiel.de");
  });
});

describe("pruefeEmailFormat", () => {
  it("akzeptiert gültige Adressen", () => {
    expect(pruefeEmailFormat("redaktion@versicherungstech-magazin.de")).toBeNull();
  });

  it("weist leere und ungültige Adressen mit präziser Meldung ab", () => {
    expect(pruefeEmailFormat("   ")).toContain("Bitte geben Sie");
    expect(pruefeEmailFormat("ohne-at.de")).toContain("keine gültige E-Mail-Adresse");
    expect(pruefeEmailFormat("zwei@at@beispiel.de")).toContain("keine gültige E-Mail-Adresse");
    expect(pruefeEmailFormat("kurz@tld.d")).toContain("keine gültige E-Mail-Adresse");
  });
});

describe("baueEinladungsMail", () => {
  beforeEach(() => {
    process.env.APP_URL = "https://studio.versicherungstech-magazin.de";
  });
  afterEach(() => {
    delete process.env.APP_URL;
  });

  it("enthält Anrede, Rolle und Login-Link ohne Passwort-Versprechen", () => {
    const mail = baueEinladungsMail({ name: "Julia Steiner", rolle: "REDAKTEUR" });
    expect(mail.betreff).toBe("Ihr Zugang zu VTM Studio");
    expect(mail.text).toContain("Guten Tag Julia Steiner,");
    expect(mail.text).toContain("Rolle: Redakteur");
    expect(mail.text).toContain("https://studio.versicherungstech-magazin.de/login");
    expect(mail.text).toContain("ein Passwort gibt es nicht");
  });

  it("fällt ohne Namen auf neutrale Anrede zurück und nennt die Herausgeber-Rolle", () => {
    const mail = baueEinladungsMail({ name: null, rolle: "HERAUSGEBER" });
    expect(mail.text).toContain("Guten Tag,");
    expect(mail.text).toContain("Rolle: Herausgeber");
  });
});
