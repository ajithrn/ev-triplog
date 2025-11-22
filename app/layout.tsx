import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { TripProvider } from "@/contexts/TripContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RegisterServiceWorker from "./register-sw";
import InstallPrompt from "@/components/InstallPrompt";
import ClientRedirect from "./ClientRedirect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EV Trip Log",
  description: "Track your electric vehicle trips, charging sessions, and efficiency",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/ev-trip-log-app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EV Trip Log",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icon-512x512.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icon-512x512.png",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icon-512x512.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="evtriplog">
      <body className={inter.className}>
        <RegisterServiceWorker />
        <InstallPrompt />
        <ClientRedirect />
        <VehicleProvider>
          <TripProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="relative z-10 container mx-auto px-4 py-8 flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </TripProvider>
        </VehicleProvider>
      </body>
    </html>
  );
}
