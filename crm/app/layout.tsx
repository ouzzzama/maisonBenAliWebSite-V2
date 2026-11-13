import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/** Brand typography — the same files served by maisonbenali.com. */
const calSans = localFont({
  src: [{ path: "../public/fonts/CalSans-SemiBold.ttf", weight: "400 700", style: "normal" }],
  variable: "--font-cal-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const awaking = localFont({
  src: [
    { path: "../public/fonts/awaking-light.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/awaking-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-awaking",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "Maison Ben Ali — CRM",
  description: "CRM interne : leads, clients, réservations, Benali Cars, projets et finances.",
  icons: {
    icon: [{ url: "/brand/logo-icon.png", type: "image/png" }],
    apple: [{ url: "/brand/logo-icon.png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${calSans.variable} ${awaking.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
