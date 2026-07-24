import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS_MELDUNGEN: Record<string, { text: string; art: "hinweis" | "fehler" }> = {
  "link-versendet": {
    text: "Der Anmeldelink wurde versendet. Bitte prüfen Sie Ihr E-Mail-Postfach (ohne SMTP-Konfiguration erscheint der Link in der Server-Konsole).",
    art: "hinweis",
  },
  fehler: {
    text: "Die Anmeldung ist fehlgeschlagen. Bitte fordern Sie einen neuen Anmeldelink an.",
    art: "fehler",
  },
};

export default async function LoginSeite({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/start");
  }
  const { status, error } = await searchParams;
  const meldung =
    error === "AccessDenied"
      ? {
          text: "Diese E-Mail-Adresse ist nicht freigeschaltet. Zugänge vergibt der Herausgeber unter Einstellungen → Team und Zugänge.",
          art: "fehler" as const,
        }
      : status
        ? STATUS_MELDUNGEN[status]
        : undefined;

  async function anmelden(formData: FormData) {
    "use server";
    await signIn("nodemailer", {
      email: String(formData.get("email") ?? ""),
      redirectTo: "/start",
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 100% 0%, rgb(36 104 232 / 0.22), transparent 42%), var(--gradient-brand-deep)",
      }}
    >
      <div className="card" style={{ width: "min(430px, 100%)", padding: "34px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Image src="/logos/vtm-icon-color.png" alt="" width={28} height={28} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--c-cobalt-950)",
            }}
          >
            VersicherungsTech <span style={{ color: "var(--c-blue-700)" }}>Magazin</span>
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "var(--c-brass-700)",
            marginBottom: 22,
          }}
        >
          STUDIO · REDAKTIONSPLATTFORM
        </div>
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-display)",
            fontSize: "1.35rem",
            fontWeight: 800,
            letterSpacing: "-0.035em",
          }}
        >
          Anmeldung
        </h1>
        <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          Geben Sie Ihre redaktionelle E-Mail-Adresse ein. Sie erhalten einen Anmeldelink, der 24 Stunden gültig
          ist.
        </p>
        {meldung ? (
          <p
            role="status"
            style={{
              margin: "0 0 16px",
              padding: "10px 12px",
              borderRadius: 4,
              fontSize: "0.84rem",
              lineHeight: 1.55,
              color: meldung.art === "fehler" ? "var(--c-danger)" : "var(--c-success)",
              background: meldung.art === "fehler" ? "var(--c-danger-bg)" : "var(--c-success-bg)",
              border: `1px solid ${meldung.art === "fehler" ? "rgb(165 38 38 / 0.24)" : "rgb(23 102 58 / 0.24)"}`,
            }}
          >
            {meldung.text}
          </p>
        ) : null}
        <form action={anmelden} style={{ display: "grid", gap: 14 }}>
          <div className="form-field">
            <label htmlFor="email">E-Mail-Adresse</label>
            <input id="email" name="email" type="email" required placeholder="redaktion@beispiel.de" />
          </div>
          <button type="submit" className="button button-primary">
            Anmeldelink anfordern
          </button>
        </form>
      </div>
    </main>
  );
}
