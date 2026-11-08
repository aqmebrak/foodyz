import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from "next/font/google";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-sans-next",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display-next",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2F6B47",
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
      </body>
    </html>
  );
}
