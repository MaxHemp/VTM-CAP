// Verschlüsselte Ablage sensibler Werte (API-Keys) mit AES-256-GCM.
// Payload-Format: "v1.<iv>.<ciphertext>.<authTag>" (jeweils Base64).
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const VERSION = "v1";
const SALT = "vtm-studio-einstellungen";

function ableiten(secret: string): Buffer {
  if (!secret) {
    throw new Error(
      "ENCRYPTION_SECRET ist nicht gesetzt. Bitte in der .env einen Wert hinterlegen (z. B. mit `openssl rand -base64 32` erzeugen)."
    );
  }
  return scryptSync(secret, SALT, 32);
}

export function verschluesseln(klartext: string, secret = process.env.ENCRYPTION_SECRET ?? ""): string {
  const schluessel = ableiten(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", schluessel, iv);
  const chiffrat = Buffer.concat([cipher.update(klartext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), chiffrat.toString("base64"), authTag.toString("base64")].join(".");
}

export function entschluesseln(payload: string, secret = process.env.ENCRYPTION_SECRET ?? ""): string {
  const schluessel = ableiten(secret);
  const teile = payload.split(".");
  if (teile.length !== 4 || teile[0] !== VERSION) {
    throw new Error("Der gespeicherte Wert hat ein unbekanntes Format und kann nicht entschlüsselt werden.");
  }
  const [, ivB64, chiffratB64, authTagB64] = teile;
  const decipher = createDecipheriv("aes-256-gcm", schluessel, Buffer.from(ivB64!, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64!, "base64"));
  try {
    return Buffer.concat([decipher.update(Buffer.from(chiffratB64!, "base64")), decipher.final()]).toString("utf8");
  } catch {
    throw new Error(
      "Entschlüsselung fehlgeschlagen. Der Wert wurde verändert oder das ENCRYPTION_SECRET stimmt nicht mit dem beim Speichern verwendeten überein."
    );
  }
}

// Maskierte Anzeige für das UI: nur die letzten vier Zeichen bleiben sichtbar.
export function maskieren(wert: string): string {
  if (wert.length <= 4) {
    return "••••";
  }
  return `••••••••••••${wert.slice(-4)}`;
}
