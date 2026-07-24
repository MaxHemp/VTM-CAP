"use server";

import { revalidatePath } from "next/cache";
import { entscheideFreigabe } from "@/lib/freigabe";

export interface FreigabeErgebnis {
  ok: boolean;
  meldung: string;
}

// Kundenentscheidung ohne Account – der Token ist die Autorisierung.
export async function freigabeEntscheidungAction(
  tokenWert: string,
  formData: FormData
): Promise<FreigabeErgebnis> {
  const entscheidung = String(formData.get("entscheidung") ?? "");
  const kommentar = String(formData.get("kommentar") ?? "").trim();
  if (entscheidung !== "FREIGEGEBEN" && entscheidung !== "AENDERUNG_ANGEFRAGT") {
    return { ok: false, meldung: "Ungültige Entscheidung." };
  }
  if (entscheidung === "AENDERUNG_ANGEFRAGT" && !kommentar) {
    return {
      ok: false,
      meldung: "Bitte beschreiben Sie die gewünschte Änderung im Kommentarfeld, damit die Redaktion sie umsetzen kann.",
    };
  }
  const ergebnis = await entscheideFreigabe(tokenWert, entscheidung, kommentar);
  revalidatePath(`/freigabe/${tokenWert}`);
  return ergebnis;
}
