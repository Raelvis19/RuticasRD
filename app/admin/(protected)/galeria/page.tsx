import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ExternalLink, Images } from "lucide-react";

import GalleryImageManager from "@/components/admin/GalleryImageManager";
import { getAdminGalleryData } from "@/lib/gallery";

export const metadata: Metadata = { title: "Administrar galería" };

export default async function AdminGalleryPage() {
  const { collections, images, error } = await getAdminGalleryData();

  return (
    <div className="pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">Contenido visual</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Galería por destinos</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">Organiza las fotografías en carpetas como Constanza o Río Partido y decide cuáles aparecen públicamente.</p>
        </div>
        <Link href="/galeria" target="_blank" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#cad9d0] px-4 text-sm font-black text-[#0f5132]"><ExternalLink size={17} /> Ver galería pública</Link>
      </div>

      {error ? (
        <div role="alert" className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div><p className="font-black">Falta activar las carpetas de galería en Supabase.</p><p>Ejecuta la migración <code>202608170001_gallery_collections.sql</code> y vuelve a cargar esta página.</p></div>
        </div>
      ) : (
        <div className="mt-7"><GalleryImageManager initialCollections={collections} initialImages={images} /></div>
      )}

      {!error && <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#71847a]"><Images size={17} /> {collections.length} {collections.length === 1 ? "carpeta" : "carpetas"} · {images.length} {images.length === 1 ? "imagen" : "imágenes"}</p>}
    </div>
  );
}
