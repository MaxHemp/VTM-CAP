"use client";

import { useActionState } from "react";
import type { AktionsErgebnis } from "./actions";
import { aendereBenutzerRolleAction, entferneBenutzerAction, ladeBenutzerEinAction } from "./actions";

export interface TeamMitglied {
  id: string;
  name: string | null;
  email: string;
  rolle: "HERAUSGEBER" | "REDAKTEUR";
}

const ROLLEN_LABELS: Record<TeamMitglied["rolle"], string> = {
  HERAUSGEBER: "Herausgeber",
  REDAKTEUR: "Redakteur",
};

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

function MitgliedZeile({
  mitglied,
  eigeneId,
  darfBearbeiten,
}: {
  mitglied: TeamMitglied;
  eigeneId: string | null;
  darfBearbeiten: boolean;
}) {
  const [rolleErgebnis, rolleAendern, rolleLaeuft] = useActionState(aendereBenutzerRolleAction, null);
  const [entfernenErgebnis, entfernen, entfernenLaeuft] = useActionState(entferneBenutzerAction, null);
  const istSelbst = mitglied.id === eigeneId;
  const neueRolle = mitglied.rolle === "HERAUSGEBER" ? "REDAKTEUR" : "HERAUSGEBER";

  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", padding: "9px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 180, fontSize: "0.86rem", fontWeight: 600 }}>
          {mitglied.name ?? mitglied.email}
          <span style={{ display: "block", fontWeight: 400, fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {mitglied.email}
            {istSelbst ? " · Sie" : ""}
          </span>
        </span>
        <span
          className={mitglied.rolle === "HERAUSGEBER" ? "status status-mandatory" : "status status-recommended"}
          style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}
        >
          {ROLLEN_LABELS[mitglied.rolle]}
        </span>
        {darfBearbeiten ? (
          <span style={{ display: "flex", gap: 6 }}>
            <form action={rolleAendern}>
              <input type="hidden" name="benutzerId" value={mitglied.id} />
              <input type="hidden" name="rolle" value={neueRolle} />
              <button
                type="submit"
                className="button button-secondary"
                disabled={rolleLaeuft}
                style={{ minHeight: 30, padding: "0.2rem 0.6rem", fontSize: "0.74rem" }}
              >
                {rolleLaeuft ? "Ändert …" : `Zu ${ROLLEN_LABELS[neueRolle]} machen`}
              </button>
            </form>
            <form action={entfernen}>
              <input type="hidden" name="benutzerId" value={mitglied.id} />
              <button
                type="submit"
                className="button button-secondary"
                disabled={entfernenLaeuft || istSelbst}
                title={istSelbst ? "Der eigene Zugang kann nicht entfernt werden." : undefined}
                style={{ minHeight: 30, padding: "0.2rem 0.6rem", fontSize: "0.74rem", color: "var(--c-danger)" }}
              >
                {entfernenLaeuft ? "Entfernt …" : "Entfernen"}
              </button>
            </form>
          </span>
        ) : null}
      </div>
      <Meldung ergebnis={rolleErgebnis ?? entfernenErgebnis} />
    </div>
  );
}

export function TeamVerwaltung({
  team,
  eigeneId,
  darfBearbeiten,
}: {
  team: TeamMitglied[];
  eigeneId: string | null;
  darfBearbeiten: boolean;
}) {
  const [einladenErgebnis, einladen, einladenLaeuft] = useActionState(ladeBenutzerEinAction, null);

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
        Team und Zugänge
      </h3>
      <p style={{ margin: "0 0 12px", fontSize: "0.78rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
        Anmelden können sich ausschließlich die hier hinterlegten E-Mail-Adressen. Eingeladene erhalten eine
        E-Mail mit dem Anmeldelink-Verfahren; ein Passwort gibt es nicht.
      </p>
      <div style={{ display: "grid" }}>
        {team.map((mitglied) => (
          <MitgliedZeile key={mitglied.id} mitglied={mitglied} eigeneId={eigeneId} darfBearbeiten={darfBearbeiten} />
        ))}
      </div>
      {darfBearbeiten ? (
        <form
          action={einladen}
          style={{
            display: "grid",
            gap: 10,
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid var(--border-medium)",
          }}
        >
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <div className="form-field">
              <label htmlFor="einladung-name">Name (optional)</label>
              <input id="einladung-name" name="name" type="text" placeholder="Vor- und Nachname" />
            </div>
            <div className="form-field">
              <label htmlFor="einladung-rolle">Rolle</label>
              <select
                id="einladung-rolle"
                name="rolle"
                defaultValue="REDAKTEUR"
                style={{
                  minHeight: 42,
                  padding: "0 10px",
                  border: "1px solid var(--c-neutral-300)",
                  borderRadius: 4,
                  fontSize: "0.86rem",
                  background: "var(--c-white)",
                  cursor: "pointer",
                }}
              >
                <option value="REDAKTEUR">Redakteur</option>
                <option value="HERAUSGEBER">Herausgeber</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="einladung-email">E-Mail-Adresse</label>
            <input id="einladung-email" name="email" type="email" required placeholder="kollege@beispiel.de" />
          </div>
          <div>
            <button type="submit" className="button button-primary" disabled={einladenLaeuft}>
              {einladenLaeuft ? "Lädt ein …" : "Zugang einladen"}
            </button>
          </div>
          <Meldung ergebnis={einladenErgebnis} />
        </form>
      ) : (
        <p style={{ margin: "12px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Zugänge vergibt die Rolle Herausgeber.
        </p>
      )}
    </div>
  );
}
