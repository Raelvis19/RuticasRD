import "server-only";

import { cache } from "react";

import { galleryImages as fallbackImages } from "@/data/gallery";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminGalleryCollection,
  AdminGalleryImage,
  GalleryCollection,
  GalleryImage,
} from "@/types/media";

export const GALLERY_IMAGE_BUCKET = "gallery-images";
export const GALLERY_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const GALLERY_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export const GALLERY_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

interface GalleryImageRow {
  id: string;
  collection_id: string;
  source_url: string;
  storage_path: string | null;
  alt_text: string;
  location: string | null;
  category: GalleryImage["category"];
  orientation: GalleryImage["orientation"];
  featured: boolean;
  position: number;
}

interface GalleryCollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  gallery_images?: GalleryImageRow[] | null;
}

export const getGalleryCollections = cache(
  async (): Promise<GalleryCollection[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery_collections")
      .select(
        "id, name, slug, description, position, published, created_at, updated_at, gallery_images(id, collection_id, source_url, storage_path, alt_text, location, category, orientation, featured, position)",
      )
      .eq("published", true)
      .order("position")
      .order("created_at");

    if (error) return createFallbackCollections();

    return ((data ?? []) as GalleryCollectionRow[]).map(mapPublicCollection);
  },
);

export const getGalleryCollectionBySlug = cache(
  async (slug: string): Promise<GalleryCollection | null> => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery_collections")
      .select(
        "id, name, slug, description, position, published, created_at, updated_at, gallery_images(id, collection_id, source_url, storage_path, alt_text, location, category, orientation, featured, position)",
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      return (
        createFallbackCollections().find(
          (collection) => collection.slug === slug,
        ) ?? null
      );
    }
    if (!data) return null;

    return mapPublicCollection(data as GalleryCollectionRow);
  },
);

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const collections = await getGalleryCollections();
  return collections.flatMap((collection) => collection.images);
}

export async function getAdminGalleryData(): Promise<{
  collections: AdminGalleryCollection[];
  images: AdminGalleryImage[];
  error: boolean;
}> {
  await requireAdmin();
  const supabase = await createClient();
  const [collectionResult, imageResult] = await Promise.all([
    supabase
      .from("gallery_collections")
      .select(
        "id, name, slug, description, position, published, created_at, updated_at",
      )
      .order("position")
      .order("created_at"),
    supabase
      .from("gallery_images")
      .select(
        "id, collection_id, source_url, storage_path, alt_text, location, category, orientation, featured, position",
      )
      .order("position")
      .order("created_at"),
  ]);

  if (collectionResult.error || imageResult.error) {
    return { collections: [], images: [], error: true };
  }

  const collectionRows = (collectionResult.data ?? []) as GalleryCollectionRow[];
  const imageRows = (imageResult.data ?? []) as GalleryImageRow[];
  const collectionById = new Map(collectionRows.map((row) => [row.id, row]));
  const images = imageRows.flatMap((row): AdminGalleryImage[] => {
    const collection = collectionById.get(row.collection_id);
    if (!collection) return [];

    return [mapAdminImage(row, collection)];
  });

  return {
    error: false,
    images,
    collections: collectionRows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? undefined,
      position: row.position,
      published: row.published,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      images: images.filter((image) => image.collectionId === row.id),
    })),
  };
}

function mapPublicCollection(row: GalleryCollectionRow): GalleryCollection {
  const images = [...(row.gallery_images ?? [])]
    .sort((first, second) => first.position - second.position)
    .map((image) => mapPublicImage(image, row));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    position: row.position,
    published: row.published,
    images,
  };
}

function mapPublicImage(
  row: GalleryImageRow,
  collection: Pick<GalleryCollectionRow, "id" | "name" | "slug">,
): GalleryImage {
  return {
    id: row.id,
    src: row.source_url,
    alt: row.alt_text,
    collectionId: collection.id,
    collectionSlug: collection.slug,
    location: collection.name,
    category: row.category,
    orientation: row.orientation,
    featured: row.featured,
  };
}

function mapAdminImage(
  row: GalleryImageRow,
  collection: Pick<GalleryCollectionRow, "id" | "name" | "slug">,
): AdminGalleryImage {
  return {
    ...mapPublicImage(row, collection),
    collectionId: row.collection_id,
    storagePath: row.storage_path,
    position: row.position,
  };
}

function createFallbackCollections(): GalleryCollection[] {
  const grouped = new Map<string, GalleryImage[]>();

  fallbackImages.forEach((image) => {
    const name = image.location?.trim() || "Otros destinos";
    const current = grouped.get(name) ?? [];
    current.push(image);
    grouped.set(name, current);
  });

  return [...grouped.entries()].map(([name, images], index) => {
    const slug = slugify(name) || `destino-${index + 1}`;
    const id = `fallback-${slug}`;

    return {
      id,
      name,
      slug,
      position: index,
      published: true,
      images: images.map((image) => ({
        ...image,
        collectionId: id,
        collectionSlug: slug,
        location: name,
      })),
    };
  });
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
