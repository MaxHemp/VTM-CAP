import { describe, expect, it } from "vitest";
import { gruppiereNachStatus, STATUS_REIHENFOLGE, type BoardArtikel } from "@/lib/status";

function artikel(teil: Partial<BoardArtikel> & Pick<BoardArtikel, "id" | "status">): BoardArtikel {
  return {
    titel: "Testartikel",
    format: "ANALYSE",
    sponsored: false,
    kunde: null,
    qualitaetsScore: null,
    autorName: null,
    updatedAt: new Date("2026-07-01T10:00:00Z"),
    ...teil,
  };
}

describe("gruppiereNachStatus", () => {
  it("liefert immer alle sechs Spalten in Pipeline-Reihenfolge", () => {
    const spalten = gruppiereNachStatus([]);
    expect(spalten.map((s) => s.status)).toEqual(STATUS_REIHENFOLGE);
    expect(spalten).toHaveLength(6);
    expect(spalten.every((s) => s.artikel.length === 0)).toBe(true);
  });

  it("ordnet Artikel der richtigen Spalte zu", () => {
    const spalten = gruppiereNachStatus([
      artikel({ id: "a", status: "REVIEW" }),
      artikel({ id: "b", status: "EINGEGANGEN" }),
      artikel({ id: "c", status: "REVIEW" }),
    ]);
    const review = spalten.find((s) => s.status === "REVIEW")!;
    expect(review.artikel.map((a) => a.id).sort()).toEqual(["a", "c"]);
    expect(spalten.find((s) => s.status === "EINGEGANGEN")!.artikel).toHaveLength(1);
    expect(spalten.find((s) => s.status === "BEREIT")!.artikel).toHaveLength(0);
  });

  it("sortiert innerhalb einer Spalte die zuletzt geänderten Artikel nach oben", () => {
    const spalten = gruppiereNachStatus([
      artikel({ id: "alt", status: "REVIEW", updatedAt: new Date("2026-07-01T08:00:00Z") }),
      artikel({ id: "neu", status: "REVIEW", updatedAt: new Date("2026-07-20T08:00:00Z") }),
    ]);
    const review = spalten.find((s) => s.status === "REVIEW")!;
    expect(review.artikel.map((a) => a.id)).toEqual(["neu", "alt"]);
  });
});
