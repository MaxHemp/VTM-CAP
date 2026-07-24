import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ladeEinstellungenFuerAnzeige } from "@/lib/einstellungen";
import { Topbar } from "@/components/shell/Topbar";
import { GhostEinstellungenForm, RedaktionEinstellungenForm } from "./EinstellungenFormulare";

export const dynamic = "force-dynamic";

const ROLLEN_LABELS: Record<string, string> = {
  HERAUSGEBER: "Herausgeber",
  REDAKTEUR: "Redakteur",
};

export default async function EinstellungenSeite() {
  const session = await auth();
  const darfBearbeiten = session?.user.rolle === "HERAUSGEBER";
  const einstellungen = await ladeEinstellungenFuerAnzeige();
  const team = await prisma.user.findMany({ orderBy: { name: "asc" } });

  const letzterAbgleich = einstellungen.letzterGhostAbgleich
    ? `${einstellungen.letzterGhostAbgleich.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })} · ${einstellungen.letzterGhostStatus ?? ""}`
    : null;

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar bereich="ADMINISTRATION / EINSTELLUNGEN" titel="Einstellungen" />
      <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 18,
            maxWidth: 1160,
            alignItems: "start",
          }}
        >
          <GhostEinstellungenForm
            ghostUrl={einstellungen.ghostUrl}
            keyMaskiert={einstellungen.ghostAdminApiKeyMaskiert}
            letzterAbgleich={letzterAbgleich}
            darfBearbeiten={darfBearbeiten}
          />
          <RedaktionEinstellungenForm
            anthropicKeyMaskiert={einstellungen.anthropicApiKeyMaskiert}
            ctaStandardUrl={einstellungen.ctaStandardUrl}
            ctaStandardLabel={einstellungen.ctaStandardLabel}
            darfBearbeiten={darfBearbeiten}
          />
          <div className="card" style={{ padding: "20px 22px" }}>
            <h3
              style={{
                margin: "0 0 14px",
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Team und Rollen
            </h3>
            <div style={{ display: "grid" }}>
              {team.length === 0 ? (
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.84rem" }}>
                  Noch keine Benutzer vorhanden. Benutzer entstehen bei der ersten Anmeldung per Magic-Link.
                </p>
              ) : (
                team.map((mitglied) => (
                  <div
                    key={mitglied.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 0",
                      borderTop: "1px solid var(--border-soft)",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 600 }}>
                      {mitglied.name ?? mitglied.email}
                    </span>
                    <span
                      className={mitglied.rolle === "HERAUSGEBER" ? "status status-mandatory" : "status status-recommended"}
                      style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}
                    >
                      {ROLLEN_LABELS[mitglied.rolle]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card" style={{ padding: "20px 22px" }}>
            <h3
              style={{
                margin: "0 0 14px",
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Brand-Farben
            </h3>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { farbe: "#121e39", label: "#121E39" },
                { farbe: "#123fa6", label: "#123FA6" },
                { farbe: "#c99b32", label: "#C99B32" },
                { farbe: "#fbfcfe", label: "#FBFCFE" },
              ].map((eintrag) => (
                <div key={eintrag.label} style={{ display: "grid", gap: 4, justifyItems: "center" }}>
                  <span
                    style={{
                      width: 52,
                      height: 36,
                      borderRadius: 4,
                      background: eintrag.farbe,
                      border: "1px solid var(--border-medium)",
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.54rem", color: "var(--text-muted)" }}>
                    {eintrag.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
