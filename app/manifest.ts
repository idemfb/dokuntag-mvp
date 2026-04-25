import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dokuntag",
    short_name: "Dokuntag",
    description: "NFC / QR tabanlı güvenli kayıp buluşturma sistemi.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    orientation: "portrait",
    categories: ["utilities", "lifestyle"],
    icons: [
      {
        src: "/icons/dokuntag-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}