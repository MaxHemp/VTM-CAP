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
  hatCard: boolean;
  ghostDraftUrl: string | null;
}

// Handlungsleitender nächster Schritt je Status (Pipeline-Karten).
export function naechsterSchritt(artikel: BoardArtikel): { label: string; href: string; extern?: boolean } {
  switch (artikel.status) {
    case "EINGEGANGEN":
      return { label: "Aufbereitung starten", href: `/artikel/${artikel.id}` };
    case "IN_AUFBEREITUNG":
      return { label: "Verarbeitung verfolgen", href: `/artikel/${artikel.id}` };
    case "REVIEW":
      return artikel.hatCard
        ? { label: "Jetzt prüfen", href: `/artikel/${artikel.id}/review` }
        : { label: "Details öffnen", href: `/artikel/${artikel.id}` };
    case "KUNDENFREIGABE":
      return { label: "Freigabe verwalten", href: "/freigabe" };
    case "BEREIT":
      return artikel.hatCard
        ? { label: "Nach Ghost übertragen", href: `/artikel/${artikel.id}/review` }
        : { label: "Details öffnen", href: `/artikel/${artikel.id}` };
    case "IN_GHOST":
      return artikel.ghostDraftUrl
        ? { label: "Draft in Ghost öffnen", href: artikel.ghostDraftUrl, extern: true }
        : { label: "Details öffnen", href: `/artikel/${artikel.id}` };
  }
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
