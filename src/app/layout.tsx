import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const display = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-display" });
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TRAC BYPASS — Beyond the Ordinary.",
  description: "A sleek, dark, next-generation URL processing experience.",
};

export const viewport: Viewport = { themeColor: "#09090B", colorScheme: "dark", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-void font-sans text-bone antialiased">
        <a
          href="#bypass"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-ember focus:px-3 focus:py-2 focus:text-void"
        >
          Skip to the link processor
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
