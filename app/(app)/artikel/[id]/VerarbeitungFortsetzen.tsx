"use client";

// Setzt eine unterbrochene Verarbeitung fort: Jeder Poll-Tick führt genau
// einen Job-Schritt aus (DB-Queue). Die Komponente erscheint auf der
// Artikel-Detailseite, solange ein offener Job existiert – so kann die
// Aufbereitung auch nach Verlassen der Upload-Seite zu Ende laufen.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { verarbeiteNaechstenSchrittAction, type JobZustand } from "../neu/actions";

export function VerarbeitungFortsetzen({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [zustand, setZustand] = useState<JobZustand | null>(null);
  const laeuft = useRef(false);

  const tick = useCallback(async () => {
    if (laeuft.current) {
      return;
    }
    laeuft.current = true;
    try {
      const neuerZustand = await verarbeiteNaechstenSchrittAction(jobId);
      setZustand(neuerZustand);
      if (neuerZustand.status === "FERTIG") {
        router.refresh();
      }
    } catch {
      // Nächster Tick versucht es erneut; Fehlerdetails stehen im Job.
    } finally {
      laeuft.current = false;
    }
  }, [jobId, router]);

  useEffect(() => {
    void tick();
    const intervall = setInterval(() => {
      void tick();
    }, 1800);
    return () => clearInterval(intervall);
  }, [tick]);

  const fertigOderFehler = zustand?.status === "FERTIG" || zustand?.status === "FEHLER";

  return (
    <div className="card" style={{ maxWidth: 720, padding: "18px 22px", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {!fertigOderFehler ? (
          <span
            aria-hidden
            style={{
              width: 14,
              height: 14,
              border: "2px solid var(--c-blue-100)",
              borderTopColor: "var(--c-blue-700)",
              borderRadius: "50%",
              animation: "vtm-spin 800ms linear infinite",
            }}
          />
        ) : null}
        <strong style={{ fontSize: "0.9rem" }}>
          {zustand?.status === "FEHLER"
            ? "Die Verarbeitung ist fehlgeschlagen"
            : zustand?.status === "FERTIG"
              ? "Verarbeitung abgeschlossen"
              : "Automatische Aufbereitung läuft"}
        </strong>
      </div>
      <ol className="workflow-steps">
        {(zustand?.schrittStatus ?? []).map((schritt) => (
          <li
            key={schritt.schritt}
            style={
              schritt.status === "FERTIG"
                ? { borderColor: "rgb(23 102 58 / 0.35)", background: "var(--c-success-bg)", color: "var(--c-success)" }
                : schritt.status === "LAEUFT"
                  ? { borderColor: "rgb(18 63 166 / 0.35)", background: "var(--c-blue-050)", color: "var(--c-blue-800)" }
                  : undefined
            }
          >
            {schritt.name}
          </li>
        ))}
      </ol>
      {zustand?.fehler ? (
        <p
          role="alert"
          style={{
            margin: "12px 0 0",
            padding: "10px 12px",
            borderRadius: 4,
            fontSize: "0.82rem",
            lineHeight: 1.55,
            color: "var(--c-danger)",
            background: "var(--c-danger-bg)",
            border: "1px solid rgb(165 38 38 / 0.24)",
          }}
        >
          {zustand.fehler}
        </p>
      ) : null}
    </div>
  );
}
