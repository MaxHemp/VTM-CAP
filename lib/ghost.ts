// Ghost Admin API: Key-Parsing, kurzlebiges JWT (HS256) und Verbindungstest
// gegen GET /ghost/api/admin/site/. Basis für das Publishing in M3.
import { createHmac } from "node:crypto";

export interface GhostAdminKey {
  id: string;
  secret: string;
}

export interface GhostVerbindungsErgebnis {
  ok: boolean;
  titel?: string;
  version?: string;
  fehler?: string;
}

const TOKEN_LEBENSDAUER_SEKUNDEN = 300;

export function parseAdminApiKey(key: string): GhostAdminKey {
  const teile = key.trim().split(":");
  if (teile.length !== 2 || !teile[0] || !teile[1]) {
    throw new Error(
      'Der Admin API Key hat nicht das Format "id:secret". Bitte den Key aus Ghost Admin → Einstellungen → Integrationen kopieren.'
    );
  }
  const [id, secret] = teile;
  if (!/^[0-9a-f]+$/i.test(secret!)) {
    throw new Error(
      "Der Secret-Teil des Admin API Keys ist nicht hexadezimal. Bitte den vollständigen Key erneut kopieren."
    );
  }
  return { id: id!, secret: secret! };
}

function base64url(eingabe: Buffer | string): string {
  return Buffer.from(eingabe).toString("base64url");
}

export function erzeugeGhostJwt(key: GhostAdminKey, jetztMs = Date.now()): string {
  const iat = Math.floor(jetztMs / 1000);
  const header = { alg: "HS256", typ: "JWT", kid: key.id };
  const payload = { iat, exp: iat + TOKEN_LEBENSDAUER_SEKUNDEN, aud: "/admin/" };
  const kopf = base64url(JSON.stringify(header));
  const rumpf = base64url(JSON.stringify(payload));
  const signatur = createHmac("sha256", Buffer.from(key.secret, "hex"))
    .update(`${kopf}.${rumpf}`)
    .digest("base64url");
  return `${kopf}.${rumpf}.${signatur}`;
}

export function normalisiereGhostUrl(url: string): string {
  const bereinigt = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(bereinigt)) {
    throw new Error("Die Ghost-URL muss mit http:// oder https:// beginnen, z. B. https://mein-magazin.ghost.io");
  }
  return bereinigt;
}

export async function testeGhostVerbindung(
  url: string,
  adminApiKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<GhostVerbindungsErgebnis> {
  let basisUrl: string;
  let key: GhostAdminKey;
  try {
    basisUrl = normalisiereGhostUrl(url);
    key = parseAdminApiKey(adminApiKey);
  } catch (fehler) {
    return { ok: false, fehler: fehler instanceof Error ? fehler.message : "Ungültige Eingaben." };
  }

  let antwort: Response;
  try {
    antwort = await fetchImpl(`${basisUrl}/ghost/api/admin/site/`, {
      headers: {
        Authorization: `Ghost ${erzeugeGhostJwt(key)}`,
        "Accept-Version": "v5.0",
      },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      fehler: `Die Ghost-Instanz unter ${basisUrl} ist nicht erreichbar. Bitte URL und Netzwerkzugriff prüfen.`,
    };
  }

  if (antwort.status === 401 || antwort.status === 403) {
    return {
      ok: false,
      fehler:
        "Ghost hat den Admin API Key abgelehnt (HTTP " +
        antwort.status +
        "). Bitte prüfen, ob der Key zur angegebenen Instanz gehört und die Integration aktiv ist.",
    };
  }
  if (!antwort.ok) {
    return {
      ok: false,
      fehler: `Ghost hat mit HTTP ${antwort.status} geantwortet. Bitte prüfen, ob die URL auf eine Ghost-Instanz zeigt.`,
    };
  }

  try {
    const daten = (await antwort.json()) as { site?: { title?: string; version?: string } };
    return { ok: true, titel: daten.site?.title, version: daten.site?.version };
  } catch {
    return {
      ok: false,
      fehler: "Die Antwort der Ghost-API konnte nicht gelesen werden. Bitte prüfen, ob die URL auf eine Ghost-Instanz zeigt.",
    };
  }
}
