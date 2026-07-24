import Link from "next/link";
import type { BoardArtikel } from "@/lib/status";
import { FORMAT_LABELS, SCORE_MAXIMUM, SCORE_SCHWELLE } from "@/lib/status";

export function ArtikelKarte({ artikel }: { artikel: BoardArtikel }) {
  const scoreFarbe =
    artikel.qualitaetsScore === null
      ? "var(--text-muted)"
      : artikel.qualitaetsScore >= SCORE_SCHWELLE
        ? "var(--c-success)"
        : "var(--c-warning)";

  return (
    <Link href={`/artikel/${artikel.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article className="card" style={{ padding: "14px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
          <span
            className={artikel.sponsored ? "tag tag-brass" : "tag tag-electric"}
            style={{ minHeight: 22, padding: "0.14rem 0.4rem", fontSize: "0.58rem" }}
          >
            {FORMAT_LABELS[artikel.format]}
          </span>
          <span style={{ flex: 1 }} />
          {artikel.qualitaetsScore !== null ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                fontWeight: 700,
                color: scoreFarbe,
              }}
            >
              {artikel.qualitaetsScore}/{SCORE_MAXIMUM}
            </span>
          ) : null}
        </div>
        <h3
          style={{
            margin: "0 0 10px",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            lineHeight: 1.4,
            color: "var(--text-primary)",
          }}
        >
          {artikel.titel}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)" }}>
            {artikel.sponsored && artikel.kunde ? `Anzeige · ${artikel.kunde}` : (artikel.autorName ?? "—")}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>
            {artikel.updatedAt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
          </span>
        </div>
      </article>
    </Link>
  );
}
