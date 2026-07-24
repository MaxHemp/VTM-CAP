// Zentraler E-Mail-Versand (SMTP aus .env); ohne SMTP_HOST wird die
// Nachricht in der Server-Konsole ausgegeben (Entwicklung/CI).
import { createTransport } from "nodemailer";

export async function sendeMail(nachricht: { an: string; betreff: string; text: string }): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log(
      `[VTM Studio] E-Mail (Konsolen-Modus, kein SMTP_HOST) an ${nachricht.an}\nBetreff: ${nachricht.betreff}\n\n${nachricht.text}`
    );
    return;
  }
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  });
  await transport.sendMail({
    to: nachricht.an,
    from: process.env.SMTP_FROM ?? "VTM Studio <studio@example.com>",
    subject: nachricht.betreff,
    text: nachricht.text,
  });
}
