import type { TourStatus } from "@/types/tour";

export const TOUR_IMAGE_BUCKET = "tour-images";
export const TOUR_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const TOUR_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export const TOUR_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export interface AdminTourImage {
  id: string;
  storagePath: string;
  altText: string;
  position: number;
  isCover: boolean;
  publicUrl: string;
}

export interface AdminTourMedia {
  id: string;
  title: string;
  slug: string;
  status: TourStatus;
  images: AdminTourImage[];
}
