import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FolderOpen, Images } from "lucide-react";

import { getGalleryCollections } from "@/lib/gallery";

export const metadata = {
  title: "Galería de destinos",
  description:
    "Explora por destino las fotografías, paisajes y aventuras vividas junto a Ruticas RD.",
  alternates: { canonical: "/galeria" },
};

export default async function GalleryPage() {
  const collections = await getGalleryCollections();

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 pb-20 nav-offset text-[#14231c] sm:px-6 sm:pb-24 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0f5132]">
            Galería Ruticas RD
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Explora nuestros recuerdos por destino
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#486056]">
            Abre una colección para conocer los paisajes, recorridos y momentos
            compartidos en cada lugar visitado.
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-dashed border-[#bdcec4] bg-white px-6 py-16 text-center">
            <Images className="mx-auto text-[#668077]" size={34} />
            <h2 className="mt-4 text-2xl font-black">Próximamente</h2>
            <p className="mt-2 text-[#667a70]">
              Estamos preparando nuevas colecciones de aventuras.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => {
              const cover =
                collection.images.find((image) => image.featured) ??
                collection.images[0];

              return (
                <Link
                  key={collection.id}
                  href={`/galeria/${collection.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-[#dce6e0] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#dce5df]">
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#e6eee9] text-[#789086]">
                        <FolderOpen size={46} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-lime-300">
                          <FolderOpen size={17} /> Colección
                        </div>
                        <h2 className="mt-2 text-2xl font-black">
                          {collection.name}
                        </h2>
                      </div>
                      <ArrowRight
                        className="shrink-0 transition group-hover:translate-x-1"
                        size={22}
                      />
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="line-clamp-2 min-h-12 text-sm leading-6 text-[#60736a]">
                      {collection.description ||
                        `Descubre las experiencias vividas por Ruticas RD en ${collection.name}.`}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#0f5132]">
                      <Images size={16} /> {collection.images.length}{" "}
                      {collection.images.length === 1
                        ? "fotografía"
                        : "fotografías"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
