import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AddToHomePrompt from "./components/AddToHomePrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Dokuntag",
  description: "Dokun, Bul, Buluştur",
  applicationName: "Dokuntag",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Dokuntag",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/dokuntag-icon.svg",
    apple: "/icons/dokuntag-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f5ef] text-[#171717]">
        {children}
        <AddToHomePrompt />
      </body>
    </html>
  );
}