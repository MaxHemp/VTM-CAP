"use client";

import { useActionState } from "react";
import { aktualisiereProfilAction } from "./actions";

export function ProfilKarte({
  name,
  email,
  rollenName,
}: {
  name: string | null;
  email: string;
  rollenName: string;
}) {
  const [ergebnis, speichern, laeuft] = useActionState(aktualisiereProfilAction, null);

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h3
          style={{
            margin: 0,
            flex: 1,
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Mein Profil
        </h3>
        <span className="status status-recommended" style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}>
          {rollenName}
        </span>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: "0.78rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
        Die Anmeldung ist passwortlos: Der Anmeldelink geht an Ihre hinterlegte E-Mail-Adresse. Wenn Sie die
        Adresse ändern, melden Sie sich künftig über die neue Adresse an. Ihre Rolle vergibt das Team-Management.
      </p>
      <form action={speichern} style={{ display: "grid", gap: 14 }}>
        <div className="form-field">
          <label htmlFor="profil-name">Name</label>
          <input id="profil-name" name="name" type="text" defaultValue={name ?? ""} placeholder="Vor- und Nachname" />
        </div>
        <div className="form-field">
          <label htmlFor="profil-email">E-Mail-Adresse</label>
          <input id="profil-email" name="email" type="email" required defaultValue={email} />
        </div>
        <div>
          <button type="submit" className="button button-primary" disabled={laeuft}>
            {laeuft ? "Speichert …" : "Profil speichern"}
          </button>
        </div>
        {ergebnis ? (
          <p
            role="status"
            style={{
              margin: 0,
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
        ) : null}
      </form>
    </div>
  );
}
