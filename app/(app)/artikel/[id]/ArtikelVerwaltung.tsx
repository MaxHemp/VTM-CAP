"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { AktionsErgebnis } from "./actions";
import { aktualisiereArtikelAction, loescheArtikelAction } from "./actions";

export interface VerwaltungArtikel {
  id: string;
  titel: string;
  kategorie: string | null;
  format: string;
  status: string;
  sponsored: boolean;
  kunde: string | null;
}

const FORMATE: Array<{ wert: string; label: string }> = [
  { wert: "EINORDNUNG", label: "Einordnung" },
  { wert: "ANALYSE", label: "Analyse" },
  { wert: "PRAXIS_CASE", label: "Praxis-Case" },
  { wert: "LEITFADEN", label: "Leitfaden" },
  { wert: "SPONSORED", label: "Sponsored" },
  { wert: "INTERVIEW", label: "Interview" },
];

const STATUS: Array<{ wert: string; label: string }> = [
  { wert: "EINGEGANGEN", label: "Eingegangen" },
  { wert: "IN_AUFBEREITUNG", label: "In Aufbereitung" },
  { wert: "REVIEW", label: "Review" },
  { wert: "KUNDENFREIGABE", label: "Kundenfreigabe" },
  { wert: "BEREIT", label: "Bereit" },
  { wert: "IN_GHOST", label: "In Ghost" },
];

function Meldung({ ergebnis }: { ergebnis: AktionsErgebnis | null }) {
  if (!ergebnis) {
    return null;
  }
  return (
    <p
      role="status"
      style={{
        margin: "12px 0 0",
        padding: "10px 12px",
        borderRadius: 4,
        fontSize: "0.82rem",
        lineHeight: 1.55,
        color: ergebnis.ok ? "var(--c-success)" : "var(--c-danger)",
        background: ergebnis.ok ? "var(--c-success-bg)" : "var(--c-danger-bg)",
        border: `1px solid ${ergebnis.ok ? "rgb(23 102 58 / 0.24)" : "rgb(165 38 38 / 0.24)"}`,
      }}
    >
      {ergebnis.meldung}
    </p>
  );
}

export function ArtikelVerwaltung({ artikel }: { artikel: VerwaltungArtikel }) {
  const [speichernErgebnis, speichern, speichernLaeuft] = useActionState(aktualisiereArtikelAction, null);
  const [loeschenErgebnis, loeschen, loeschenLaeuft] = useActionState(loescheArtikelAction, null);
  const [sponsored, setSponsored] = useState(artikel.sponsored);
  const [loeschenBestaetigt, setLoeschenBestaetigt] = useState(false);

  return (
    <div className="card" style={{ maxWidth: 720, padding: "20px 22px", marginTop: 18 }}>
      <h3
        style={{
          margin: "0 0 6px",
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Artikel verwalten
      </h3>
      <p style={{ margin: "0 0 14px", fontSize: "0.78rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
        Sichtbar nur für die Rolle Herausgeber. Statuswechsel verschieben den Artikel auf dem Pipeline-Board.
      </p>
      <form action={speichern} style={{ display: "grid", gap: 14 }}>
        <input type="hidden" name="artikelId" value={artikel.id} />
        <div className="form-field">
          <label htmlFor="verwaltung-titel">Titel</label>
          <input id="verwaltung-titel" name="titel" type="text" required defaultValue={artikel.titel} />
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="form-field">
            <label htmlFor="verwaltung-kategorie">Kategorie</label>
            <input
              id="verwaltung-kategorie"
              name="kategorie"
              type="text"
              defaultValue={artikel.kategorie ?? ""}
              placeholder="z. B. Prozesse"
            />
          </div>
          <div className="form-field">
            <label htmlFor="verwaltung-format">Format</label>
            <select id="verwaltung-format" name="format" defaultValue={artikel.format}>
              {FORMATE.map((eintrag) => (
                <option key={eintrag.wert} value={eintrag.wert}>
                  {eintrag.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="verwaltung-status">Status</label>
            <select id="verwaltung-status" name="status" defaultValue={artikel.status}>
              {STATUS.map((eintrag) => (
                <option key={eintrag.wert} value={eintrag.wert}>
                  {eintrag.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.86rem", fontWeight: 600 }}>
            <input
              type="checkbox"
              name="sponsored"
              checked={sponsored}
              onChange={(ereignis) => setSponsored(ereignis.target.checked)}
              style={{ width: "1.1rem", height: "1.1rem", accentColor: "var(--c-blue-700)" }}
            />
            Sponsored Content
          </label>
          {sponsored ? (
            <div className="form-field">
              <label htmlFor="verwaltung-kunde">Kunde</label>
              <input
                id="verwaltung-kunde"
                name="kunde"
                type="text"
                defaultValue={artikel.kunde ?? ""}
                placeholder="z. B. d.velop"
              />
            </div>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button button-primary" disabled={speichernLaeuft}>
            {speichernLaeuft ? "Speichert …" : "Änderungen speichern"}
          </button>
        </div>
        <Meldung ergebnis={speichernErgebnis} />
      </form>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-medium)" }}>
        {loeschenBestaetigt ? (
          <form action={loeschen} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input type="hidden" name="artikelId" value={artikel.id} />
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--c-danger)" }}>
              Artikel endgültig löschen? Manuskript, Card, LinkedIn-Posts und Freigabelinks werden mit entfernt.
            </span>
            <button
              type="submit"
              className="button button-primary"
              disabled={loeschenLaeuft}
              style={{ background: "var(--c-danger)", boxShadow: "none" }}
            >
              {loeschenLaeuft ? "Löscht …" : "Ja, endgültig löschen"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setLoeschenBestaetigt(false)}
            >
              Abbrechen
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="button button-secondary"
            style={{ color: "var(--c-danger)", borderColor: "rgb(165 38 38 / 0.35)" }}
            onClick={() => setLoeschenBestaetigt(true)}
          >
            Artikel löschen
          </button>
        )}
        <Meldung ergebnis={loeschenErgebnis} />
      </div>
    </div>
  );
}
