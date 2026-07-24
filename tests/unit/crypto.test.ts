import { describe, expect, it } from "vitest";
import { entschluesseln, maskieren, verschluesseln } from "@/lib/crypto";

const SECRET = "test-secret-fuer-unit-tests";

describe("lib/crypto", () => {
  it("verschlüsselt und entschlüsselt einen Wert verlustfrei (Roundtrip)", () => {
    const klartext = "abcdef0123456789:00ff00ff00ff00ff";
    const payload = verschluesseln(klartext, SECRET);
    expect(payload).not.toContain(klartext);
    expect(payload.startsWith("v1.")).toBe(true);
    expect(entschluesseln(payload, SECRET)).toBe(klartext);
  });

  it("erzeugt pro Aufruf unterschiedliche Payloads (zufälliger IV)", () => {
    const a = verschluesseln("gleicher-wert", SECRET);
    const b = verschluesseln("gleicher-wert", SECRET);
    expect(a).not.toBe(b);
  });

  it("erkennt manipulierte Payloads über den GCM-Auth-Tag", () => {
    const payload = verschluesseln("sensibler-key", SECRET);
    const teile = payload.split(".");
    const chiffrat = Buffer.from(teile[2]!, "base64");
    chiffrat[0] = chiffrat[0]! ^ 0xff;
    teile[2] = chiffrat.toString("base64");
    expect(() => entschluesseln(teile.join("."), SECRET)).toThrow(/Entschlüsselung fehlgeschlagen/);
  });

  it("wirft bei falschem Secret einen verständlichen Fehler", () => {
    const payload = verschluesseln("sensibler-key", SECRET);
    expect(() => entschluesseln(payload, "anderes-secret")).toThrow(/ENCRYPTION_SECRET/);
  });

  it("wirft bei fehlendem Secret einen handlungsleitenden Fehler", () => {
    expect(() => verschluesseln("wert", "")).toThrow(/ENCRYPTION_SECRET ist nicht gesetzt/);
  });

  it("weist unbekannte Payload-Formate zurück", () => {
    expect(() => entschluesseln("kein-gueltiges-format", SECRET)).toThrow(/unbekanntes Format/);
  });

  it("maskiert Werte bis auf die letzten vier Zeichen", () => {
    expect(maskieren("1234567890abcdef")).toBe("••••••••••••cdef");
    expect(maskieren("ab")).toBe("••••");
  });
});
