import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ArtworkProvider } from "@/providers/artwork-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PwaProvider } from "@/providers/pwa-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Pokédex Ultra";
const APP_DESCRIPTION =
  "A modern Pokédex powered by PokéAPI — explore Pokémon, stats, evolutions, and more.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#161616",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overscroll-none antialiased dark`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans overscroll-none">
        <PwaProvider>
          <ThemeProvider>
            <ArtworkProvider>
              <QueryProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </QueryProvider>
            </ArtworkProvider>
          </ThemeProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
