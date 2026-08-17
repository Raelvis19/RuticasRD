import "server-only";

import { galleryImages as fallbackImages } from "@/data/gallery";
import { createClient } from "@/lib/supabase/server";
import type { AdminGalleryImage, GalleryImage } from "@/types/media";

export const GALLERY_IMAGE_BUCKET = "gallery-images";
export const GALLERY_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const GALLERY_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export const GALLERY_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

interface GalleryRow {
  id: string;
  source_url: string;
  storage_path: string | null;
  alt_text: string;
  location: string | null;
  category: GalleryImage["category"];
  orientation: GalleryImage["orientation"];
  featured: boolean;
  position: number;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const result = await getGalleryRows();
  return result.error ? fallbackImages : result.images;
}

export async function getAdminGalleryImages() {
  return getGalleryRows();
}

async function getGalleryRows(): Promise<{
  images: AdminGalleryImage[];
  error: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, source_url, storage_path, alt_text, location, category, orientation, featured, position",
    )
    .order("position")
    .order("created_at");

  if (error) return { images: [], error: true };

  return {
    error: false,
    images: ((data ?? []) as GalleryRow[]).map((row) => ({
      id: row.id,
      src: row.source_url,
      storagePath: row.storage_path,
      alt: row.alt_text,
      location: row.location ?? undefined,
      category: row.category,
      orientation: row.orientation,
      featured: row.featured,
      position: row.position,
    })),
  };
}
