import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gaboose Hotel and Restaurant | Your Comfortable Stay in Kabridahar",
  description:
    "Welcome to Gaboose Hotel and Restaurant in Kabridahar, Somali Region, Ethiopia. Enjoy comfortable rooms, fresh breakfast, and warm African hospitality. Book your stay today.",
  keywords: [
    "Gaboose Hotel",
    "Kabridahar",
    "Kebri Dehar",
    "Ethiopia",
    "Somali Region",
    "hotel",
    "restaurant",
    "accommodation",
    "breakfast",
  ],
  authors: [{ name: "Gaboose Hotel" }],
  openGraph: {
    title: "Gaboose Hotel and Restaurant",
    description:
      "Your comfortable stay in Kabridahar, Somali Region, Ethiopia. 15 cozy rooms, fresh breakfast, and warm African hospitality.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="theme-dark-gold">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interFont.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster position="top-center" richColors />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
