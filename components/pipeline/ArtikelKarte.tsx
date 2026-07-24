import Link from "next/link";
import type { BoardArtikel } from "@/lib/status";
import { FORMAT_LABELS, SCORE_MAXIMUM, SCORE_SCHWELLE, naechsterSchritt } from "@/lib/status";

export function ArtikelKarte({ artikel }: { artikel: BoardArtikel }) {
  const scoreFarbe =
    artikel.qualitaetsScore === null
      ? "var(--text-muted)"
      : artikel.qualitaetsScore >= SCORE_SCHWELLE
        ? "var(--c-success)"
        : "var(--c-warning)";
  const schritt = naechsterSchritt(artikel);

  return (
    <article className="card" style={{ padding: "14px 16px" }}>
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
            title={`Qualitätsscore (Schwelle ${SCORE_SCHWELLE}/${SCORE_MAXIMUM})`}
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
      <h3 style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.4 }}>
        <Link
          href={`/artikel/${artikel.id}`}
          style={{ color: "var(--text-primary)", textDecoration: "none", fontFamily: "var(--font-body)" }}
        >
          {artikel.titel}
        </Link>
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)" }}>
          {artikel.sponsored && artikel.kunde ? `Anzeige · ${artikel.kunde}` : (artikel.autorName ?? "—")}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>
          {artikel.updatedAt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
        </span>
      </div>
      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 9 }}>
        {schritt.extern ? (
          <a
            href={schritt.href}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--action)" }}
          >
            {schritt.label} →
          </a>
        ) : (
          <Link href={schritt.href} style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--action)" }}>
            {schritt.label} →
          </Link>
        )}
      </div>
    </article>
  );
}
