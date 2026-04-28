import type { Metadata, Viewport } from "next";
import AddToHomePrompt from "./components/AddToHomePrompt";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dokuntag.com"),
  title: {
    default: "Dokuntag® | NFC ve QR ile kaybolanı sahibine ulaştırın",
    template: "%s | Dokuntag®",
  },
  description:
    "Dokuntag®, NFC ve QR ile çalışan güvenli kayıp buluşturma sistemidir. Anahtar, evcil hayvan, birey ve eşyalar için güvenli iletişim köprüsü kurar.",
  applicationName: "Dokuntag",
  manifest: "/manifest.webmanifest",
  keywords: [
    "Dokuntag",
    "NFC anahtarlık",
    "QR kayıp eşya",
    "kayıp anahtar bulma",
    "akıllı anahtarlık",
    "evcil hayvan etiketi",
    "kayıp eşya etiketi",
    "NFC etiket",
  ],
  authors: [{ name: "Dokuntag" }],
  creator: "Dokuntag",
  publisher: "Dokuntag",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://dokuntag.com",
    siteName: "Dokuntag®",
    title: "Dokuntag® | Dokun, Bul, Buluştur",
    description:
      "NFC ve QR ile kaybolanı sahibine ulaştıran güvenli iletişim sistemi.",
    images: [
      {
        url: "/images/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag NFC ve QR kayıp buluşturma sistemi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dokuntag® | Dokun, Bul, Buluştur",
    description:
      "NFC ve QR ile kaybolanı sahibine ulaştıran güvenli iletişim sistemi.",
    images: ["/images/hero-main.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "Dokuntag",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/dokuntag-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
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
className="antialiased"    >
      <body className="min-h-full flex flex-col bg-[#f7f5ef] text-[#171717]">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <AddToHomePrompt />
      </body>
    </html>
  );
}