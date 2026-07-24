// Pipeline-Status: Reihenfolge, Beschriftungen und Gruppierung für das Board.
import type { ArtikelFormat, ArtikelStatus } from "@prisma/client";

export const STATUS_REIHENFOLGE: ArtikelStatus[] = [
  "EINGEGANGEN",
  "IN_AUFBEREITUNG",
  "REVIEW",
  "KUNDENFREIGABE",
  "BEREIT",
  "IN_GHOST",
];

export const STATUS_LABELS: Record<ArtikelStatus, string> = {
  EINGEGANGEN: "Eingegangen",
  IN_AUFBEREITUNG: "In Aufbereitung",
  REVIEW: "Review",
  KUNDENFREIGABE: "Kundenfreigabe",
  BEREIT: "Bereit",
  IN_GHOST: "In Ghost",
};

export const STATUS_HINWEISE: Record<ArtikelStatus, string> = {
  EINGEGANGEN: "Manuskript liegt vor",
  IN_AUFBEREITUNG: "Automatische Aufbereitung",
  REVIEW: "Redaktionelle Prüfung",
  KUNDENFREIGABE: "Wartet auf Kunde",
  BEREIT: "Publizierbar",
  IN_GHOST: "Draft in Ghost",
};

export const FORMAT_LABELS: Record<ArtikelFormat, string> = {
  EINORDNUNG: "Einordnung",
  ANALYSE: "Analyse",
  PRAXIS_CASE: "Praxis-Case",
  LEITFADEN: "Leitfaden",
  SPONSORED: "Sponsored",
  INTERVIEW: "Interview",
};

export interface BoardArtikel {
  id: string;
  titel: string;
  format: ArtikelFormat;
  status: ArtikelStatus;
  sponsored: boolean;
  kunde: string | null;
  qualitaetsScore: number | null;
  autorName: string | null;
  updatedAt: Date;
}

export interface BoardSpalte {
  status: ArtikelStatus;
  label: string;
  hinweis: string;
  artikel: BoardArtikel[];
}

// Gruppiert Artikel in die sechs Board-Spalten; innerhalb einer Spalte
// stehen die zuletzt geänderten Artikel oben.
export function gruppiereNachStatus(artikel: BoardArtikel[]): BoardSpalte[] {
  return STATUS_REIHENFOLGE.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    hinweis: STATUS_HINWEISE[status],
    artikel: artikel
      .filter((a) => a.status === status)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  }));
}

// Qualitätsscore-Schwelle gemäß brand-rules/references/redaktionsstruktur.md
export const SCORE_SCHWELLE = 13;
export const SCORE_MAXIMUM = 16;
