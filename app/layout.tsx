import type { Metadata } from "next";
import { JetBrains_Mono, Nunito_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Knurdz Marketplace",
  description:
    "Multi-role marketplace for buyers, sellers, and admins. Built by Knurdz.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark",
        spaceGrotesk.variable,
        nunitoSans.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
