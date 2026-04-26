import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/satis",
          "/hikayeler",
          "/hakkimizda",
          "/scan",
          "/p/DKNTG",
          "/gizlilik",
          "/kullanim-kosullari",
          "/mesafeli-satis",
        ],
        disallow: [
          "/admin",
          "/manage",
          "/setup",
          "/api",
          "/my",
          "/recover",
          "/transfer",
        ],
      },
    ],
    sitemap: "https://dokuntag.com/sitemap.xml",
    host: "https://dokuntag.com",
  };
}