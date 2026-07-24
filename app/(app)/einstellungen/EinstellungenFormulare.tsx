"use client";

import { useActionState } from "react";
import type { AktionsErgebnis } from "./actions";
import {
  speichereGhostEinstellungenAction,
  speichereRedaktionEinstellungenAction,
  testeGhostVerbindungAction,
} from "./actions";

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

const kartenTitelStil: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: "1rem",
  fontWeight: 700,
  letterSpacing: "-0.02em",
};

export function GhostEinstellungenForm({
  ghostUrl,
  keyMaskiert,
  letzterAbgleich,
  darfBearbeiten,
}: {
  ghostUrl: string;
  keyMaskiert: string | null;
  letzterAbgleich: string | null;
  darfBearbeiten: boolean;
}) {
  const [speichernErgebnis, speichern, speichernLaeuft] = useActionState(
    speichereGhostEinstellungenAction,
    null
  );
  const [testErgebnis, testen, testLaeuft] = useActionState(testeGhostVerbindungAction, null);
  const verbunden = letzterAbgleich?.includes("OK") ?? false;

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <h3 style={{ ...kartenTitelStil, flex: 1 }}>Ghost-Verbindung</h3>
        <span
          className={verbunden ? "status status-good" : "status status-optional"}
          style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}
        >
          {verbunden ? "Verbunden" : "Nicht geprüft"}
        </span>
      </div>
      <form action={speichern} style={{ display: "grid", gap: 14 }}>
        <div className="form-field">
          <label htmlFor="ghostUrl">Site-URL</label>
          <input
            id="ghostUrl"
            name="ghostUrl"
            type="url"
            defaultValue={ghostUrl}
            placeholder="https://mein-magazin.ghost.io"
            disabled={!darfBearbeiten}
          />
        </div>
        <div className="form-field">
          <label htmlFor="ghostAdminApiKey">Admin API Key</label>
          <input
            id="ghostAdminApiKey"
            name="ghostAdminApiKey"
            type="password"
            placeholder={keyMaskiert ?? "id:secret aus Ghost Admin → Integrationen"}
            autoComplete="off"
            disabled={!darfBearbeiten}
          />
          <small>
            {keyMaskiert
              ? `Hinterlegt: ${keyMaskiert} – Feld leer lassen, um den Key zu behalten. Der Key wird mit AES-256-GCM verschlüsselt gespeichert.`
              : "Der Key wird mit AES-256-GCM verschlüsselt in der Datenbank abgelegt und nie im Klartext angezeigt."}
          </small>
        </div>
        {letzterAbgleich ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-muted)" }}>
            LETZTER ABGLEICH: {letzterAbgleich}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="button button-primary" disabled={!darfBearbeiten || speichernLaeuft}>
            {speichernLaeuft ? "Speichert …" : "Speichern"}
          </button>
          <button
            type="submit"
            className="button button-secondary"
            formAction={() => testen()}
            disabled={!darfBearbeiten || testLaeuft}
          >
            {testLaeuft ? "Prüft …" : "Verbindung testen"}
          </button>
        </div>
      </form>
      <Meldung ergebnis={speichernErgebnis} />
      <Meldung ergebnis={testErgebnis} />
      {!darfBearbeiten ? (
        <p style={{ margin: "12px 0 0", color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.6 }}>
          Änderungen an der Ghost-Verbindung sind der Rolle Herausgeber vorbehalten.
        </p>
      ) : null}
    </div>
  );
}

export function RedaktionEinstellungenForm({
  anthropicKeyMaskiert,
  ctaStandardUrl,
  ctaStandardLabel,
  darfBearbeiten,
}: {
  anthropicKeyMaskiert: string | null;
  ctaStandardUrl: string;
  ctaStandardLabel: string;
  darfBearbeiten: boolean;
}) {
  const [ergebnis, speichern, laeuft] = useActionState(speichereRedaktionEinstellungenAction, null);

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <h3 style={{ ...kartenTitelStil, marginBottom: 14 }}>KI und Standard-CTA</h3>
      <form action={speichern} style={{ display: "grid", gap: 14 }}>
        <div className="form-field">
          <label htmlFor="anthropicApiKey">Anthropic API Key</label>
          <input
            id="anthropicApiKey"
            name="anthropicApiKey"
            type="password"
            placeholder={anthropicKeyMaskiert ?? "sk-ant-…"}
            autoComplete="off"
            disabled={!darfBearbeiten}
          />
          <small>
            {anthropicKeyMaskiert
              ? `Hinterlegt: ${anthropicKeyMaskiert} – Feld leer lassen, um den Key zu behalten.`
              : "Wird ab Meilenstein M2 für Card-Generierung und Qualitätsscore genutzt; verschlüsselte Ablage."}
          </small>
        </div>
        <div className="form-field">
          <label htmlFor="ctaStandardUrl">Standard-CTA-Link</label>
          <input
            id="ctaStandardUrl"
            name="ctaStandardUrl"
            type="url"
            defaultValue={ctaStandardUrl}
            placeholder="https://versicherungstech-magazin.de/ai-insurance-briefing"
            disabled={!darfBearbeiten}
          />
        </div>
        <div className="form-field">
          <label htmlFor="ctaStandardLabel">Standard-CTA-Beschriftung</label>
          <input
            id="ctaStandardLabel"
            name="ctaStandardLabel"
            type="text"
            defaultValue={ctaStandardLabel}
            disabled={!darfBearbeiten}
          />
          <small>Jeder Artikel erhält genau einen CTA (Bauregel aus brand-rules).</small>
        </div>
        <div>
          <button type="submit" className="button button-primary" disabled={!darfBearbeiten || laeuft}>
            {laeuft ? "Speichert …" : "Speichern"}
          </button>
        </div>
      </form>
      <Meldung ergebnis={ergebnis} />
    </div>
  );
}
