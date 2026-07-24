import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "mammoth", "pdf-parse"],
  experimental: {
    serverActions: {
      // Manuskript-Upload (DOCX/PDF) läuft über eine Server-Action
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
