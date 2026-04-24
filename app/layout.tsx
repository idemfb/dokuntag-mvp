import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin-ext"], // ✅ KRİTİK DÜZELTME
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin-ext"], // ✅ KRİTİK DÜZELTME
});

export const metadata: Metadata = {
  title: "Dokuntag",
  description: "Dokun, Bul, Buluştur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr" // ✅ TÜRKÇE
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f5ef] text-[#171717]">
        {children}
      </body>
    </html>
  );
}