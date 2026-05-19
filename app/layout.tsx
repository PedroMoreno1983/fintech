import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fintech CFO - Plataforma financiera",
  description:
    "Cierre, consolidacion, control de gestion y reporting financiero en una sola plataforma.",
  applicationName: "Fintech CFO",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-900 font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
