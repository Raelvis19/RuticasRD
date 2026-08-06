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
  category: MediaCategory;
  location?: string;
  orientation: MediaOrientation;
  featured?: boolean;
}