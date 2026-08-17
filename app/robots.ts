import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/reservar/", "/reserva/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/reservar/", "/reserva/", "/api/"],
      },
    ],
    sitemap: "https://ruticasrd.com/sitemap.xml",
    host: "https://ruticasrd.com",
  };
}
