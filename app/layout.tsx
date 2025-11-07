import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { TripProvider } from "@/contexts/TripContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EV Trip Log",
  description: "Track your electric vehicle trips, charging sessions, and efficiency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="evtriplog">
      <body className={inter.className}>
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
