import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-sans-next",
  subsets: ["latin"],
  // Next has no fallback metrics for this family; skip the adjusted fallback instead of warning.
  adjustFontFallback: false,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display-next",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#EDF1E8",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "Foodyz",
    template: "%s | Foodyz",
  },
  description: "Your recipes and flan map.",
  appleWebApp: {
    capable: true,
    title: "Foodyz",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${atkinson.variable} ${bricolage.variable} bg-background text-foreground font-sans antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          offset={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
          mobileOffset={{ top: "calc(env(safe-area-inset-top) + 12px)", left: 16, right: 16 }}
        />
      </body>
    </html>
  );
}
