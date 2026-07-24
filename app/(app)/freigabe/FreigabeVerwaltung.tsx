"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { erstelleFreigabeLinkAction } from "./actions";

export function FreigabeVerwaltung({
  artikelListe,
  darfErstellen,
}: {
  artikelListe: Array<{ id: string; titel: string; kunde: string | null }>;
  darfErstellen: boolean;
}) {
  const router = useRouter();
  const [artikelId, setArtikelId] = useState(artikelListe[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string; url?: string } | null>(null);
  const [laeuft, startTransition] = useTransition();

  function erstelle() {
    setMeldung(null);
    startTransition(async () => {
      const ergebnis = await erstelleFreigabeLinkAction(artikelId, email);
      setMeldung({ ok: ergebnis.ok, text: ergebnis.meldung, url: ergebnis.url });
      if (ergebnis.ok) {
        setEmail("");
        router.refresh();
      }
    });
  }

  if (artikelListe.length === 0) {
    return (
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>
        Es gibt aktuell keinen aufbereiteten Sponsored-Artikel. Laden Sie ein Kundenmanuskript mit
        Sponsored-Kennzeichnung hoch, um einen Freigabelink zu erzeugen.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) auto", gap: 10, alignItems: "end" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="freigabe-artikel" style={{ fontSize: "0.8rem", fontWeight: 700 }}>Sponsored-Artikel</label>
          <select
            id="freigabe-artikel"
            value={artikelId}
            onChange={(ereignis) => setArtikelId(ereignis.target.value)}
            style={{ minHeight: 42, padding: "0 10px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.84rem", background: "var(--c-white)", cursor: "pointer" }}
          >
            {artikelListe.map((artikel) => (
              <option key={artikel.id} value={artikel.id}>
                {artikel.titel} ({artikel.kunde ?? "Kunde"})
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="freigabe-email" style={{ fontSize: "0.8rem", fontWeight: 700 }}>E-Mail des Kunden</label>
          <input
            id="freigabe-email"
            type="email"
            value={email}
            onChange={(ereignis) => setEmail(ereignis.target.value)}
            placeholder="freigabe@kunde.de"
            style={{ minHeight: 42, padding: "0 12px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.84rem", background: "var(--c-white)" }}
          />
        </div>
        <button type="button" className="button button-primary" onClick={erstelle} disabled={!darfErstellen || laeuft}>
          {laeuft ? "Erstellt …" : "Freigabelink erzeugen"}
        </button>
      </div>
      {!darfErstellen ? (
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.78rem" }}>
          Freigabelinks kann nur die Rolle Herausgeber erzeugen.
        </p>
      ) : null}
      {meldung ? (
        <div
          role="status"
          style={{
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
          {meldung.url ? (
            <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", wordBreak: "break-all" }}>{meldung.url}</code>
              <button
                type="button"
                className="button button-quiet"
                style={{ minHeight: 28, padding: "0.15rem 0.5rem", fontSize: "0.72rem" }}
                onClick={() => navigator.clipboard.writeText(meldung.url!)}
              >
                Kopieren
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
