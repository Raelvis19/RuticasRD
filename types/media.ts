export type MediaOrientation =
  | "horizontal"
  | "vertical"
  | "cuadrada";

export type MediaCategory =
  | "naturaleza"
  | "grupo"
  | "aventura"
  | "destino"
  | "organizacion";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  collectionId?: string;
  collectionSlug?: string;
  category: MediaCategory;
  location?: string;
  orientation: MediaOrientation;
  featured?: boolean;
}

export interface AdminGalleryImage extends GalleryImage {
  collectionId: string;
  storagePath: string | null;
  position: number;
}

export interface GalleryCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
  published: boolean;
  images: GalleryImage[];
}

export interface AdminGalleryCollection extends GalleryCollection {
  createdAt: string;
  updatedAt: string;
}
