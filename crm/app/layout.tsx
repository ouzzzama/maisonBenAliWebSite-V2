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
  /* Same favicon as maisonbenali.com (assets/images/favicon.png). */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon.png", type: "image/png", sizes: "256x256" },
    ],
    apple: [{ url: "/brand/favicon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${calSans.variable} ${awaking.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
