import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { TripProvider } from "@/contexts/TripContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RegisterServiceWorker from "./register-sw";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EV Trip Log",
  description: "Track your electric vehicle trips, charging sessions, and efficiency",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EV Trip Log",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
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
