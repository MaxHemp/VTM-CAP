"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { AktionsErgebnis } from "./actions";
import { aktualisiereBenutzerAction, entferneBenutzerAction, ladeBenutzerEinAction } from "./actions";

export interface TeamMitglied {
  id: string;
  name: string | null;
  email: string;
  rolleId: string;
  rollenName: string;
  teamVerwalten: boolean;
}

export interface RollenOption {
  id: string;
  name: string;
}

const eingabeStil: React.CSSProperties = {
  minHeight: 38,
  padding: "0 10px",
  border: "1px solid var(--c-neutral-300)",
  borderRadius: 4,
  fontSize: "0.84rem",
  background: "var(--c-white)",
  width: "100%",
};

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

function RollenSelect({
  name,
  defaultValue,
  rollen,
  id,
}: {
  name: string;
  defaultValue: string;
  rollen: RollenOption[];
  id?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} style={{ ...eingabeStil, cursor: "pointer" }}>
      {rollen.map((rolle) => (
        <option key={rolle.id} value={rolle.id}>
          {rolle.name}
        </option>
      ))}
    </select>
  );
}

function MitgliedZeile({
  mitglied,
  rollen,
  eigeneId,
  darfBearbeiten,
}: {
  mitglied: TeamMitglied;
  rollen: RollenOption[];
  eigeneId: string | null;
  darfBearbeiten: boolean;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [speichernErgebnis, speichern, speichernLaeuft] = useActionState(aktualisiereBenutzerAction, null);
  const [entfernenErgebnis, entfernen, entfernenLaeuft] = useActionState(entferneBenutzerAction, null);
  const istSelbst = mitglied.id === eigeneId;

  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 180, fontSize: "0.86rem", fontWeight: 600 }}>
          {mitglied.name ?? mitglied.email}
          <span style={{ display: "block", fontWeight: 400, fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {mitglied.email}
            {istSelbst ? " · Sie" : ""}
          </span>
        </span>
        <span
          className={mitglied.teamVerwalten ? "status status-mandatory" : "status status-recommended"}
          style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}
        >
          {mitglied.rollenName}
        </span>
        {darfBearbeiten ? (
          <span style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="button button-secondary"
              style={{ minHeight: 30, padding: "0.2rem 0.6rem", fontSize: "0.74rem" }}
              onClick={() => setBearbeiten((wert) => !wert)}
            >
              {bearbeiten ? "Zuklappen" : "Bearbeiten"}
            </button>
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
      {bearbeiten && darfBearbeiten ? (
        <form
          action={speichern}
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "1fr 1fr 1fr auto",
            alignItems: "end",
            marginTop: 10,
            padding: "12px",
            background: "var(--c-paper-blue)",
            borderRadius: 6,
            border: "1px solid var(--border-soft)",
          }}
        >
          <input type="hidden" name="benutzerId" value={mitglied.id} />
          <div className="form-field">
            <label htmlFor={`name-${mitglied.id}`} style={{ fontSize: "0.74rem" }}>Name</label>
            <input id={`name-${mitglied.id}`} name="name" type="text" defaultValue={mitglied.name ?? ""} style={eingabeStil} />
          </div>
          <div className="form-field">
            <label htmlFor={`email-${mitglied.id}`} style={{ fontSize: "0.74rem" }}>E-Mail-Adresse</label>
            <input id={`email-${mitglied.id}`} name="email" type="email" required defaultValue={mitglied.email} style={eingabeStil} />
          </div>
          <div className="form-field">
            <label htmlFor={`rolle-${mitglied.id}`} style={{ fontSize: "0.74rem" }}>Rolle</label>
            <RollenSelect id={`rolle-${mitglied.id}`} name="rolleId" defaultValue={mitglied.rolleId} rollen={rollen} />
          </div>
          <button type="submit" className="button button-primary" disabled={speichernLaeuft} style={{ minHeight: 38 }}>
            {speichernLaeuft ? "Speichert …" : "Speichern"}
          </button>
        </form>
      ) : null}
      <Meldung ergebnis={speichernErgebnis ?? entfernenErgebnis} />
    </div>
  );
}

export function TeamVerwaltung({
  team,
  rollen,
  eigeneId,
  darfBearbeiten,
}: {
  team: TeamMitglied[];
  rollen: RollenOption[];
  eigeneId: string | null;
  darfBearbeiten: boolean;
}) {
  const [einladenErgebnis, einladen, einladenLaeuft] = useActionState(ladeBenutzerEinAction, null);
  const standardRolle = rollen.find((rolle) => rolle.name === "Redakteur") ?? rollen[0];

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
          <MitgliedZeile
            key={mitglied.id}
            mitglied={mitglied}
            rollen={rollen}
            eigeneId={eigeneId}
            darfBearbeiten={darfBearbeiten}
          />
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
              <RollenSelect id="einladung-rolle" name="rolleId" defaultValue={standardRolle?.id ?? ""} rollen={rollen} />
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
          Zugänge vergibt eine Rolle mit dem Recht „Team verwalten“.
        </p>
      )}
    </div>
  );
}
