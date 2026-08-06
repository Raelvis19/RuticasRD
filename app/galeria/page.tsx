import Image from "next/image";

import { galleryImages } from "@/data/gallery";

export const metadata = {
  title: "Galería",
  description:
    "Conoce las experiencias, destinos y aventuras vividas junto a Ruticas RD.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f5] px-5 pb-24 pt-32 text-[#14231c] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0f5132]">
            Galería Ruticas RD
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Historias contadas a través de cada aventura
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#486056]">
            Explora algunos de los paisajes, recorridos y momentos compartidos
            por nuestra comunidad.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image) => (
            <article
              key={image.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#dce5df]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {image.location && (
                <p className="absolute bottom-5 left-5 font-bold text-white">
                  {image.location}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}