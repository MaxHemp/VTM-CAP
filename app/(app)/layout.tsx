import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Sidebar } from "@/components/shell/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  async function abmelden() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--surface-soft)" }}>
      <Sidebar
        benutzerName={session.user.name ?? session.user.email ?? "Unbekannt"}
        benutzerRolle={session.user.rolle}
        abmelden={abmelden}
      />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
