"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Dezente 15px-Stroke-Icons für die Navigation (Scanbarkeit).
const ICON_PFADE: Record<string, React.ReactNode> = {
  start: (
    <path d="M2.5 7.5 8 2.5l5.5 5v5.5a1 1 0 0 1-1 1h-3v-4h-3v4h-3a1 1 0 0 1-1-1z" />
  ),
  pipeline: (
    <>
      <rect x="2" y="3" width="3.4" height="10" rx="0.8" />
      <rect x="6.3" y="3" width="3.4" height="7" rx="0.8" />
      <rect x="10.6" y="3" width="3.4" height="4.5" rx="0.8" />
    </>
  ),
  neu: (
    <>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 5.4v5.2M5.4 8h5.2" />
    </>
  ),
  linkedin: (
    <>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.6" />
      <path d="M5.4 7v4M5.4 5.1v.1M8 11V8.6c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V11" />
    </>
  ),
  einstellungen: (
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2.6v1.6M8 11.8v1.6M2.6 8h1.6M11.8 8h1.6M4.2 4.2l1.1 1.1M10.7 10.7l1.1 1.1M11.8 4.2l-1.1 1.1M5.3 10.7l-1.1 1.1" />
    </>
  ),
  freigabe: (
    <>
      <path d="M8 2.8l4.5 1.6v3.4c0 2.8-1.9 4.7-4.5 5.6-2.6-.9-4.5-2.8-4.5-5.6V4.4z" />
      <path d="M6 8l1.4 1.4L10.2 6.6" />
    </>
  ),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none", opacity: 0.85 }}
    >
      {ICON_PFADE[name]}
    </svg>
  );
}

const NAV_EINTRAEGE = [
  { href: "/start", label: "Start", icon: "start" },
  { href: "/pipeline", label: "Pipeline", icon: "pipeline" },
  { href: "/artikel/neu", label: "Neuer Artikel", icon: "neu" },
  { href: "/linkedin", label: "LinkedIn Studio", icon: "linkedin" },
  { href: "/einstellungen", label: "Einstellungen", icon: "einstellungen" },
];

const ROLLEN_LABELS: Record<string, string> = {
  HERAUSGEBER: "Herausgeber",
  REDAKTEUR: "Redakteur",
};

function navStil(aktiv: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "9px 12px",
    borderRadius: 4,
    fontSize: "0.86rem",
    fontWeight: aktiv ? 700 : 500,
    color: aktiv ? "#ffffff" : "rgb(255 255 255 / 0.75)",
    background: aktiv ? "rgb(36 104 232 / 0.30)" : "transparent",
    boxShadow: aktiv ? "inset 2px 0 0 var(--c-blue-600)" : "none",
    textDecoration: "none",
  };
}

export function Sidebar({
  benutzerName,
  benutzerRolle,
  abmelden,
}: {
  benutzerName: string;
  benutzerRolle: string;
  abmelden: () => Promise<void>;
}) {
  const pathname = usePathname();
  const initialen = benutzerName
    .split(/\s+/)
    .map((teil) => teil.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <aside
      style={{
        width: 238,
        flex: "none",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 100% 0%, rgb(36 104 232 / 0.22), transparent 42%), var(--gradient-brand-deep)",
        color: "rgb(255 255 255 / 0.75)",
      }}
    >
      <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid rgb(255 255 255 / 0.10)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logos/vtm-icon-color.png" alt="" width={28} height={28} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.86rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              lineHeight: 1.25,
            }}
          >
            VersicherungsTech Magazin
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "var(--c-brass-300)",
          }}
        >
          STUDIO · REDAKTIONSPLATTFORM
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "14px 12px 8px" }}>
        {NAV_EINTRAEGE.map((eintrag) => (
          <Link key={eintrag.href} href={eintrag.href} style={navStil(pathname.startsWith(eintrag.href))}>
            <NavIcon name={eintrag.icon} />
            {eintrag.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: "12px 12px 0", borderTop: "1px solid rgb(255 255 255 / 0.10)" }}>
        <div
          style={{
            padding: "0 12px 6px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "rgb(255 255 255 / 0.42)",
          }}
        >
          EXTERN
        </div>
        <Link href="/freigabe" style={navStil(pathname.startsWith("/freigabe"))}>
          <NavIcon name="freigabe" />
          Sponsored-Freigabe
        </Link>
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: "16px 18px",
          borderTop: "1px solid rgb(255 255 255 / 0.10)",
          display: "grid",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            letterSpacing: "0.12em",
            color: "rgb(255 255 255 / 0.42)",
          }}
        >
          ANGEMELDET ALS
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              flex: "none",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "var(--c-blue-700)",
              color: "#ffffff",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            {initialen || "VT"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#ffffff", fontSize: "0.82rem", fontWeight: 600 }}>{benutzerName}</div>
            <div
              style={{
                marginTop: 2,
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.06em",
                color: "rgb(255 255 255 / 0.75)",
              }}
            >
              {ROLLEN_LABELS[benutzerRolle] ?? benutzerRolle}
            </div>
          </div>
        </div>
        <form action={abmelden}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 4,
              border: "1px solid rgb(255 255 255 / 0.22)",
              background: "transparent",
              color: "rgb(255 255 255 / 0.75)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Abmelden
          </button>
        </form>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.56rem",
            letterSpacing: "0.1em",
            color: "rgb(255 255 255 / 0.32)",
          }}
        >
          VTM STUDIO 1.0 · M1
        </div>
      </div>
    </aside>
  );
}
