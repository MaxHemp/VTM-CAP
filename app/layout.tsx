import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTM Studio",
  description: "Interne Redaktionsplattform des VersicherungsTech Magazins",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
