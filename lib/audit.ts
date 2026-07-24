import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function schreibeAuditLog(eintrag: {
  userId?: string;
  artikelId?: string;
  aktion: string;
  details?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      userId: eintrag.userId,
      artikelId: eintrag.artikelId,
      aktion: eintrag.aktion,
      details: eintrag.details,
    },
  });
}
