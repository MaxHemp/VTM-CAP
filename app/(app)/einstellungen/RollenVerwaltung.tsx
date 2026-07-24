"use client";

import { useState } from "react";
import { useActionState } from "react";
import { RECHTE, type RechteSatz } from "@/lib/rollen";
import type { AktionsErgebnis } from "./actions";
import { aktualisiereRolleAction, erstelleRolleAction, loescheRolleAction } from "./actions";

export interface RollenEintrag {
  id: string;
  name: string;
  beschreibung: string | null;
  istSystem: boolean;
  benutzerAnzahl: number;
  rechte: RechteSatz;
}

function Meldung({ ergebnis }: { ergebnis: AktionsErgebnis | null }) {
  if (!ergebnis) {
    return null;
  }
  return (
    <p
      role="status"
      style={{
        margin: "10px 0 0",
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

function RechteFelder({ rechte, deaktiviert }: { rechte?: RechteSatz; deaktiviert?: boolean }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {RECHTE.map((recht) => (
        <label
          key={recht.schluessel}
          style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: "0.8rem", cursor: deaktiviert ? "default" : "pointer" }}
        >
          <input
            type="checkbox"
            name={`recht-${recht.schluessel}`}
            defaultChecked={rechte?.[recht.schluessel] ?? false}
            disabled={deaktiviert}
            style={{ width: "0.95rem", height: "0.95rem", accentColor: "var(--c-blue-700)", flex: "none", transform: "translateY(2px)" }}
          />
          <span>
            <strong style={{ fontWeight: 700 }}>{recht.label}</strong>
            <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>{recht.beschreibung}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function RollenZeile({ rolle }: { rolle: RollenEintrag }) {
  const [offen, setOffen] = useState(false);
  const [speichernErgebnis, speichern, speichernLaeuft] = useActionState(aktualisiereRolleAction, null);
  const [loeschenErgebnis, loeschen, loeschenLaeuft] = useActionState(loescheRolleAction, null);
  const aktiveRechte = RECHTE.filter((recht) => rolle.rechte[recht.schluessel]).map((recht) => recht.label);

  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 180 }}>
          <span style={{ fontSize: "0.86rem", fontWeight: 700 }}>{rolle.name}</span>
          {rolle.istSystem ? (
            <span className="tag" style={{ marginLeft: 8, minHeight: 18, padding: "0.06rem 0.35rem", fontSize: "0.52rem" }}>
              System
            </span>
          ) : null}
          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {aktiveRechte.length > 0 ? aktiveRechte.join(" · ") : "Nur Grundfunktionen (Upload, Review, LinkedIn)"}
          </span>
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)" }}>
          {rolle.benutzerAnzahl} {rolle.benutzerAnzahl === 1 ? "ZUGANG" : "ZUGÄNGE"}
        </span>
        <button
          type="button"
          className="button button-secondary"
          style={{ minHeight: 30, padding: "0.2rem 0.6rem", fontSize: "0.74rem" }}
          onClick={() => setOffen((wert) => !wert)}
        >
          {offen ? "Zuklappen" : rolle.istSystem ? "Ansehen" : "Bearbeiten"}
        </button>
      </div>
      {offen ? (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "var(--c-paper-blue)",
            borderRadius: 6,
            border: "1px solid var(--border-soft)",
          }}
        >
          {rolle.istSystem ? (
            <>
              <p style={{ margin: "0 0 10px", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Systemrolle – nicht änderbar. {rolle.beschreibung}
              </p>
              <RechteFelder rechte={rolle.rechte} deaktiviert />
            </>
          ) : (
            <form action={speichern} style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="rolleId" value={rolle.id} />
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 2fr" }}>
                <div className="form-field">
                  <label htmlFor={`rolle-name-${rolle.id}`} style={{ fontSize: "0.74rem" }}>Name</label>
                  <input id={`rolle-name-${rolle.id}`} name="name" type="text" required defaultValue={rolle.name} />
                </div>
                <div className="form-field">
                  <label htmlFor={`rolle-beschreibung-${rolle.id}`} style={{ fontSize: "0.74rem" }}>Beschreibung (optional)</label>
                  <input id={`rolle-beschreibung-${rolle.id}`} name="beschreibung" type="text" defaultValue={rolle.beschreibung ?? ""} />
                </div>
              </div>
              <RechteFelder rechte={rolle.rechte} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="button button-primary" disabled={speichernLaeuft}>
                  {speichernLaeuft ? "Speichert …" : "Rolle speichern"}
                </button>
                <button
                  type="submit"
                  formAction={loeschen}
                  className="button button-secondary"
                  disabled={loeschenLaeuft || rolle.benutzerAnzahl > 0}
                  title={rolle.benutzerAnzahl > 0 ? "Zuerst allen Zugängen eine andere Rolle zuweisen." : undefined}
                  style={{ color: "var(--c-danger)", borderColor: "rgb(165 38 38 / 0.35)" }}
                >
                  {loeschenLaeuft ? "Löscht …" : "Rolle löschen"}
                </button>
              </div>
            </form>
          )}
          <Meldung ergebnis={speichernErgebnis ?? loeschenErgebnis} />
        </div>
      ) : null}
    </div>
  );
}

export function RollenVerwaltung({ rollen }: { rollen: RollenEintrag[] }) {
  const [anlegenOffen, setAnlegenOffen] = useState(false);
  const [anlegenErgebnis, anlegen, anlegenLaeuft] = useActionState(erstelleRolleAction, null);

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <h3
        style={{
          margin: "0 0 6px",
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Rollen
      </h3>
      <p style={{ margin: "0 0 12px", fontSize: "0.78rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
        Definieren Sie eigene Rollen mit passenden Rechten (z. B. „Lektorat“ ohne Publizieren). Grundfunktionen
        wie Upload, Review und LinkedIn Studio stehen jeder angemeldeten Person offen.
      </p>
      <div style={{ display: "grid" }}>
        {rollen.map((rolle) => (
          <RollenZeile key={rolle.id} rolle={rolle} />
        ))}
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-medium)" }}>
        {anlegenOffen ? (
          <form action={anlegen} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 2fr" }}>
              <div className="form-field">
                <label htmlFor="neue-rolle-name">Name</label>
                <input id="neue-rolle-name" name="name" type="text" required placeholder="z. B. Lektorat" />
              </div>
              <div className="form-field">
                <label htmlFor="neue-rolle-beschreibung">Beschreibung (optional)</label>
                <input id="neue-rolle-beschreibung" name="beschreibung" type="text" placeholder="Wofür ist diese Rolle gedacht?" />
              </div>
            </div>
            <RechteFelder />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="button button-primary" disabled={anlegenLaeuft}>
                {anlegenLaeuft ? "Legt an …" : "Rolle anlegen"}
              </button>
              <button type="button" className="button button-secondary" onClick={() => setAnlegenOffen(false)}>
                Abbrechen
              </button>
            </div>
            <Meldung ergebnis={anlegenErgebnis} />
          </form>
        ) : (
          <button type="button" className="button button-secondary" onClick={() => setAnlegenOffen(true)}>
            Neue Rolle anlegen
          </button>
        )}
      </div>
    </div>
  );
}
