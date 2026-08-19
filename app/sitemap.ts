import type { MetadataRoute } from "next";

import { getGalleryCollections } from "@/lib/gallery";
import { getPublicTours } from "@/lib/tours/public";

const baseUrl = "https://www.ruticasrd.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, galleryCollections] = await Promise.all([
    getPublicTours(),
    getGalleryCollections(),
  ]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tours`, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/nosotros`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/galeria`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${baseUrl}/contacto`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${baseUrl}/politicas`, changeFrequency: "yearly", priority: 0.4 },
  ];

  return [
    ...staticPages,
    ...tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: new Date(tour.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.9,
      images: [absoluteUrl(tour.coverImage)],
    })),
    ...galleryCollections.map((collection) => ({
      url: `${baseUrl}/galeria/${collection.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: collection.images
        .slice(0, 1)
        .map((image) => absoluteUrl(image.src)),
    })),
  ];
}

function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}
