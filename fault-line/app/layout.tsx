import type { Metadata, Viewport } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/components/providers/SoundProvider";
import PixelCursor from "@/components/PixelCursor";
import SoundToggle from "@/components/SoundToggle";
import FaultScrollIndicator from "@/components/FaultScrollIndicator";
import IdleWalker from "@/components/IdleWalker";

const grotesk = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-grotesk",
  display: "swap",
});

const pixelMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixel-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FAULT LINE — You don't have to look okay here.",
  description:
    "A place for the parts of people they usually hide. Anonymous confessions, real humans, no perfect photos required.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "FAULT LINE",
    description: "You don't have to look okay here.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F1EFE8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${grotesk.variable} ${pixelMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SoundProvider>
          <PixelCursor />
          <FaultScrollIndicator />
          <SoundToggle />
          <IdleWalker />
          <main id="main">{children}</main>
        </SoundProvider>
      </body>
    </html>
  );
}
