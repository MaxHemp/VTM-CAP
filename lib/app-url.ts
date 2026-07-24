// Öffentliche Basis-URL der App: explizit gesetzte APP_URL, sonst die von
// Vercel bereitgestellte Produktions-Domain (Systemvariable ohne Protokoll),
// sonst localhost (Entwicklung).
export function baueAppUrl(): string {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null;
  return (process.env.APP_URL ?? vercelUrl ?? "http://localhost:3000").replace(/\/+$/, "");
}
