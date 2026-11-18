import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationTracker } from "@/components/layout/navigation-tracker";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { MotionProvider } from "@/providers/motion-provider";
import { PwaProvider } from "@/providers/pwa-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { THEME_COLORS } from "@/lib/theme";
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
  "A fast, offline-ready Pokédex — stats, moves by game, evolutions and type matchups for every Pokémon.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
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
      className={`${geistSans.variable} ${geistMono.variable} dark bg-background antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-mesh min-h-dvh font-sans">
        <PwaProvider>
          <ThemeProvider>
            <QueryProvider>
              <MotionProvider>
                <TooltipProvider delay={250}>
                  {children}
                  <OfflineBanner />
                  <NavigationTracker />
                </TooltipProvider>
              </MotionProvider>
            </QueryProvider>
          </ThemeProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
