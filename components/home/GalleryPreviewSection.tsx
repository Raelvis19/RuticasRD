import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images, MapPin } from "lucide-react";

import { galleryImages } from "@/data/gallery";

const galleryLayout = [
  "col-span-2 md:col-span-7 md:row-span-2",
  "col-span-1 md:col-span-5",
  "col-span-1 md:col-span-5",
  "col-span-2 md:col-span-4",
  "col-span-1 md:col-span-4",
  "col-span-1 md:col-span-4",
];

const categoryLabels = {
  naturaleza: "Naturaleza",
  grupo: "Comunidad",
  aventura: "Aventura",
  destino: "Destino",
  organizacion: "Organización",
};

export default function GalleryPreviewSection() {
  const previewImages = galleryImages.slice(0, 6);

  if (previewImages.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f4f7f5] px-5 py-20 text-[#14231c] sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#0f5132]">
              <Images size={19} aria-hidden="true" />
              Experiencias reales
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Aventuras que se convierten en recuerdos
            </h2>

            <p className="mt-5 text-base leading-8 text-[#486056] sm:text-lg">
              Conoce algunos de los paisajes, recorridos y momentos compartidos
              durante las experiencias organizadas por Ruticas RD.
            </p>
          </div>

          <Link
            href="/galeria"
            className="inline-flex w-fit items-center gap-2 font-extrabold text-[#0f5132] transition hover:gap-3"
          >
            Explorar la galería
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-5 lg:auto-rows-[240px]">
          {previewImages.map((image, index) => (
            <article
              key={image.id}
              className={`group relative overflow-hidden rounded-2xl bg-[#dce5df] sm:rounded-3xl ${
                galleryLayout[index] ?? "col-span-1 md:col-span-4"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 767px) 100vw, 60vw"
                    : "(max-width: 767px) 50vw, 33vw"
                }
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md sm:text-xs">
                  {categoryLabels[image.category]}
                </span>

                {image.location && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-bold text-white sm:text-base">
                    <MapPin
                      size={17}
                      className="shrink-0 text-lime-300"
                      aria-hidden="true"
                    />
                    {image.location}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/galeria"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f5132] px-7 py-3.5 font-extrabold text-white"
          >
            Ver todas las experiencias
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}