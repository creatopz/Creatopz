import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const grotesk = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://faultline.app"),
  title: {
    default: "FAULT//LINE — You don't have to look perfect here.",
    template: "%s — FAULT//LINE",
  },
  description:
    "Fault Line is an anonymous social space for the parts of you that don't fit the feed. No real name required. No perfect photo required. Just be human.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "FAULT//LINE",
    description: "Every human has a fault line. Here, it's what makes you real.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F1EA",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable} ${pixel.variable}`}>
      <body className="font-grotesk">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
