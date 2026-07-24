import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { erzeugeGhostJwt, normalisiereGhostUrl, parseAdminApiKey, testeGhostVerbindung } from "@/lib/ghost";

const TEST_KEY = { id: "6866abc123def456789012ab", secret: "0123456789abcdef0123456789abcdef" };
const TEST_KEY_STRING = `${TEST_KEY.id}:${TEST_KEY.secret}`;

function dekodiere(segment: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

describe("parseAdminApiKey", () => {
  it("zerlegt einen gültigen Key in id und secret", () => {
    expect(parseAdminApiKey(TEST_KEY_STRING)).toEqual(TEST_KEY);
  });

  it("weist Keys ohne Doppelpunkt zurück", () => {
    expect(() => parseAdminApiKey("nur-ein-teil")).toThrow(/id:secret/);
  });

  it("weist nicht-hexadezimale Secrets zurück", () => {
    expect(() => parseAdminApiKey("abc:nicht-hex!")).toThrow(/hexadezimal/);
  });
});

describe("erzeugeGhostJwt", () => {
  it("erzeugt ein HS256-JWT mit kid, aud /admin/ und 5 Minuten Lebensdauer", () => {
    const jetzt = 1_753_363_200_000;
    const token = erzeugeGhostJwt(TEST_KEY, jetzt);
    const [kopf, rumpf, signatur] = token.split(".");
    expect(dekodiere(kopf!)).toEqual({ alg: "HS256", typ: "JWT", kid: TEST_KEY.id });
    const payload = dekodiere(rumpf!) as { iat: number; exp: number; aud: string };
    expect(payload.aud).toBe("/admin/");
    expect(payload.iat).toBe(Math.floor(jetzt / 1000));
    expect(payload.exp - payload.iat).toBe(300);
    const erwartet = createHmac("sha256", Buffer.from(TEST_KEY.secret, "hex"))
      .update(`${kopf}.${rumpf}`)
      .digest("base64url");
    expect(signatur).toBe(erwartet);
  });
});

describe("normalisiereGhostUrl", () => {
  it("entfernt abschließende Slashes", () => {
    expect(normalisiereGhostUrl("https://magazin.ghost.io/")).toBe("https://magazin.ghost.io");
  });

  it("weist URLs ohne Protokoll zurück", () => {
    expect(() => normalisiereGhostUrl("magazin.ghost.io")).toThrow(/http/);
  });
});

describe("testeGhostVerbindung", () => {
  it("liefert Titel und Version bei erfolgreicher Antwort", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ site: { title: "VersicherungsTech Magazin", version: "5.130" } }), {
        status: 200,
      })
    );
    const ergebnis = await testeGhostVerbindung("https://magazin.ghost.io/", TEST_KEY_STRING, fetchMock);
    expect(ergebnis).toEqual({ ok: true, titel: "VersicherungsTech Magazin", version: "5.130" });
    const [url, optionen] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://magazin.ghost.io/ghost/api/admin/site/");
    expect((optionen as RequestInit).headers).toMatchObject({ "Accept-Version": "v5.0" });
    const authHeader = ((optionen as RequestInit).headers as Record<string, string>)["Authorization"];
    expect(authHeader).toMatch(/^Ghost /);
  });

  it("meldet einen abgelehnten Key handlungsleitend (401)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
    const ergebnis = await testeGhostVerbindung("https://magazin.ghost.io", TEST_KEY_STRING, fetchMock);
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.fehler).toMatch(/Admin API Key abgelehnt/);
  });

  it("meldet eine nicht erreichbare Instanz", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const ergebnis = await testeGhostVerbindung("https://magazin.ghost.io", TEST_KEY_STRING, fetchMock);
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.fehler).toMatch(/nicht erreichbar/);
  });

  it("meldet ungültige Eingaben ohne einen Request abzusetzen", async () => {
    const fetchMock = vi.fn();
    const ergebnis = await testeGhostVerbindung("https://magazin.ghost.io", "kaputter-key", fetchMock);
    expect(ergebnis.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
