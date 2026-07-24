"use client";

export default function FehlerZustand({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
      <div
        className="card"
        style={{ width: "min(520px, 100%)", padding: "30px 32px", textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}
      >
        <span className="status status-error" style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}>
          Fehler
        </span>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Hier ist etwas schiefgelaufen
        </h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          {error.message || "Die Ansicht konnte nicht geladen werden."} Prüfen Sie die Datenbankverbindung und
          versuchen Sie es erneut; besteht der Fehler weiter, hilft das Audit-Log in den Einstellungen bei der
          Eingrenzung.
        </p>
        <button type="button" className="button button-primary" onClick={() => reset()}>
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
