"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { freigabeEntscheidungAction } from "./actions";

export function RueckmeldungForm({ token }: { token: string }) {
  const router = useRouter();
  const [kommentar, setKommentar] = useState("");
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null);
  const [sendet, startTransition] = useTransition();

  function sende(entscheidung: "FREIGEGEBEN" | "AENDERUNG_ANGEFRAGT") {
    setMeldung(null);
    const formData = new FormData();
    formData.set("entscheidung", entscheidung);
    formData.set("kommentar", kommentar);
    startTransition(async () => {
      const ergebnis = await freigabeEntscheidungAction(token, formData);
      setMeldung({ ok: ergebnis.ok, text: ergebnis.meldung });
      if (ergebnis.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <textarea
        value={kommentar}
        onChange={(ereignis) => setKommentar(ereignis.target.value)}
        rows={3}
        placeholder="Optionaler Kommentar, bei Änderungswünschen bitte konkret beschreiben …"
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid var(--c-neutral-300)",
          borderRadius: 4,
          fontSize: "0.86rem",
          lineHeight: 1.6,
          background: "var(--c-white)",
          resize: "vertical",
          fontFamily: "var(--font-body)",
        }}
      />
      {meldung ? (
        <p
          role="status"
          style={{
            margin: "12px 0 0",
            padding: "10px 12px",
            borderRadius: 4,
            fontSize: "0.84rem",
            lineHeight: 1.55,
            color: meldung.ok ? "var(--c-success)" : "var(--c-danger)",
            background: meldung.ok ? "var(--c-success-bg)" : "var(--c-danger-bg)",
            border: `1px solid ${meldung.ok ? "rgb(23 102 58 / 0.24)" : "rgb(165 38 38 / 0.24)"}`,
          }}
        >
          {meldung.text}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button type="button" className="button button-primary" onClick={() => sende("FREIGEGEBEN")} disabled={sendet}>
          {sendet ? "Übermittelt …" : "Freigeben"}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => sende("AENDERUNG_ANGEFRAGT")}
          disabled={sendet}
        >
          Änderung anfragen
        </button>
      </div>
    </div>
  );
}
