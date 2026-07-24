import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ladeEinstellungenFuerAnzeige } from "@/lib/einstellungen";
import { extrahiereRechte } from "@/lib/rollen";
import { Topbar } from "@/components/shell/Topbar";
import { GhostEinstellungenForm, RedaktionEinstellungenForm } from "./EinstellungenFormulare";
import { ProfilKarte } from "./ProfilKarte";
import { RollenVerwaltung } from "./RollenVerwaltung";
import { TeamVerwaltung } from "./TeamVerwaltung";

export const dynamic = "force-dynamic";

const AUDIT_LABELS: Record<string, string> = {
  BENUTZER_EINGELADEN: "Benutzer eingeladen",
  BENUTZER_AKTUALISIERT: "Benutzerzugang aktualisiert",
  BENUTZER_ROLLE_GEAENDERT: "Benutzerrolle geändert",
  BENUTZER_ENTFERNT: "Benutzerzugang entfernt",
  PROFIL_AKTUALISIERT: "Eigenes Profil aktualisiert",
  ROLLE_ERSTELLT: "Rolle angelegt",
  ROLLE_AKTUALISIERT: "Rolle geändert",
  ROLLE_GELOESCHT: "Rolle gelöscht",
  ARTIKEL_HOCHGELADEN: "Artikel hochgeladen",
  ARTIKEL_BEARBEITET: "Artikel bearbeitet",
  ARTIKEL_GELOESCHT: "Artikel gelöscht",
  ARTIKEL_AUFBEREITET: "Artikel aufbereitet (Review)",
  ARTIKEL_ABSCHNITT_BEARBEITET: "Abschnitt bearbeitet und neu geprüft",
  GHOST_DRAFT_ERSTELLT: "Ghost-Draft erstellt",
  LINKEDIN_POSTS_GENERIERT: "LinkedIn-Posts generiert",
  FREIGABELINK_ERSTELLT: "Freigabelink erstellt",
  FREIGABE_ERTEILT: "Kundenfreigabe erteilt",
  FREIGABE_AENDERUNG_ANGEFRAGT: "Änderung vom Kunden angefragt",
  EINSTELLUNGEN_GHOST_GESPEICHERT: "Ghost-Einstellungen gespeichert",
  EINSTELLUNGEN_GHOST_VERBINDUNGSTEST: "Ghost-Verbindungstest ausgeführt",
  EINSTELLUNGEN_REDAKTION_GESPEICHERT: "Redaktionseinstellungen gespeichert",
};

export default async function EinstellungenSeite() {
  const session = await auth();
  const rechte = extrahiereRechte(session?.user.rechte);
  const einstellungen = await ladeEinstellungenFuerAnzeige();
  const team = await prisma.user.findMany({ orderBy: { name: "asc" }, include: { rolle: true } });
  const rollen = await prisma.benutzerRolle.findMany({
    orderBy: [{ istSystem: "desc" }, { name: "asc" }],
    include: { _count: { select: { benutzer: true } } },
  });
  const auditEintraege = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 14,
    include: {
      user: { select: { name: true, email: true } },
      artikel: { select: { titel: true } },
    },
  });

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
          {session?.user ? (
            <ProfilKarte
              name={session.user.name ?? null}
              email={session.user.email ?? ""}
              rollenName={session.user.rolle}
            />
          ) : null}
          <GhostEinstellungenForm
            ghostUrl={einstellungen.ghostUrl}
            keyMaskiert={einstellungen.ghostAdminApiKeyMaskiert}
            letzterAbgleich={letzterAbgleich}
            darfBearbeiten={rechte.einstellungenVerwalten}
          />
          <RedaktionEinstellungenForm
            anthropicKeyMaskiert={einstellungen.anthropicApiKeyMaskiert}
            ctaStandardUrl={einstellungen.ctaStandardUrl}
            ctaStandardLabel={einstellungen.ctaStandardLabel}
            darfBearbeiten={rechte.einstellungenVerwalten}
          />
          <TeamVerwaltung
            team={team.map((mitglied) => ({
              id: mitglied.id,
              name: mitglied.name,
              email: mitglied.email,
              rolleId: mitglied.rolleId,
              rollenName: mitglied.rolle.name,
              teamVerwalten: mitglied.rolle.teamVerwalten,
            }))}
            rollen={rollen.map((rolle) => ({ id: rolle.id, name: rolle.name }))}
            eigeneId={session?.user.id ?? null}
            darfBearbeiten={rechte.teamVerwalten}
          />
          {rechte.teamVerwalten ? (
            <RollenVerwaltung
              rollen={rollen.map((rolle) => ({
                id: rolle.id,
                name: rolle.name,
                beschreibung: rolle.beschreibung,
                istSystem: rolle.istSystem,
                benutzerAnzahl: rolle._count.benutzer,
                rechte: extrahiereRechte(rolle),
              }))}
            />
          ) : null}
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
        <div className="card" style={{ padding: "20px 22px", maxWidth: 1160 }}>
          <h3
            style={{
              margin: "0 0 14px",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Audit-Log
          </h3>
          {auditEintraege.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.84rem" }}>
              Noch keine Einträge. Jede relevante Aktion (Upload, Prüfungen, Publishing, Freigaben,
              Einstellungsänderungen) wird hier protokolliert.
            </p>
          ) : (
            <div style={{ display: "grid" }}>
              {auditEintraege.map((eintrag) => (
                <div
                  key={eintrag.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "9px 0",
                    borderTop: "1px solid var(--border-soft)",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      color: "var(--c-blue-800)",
                    }}
                  >
                    {eintrag.createdAt.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <span style={{ flex: 1, minWidth: 220, fontSize: "0.84rem", color: "var(--text-primary)" }}>
                    {AUDIT_LABELS[eintrag.aktion] ?? eintrag.aktion}
                    {eintrag.artikel ? (
                      <span style={{ color: "var(--text-secondary)" }}> · {eintrag.artikel.titel}</span>
                    ) : null}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)" }}>
                    {eintrag.user?.name ?? eintrag.user?.email ?? "SYSTEM/KUNDE"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
