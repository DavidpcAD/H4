import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
// CSS global del design system (tokens + clases ds-*). Carga la fuente Roboto.
import "@/design-system/design-system.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "H4 — Asignación de horas",
  description: "Aplicación de asignación de horas en obra",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f3f3f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
