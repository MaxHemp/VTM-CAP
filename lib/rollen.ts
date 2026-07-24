// Rechte-Modell für datenbankbasierte Rollen (Einstellungen → Rollen).
// Grundfunktionen (Manuskript hochladen, Review bearbeiten, LinkedIn Studio)
// stehen jeder angemeldeten Person offen; die Rechte hier steuern die
// verwaltenden Aktionen.
export const RECHTE = [
  {
    schluessel: "artikelVerwalten",
    label: "Artikel verwalten",
    beschreibung: "Artikel bearbeiten, Status setzen und endgültig löschen",
  },
  {
    schluessel: "publizieren",
    label: "Publizieren",
    beschreibung: "Ghost-Drafts erstellen (inkl. Feature-Image-Upload)",
  },
  {
    schluessel: "freigabenVerwalten",
    label: "Freigaben verwalten",
    beschreibung: "Kundenfreigabe-Links erstellen und versenden",
  },
  {
    schluessel: "teamVerwalten",
    label: "Team verwalten",
    beschreibung: "Benutzer einladen, Profile und Rollen zuweisen, Rollen definieren",
  },
  {
    schluessel: "einstellungenVerwalten",
    label: "Einstellungen verwalten",
    beschreibung: "Ghost-/Anthropic-Zugänge und Redaktionsstandards pflegen",
  },
] as const;

export type RechteSchluessel = (typeof RECHTE)[number]["schluessel"];

export type RechteSatz = Record<RechteSchluessel, boolean>;

export const KEINE_RECHTE: RechteSatz = {
  artikelVerwalten: false,
  publizieren: false,
  freigabenVerwalten: false,
  teamVerwalten: false,
  einstellungenVerwalten: false,
};

// Feste IDs der per Migration angelegten Systemrollen
export const SYSTEM_ROLLE_HERAUSGEBER = "rolle-herausgeber";
export const SYSTEM_ROLLE_REDAKTEUR = "rolle-redakteur";

export function extrahiereRechte(rolle: Partial<RechteSatz> | null | undefined): RechteSatz {
  return {
    artikelVerwalten: Boolean(rolle?.artikelVerwalten),
    publizieren: Boolean(rolle?.publizieren),
    freigabenVerwalten: Boolean(rolle?.freigabenVerwalten),
    teamVerwalten: Boolean(rolle?.teamVerwalten),
    einstellungenVerwalten: Boolean(rolle?.einstellungenVerwalten),
  };
}
