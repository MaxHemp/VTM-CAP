// Rohtext-Extraktion aus hochgeladenen Manuskripten (DOCX, PDF, Markdown, TXT).
import { createHash } from "node:crypto";

export interface ExtraktionsErgebnis {
  text: string;
  wortzahl: number;
}

const ERLAUBTE_ENDUNGEN = ["docx", "pdf", "md", "markdown", "txt"];

export function pruefeDateiname(dateiname: string): string {
  const endung = dateiname.split(".").pop()?.toLowerCase() ?? "";
  if (!ERLAUBTE_ENDUNGEN.includes(endung)) {
    throw new Error(
      `Das Dateiformat .${endung || "?"} wird nicht unterstützt. Bitte laden Sie DOCX, PDF, Markdown oder TXT hoch.`
    );
  }
  return endung;
}

export async function extrahiereText(daten: Buffer, dateiname: string): Promise<ExtraktionsErgebnis> {
  const endung = pruefeDateiname(dateiname);
  let text: string;

  if (endung === "docx") {
    const mammoth = await import("mammoth");
    const ergebnis = await mammoth.extractRawText({ buffer: daten });
    text = ergebnis.value;
  } else if (endung === "pdf") {
    const { default: pdfParse } = await import("pdf-parse");
    const ergebnis = await pdfParse(daten);
    text = ergebnis.text;
  } else {
    text = daten.toString("utf8");
  }

  const bereinigt = text.replace(/\r\n/g, "\n").trim();
  if (bereinigt.length === 0) {
    throw new Error("Aus der Datei konnte kein Text extrahiert werden. Bitte prüfen Sie das Manuskript.");
  }
  return { text: bereinigt, wortzahl: bereinigt.split(/\s+/).length };
}

// Hash über den normalisierten Quelltext; Grundlage des 1:1-Nachweises
// in der Sponsored-Freigabe (M5).
export function quelltextHash(text: string): string {
  const normalisiert = text.replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalisiert, "utf8").digest("hex");
}
