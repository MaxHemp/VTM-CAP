import Link from "next/link";

export default function NichtGefunden() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--c-paper)" }}>
      <div className="card" style={{ width: "min(480px, 100%)", padding: "32px 34px", textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--c-blue-700)" }}>
          404
        </span>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Diese Seite gibt es nicht
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          Der Artikel wurde möglicherweise gelöscht oder der Link ist unvollständig.
        </p>
        <Link href="/pipeline" className="button button-primary">
          Zur Pipeline
        </Link>
      </div>
    </main>
  );
}
