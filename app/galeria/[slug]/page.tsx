import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Images, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { getGalleryCollectionBySlug } from "@/lib/gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getGalleryCollectionBySlug(slug);
  if (!collection) return { title: "Colección no encontrada" };

  const description =
    collection.description ||
    `Fotografías y experiencias de Ruticas RD en ${collection.name}.`;

  return {
    title: collection.name,
    description,
    alternates: { canonical: `/galeria/${collection.slug}` },
    openGraph: {
      title: `${collection.name} | Galería Ruticas RD`,
      description,
      images: collection.images[0]
        ? [{ url: collection.images[0].src, alt: collection.images[0].alt }]
        : undefined,
    },
  };
}

export default async function GalleryCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getGalleryCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 pb-20 nav-offset text-[#14231c] sm:px-6 sm:pb-24 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link
          href="/galeria"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#0f5132]"
        >
          <ArrowLeft size={18} /> Volver a todas las colecciones
        </Link>

        <div className="mt-7 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#0f5132]">
            <MapPin size={18} /> Destino visitado
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {collection.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#486056]">
            {collection.description ||
              `Revive junto a nosotros los paisajes y momentos compartidos en ${collection.name}.`}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e5efe9] px-4 py-2 text-sm font-black text-[#0f5132]">
            <Images size={17} /> {collection.images.length}{" "}
            {collection.images.length === 1 ? "fotografía" : "fotografías"}
          </p>
        </div>

        {collection.images.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-[#bdcec4] bg-white px-6 py-16 text-center text-[#667a70]">
            Esta colección todavía no tiene fotografías publicadas.
          </div>
        ) : (
          <div className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {collection.images.map((image) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
                <p className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-sm font-bold leading-6 text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  {image.alt}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
