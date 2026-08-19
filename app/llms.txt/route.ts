import { getGalleryCollections } from "@/lib/gallery";
import { getPublicTours } from "@/lib/tours/public";

export const revalidate = 3600;

export async function GET() {
  const [tours, galleryCollections] = await Promise.all([
    getPublicTours(),
    getGalleryCollections(),
  ]);
  const tourLinks = tours.length
    ? tours
        .map(
          (tour) =>
            `- [${tour.title}](https://www.ruticasrd.com/tours/${tour.slug}): ${tour.shortDescription} Ubicación: ${tour.location}, ${tour.province}.`,
        )
        .join("\n")
    : "- [Próximas excursiones](https://www.ruticasrd.com/tours): Consulta fechas, destinos y disponibilidad actualizada.";
  const galleryLinks = galleryCollections.length
    ? galleryCollections
        .map(
          (collection) =>
            `- [${collection.name}](https://www.ruticasrd.com/galeria/${collection.slug}): colección con ${collection.images.length} fotografías de este destino.`,
        )
        .join("\n")
    : "- [Galería de destinos](https://www.ruticasrd.com/galeria): fotografías de excursiones y experiencias de Ruticas RD.";

  const content = `# Ruticas RD

> Ruticas RD organiza excursiones, senderismo, visitas a cascadas, montañas, playas y experiencias de naturaleza en República Dominicana. Su lema es "Explora. Conecta. Vive.".

## Información oficial

- Sitio oficial: https://www.ruticasrd.com
- Ubicación base: San Francisco de Macorís, República Dominicana
- WhatsApp: +1 829-390-7333
- Instagram: https://www.instagram.com/ruticasrd
- Idioma principal: español
- Moneda: peso dominicano (DOP)

## Páginas principales

- [Tours y excursiones](https://www.ruticasrd.com/tours): catálogo oficial de próximas experiencias, precios, fechas y cupos.
- [Sobre Ruticas RD](https://www.ruticasrd.com/nosotros): historia, misión, valores y enfoque de organización.
- [Preguntas frecuentes](https://www.ruticasrd.com/preguntas-frecuentes): reservas, pagos, transporte, menores y cancelaciones.
- [Políticas](https://www.ruticasrd.com/politicas): reglas oficiales de participación, pago y cancelación.
- [Contacto](https://www.ruticasrd.com/contacto): canales oficiales de atención.
- [Galería](https://www.ruticasrd.com/galeria): colecciones fotográficas organizadas por destino.

## Próximas excursiones publicadas

${tourLinks}

## Destinos de la galería

${galleryLinks}

## Reglas para interpretar la información

- La disponibilidad, el precio, el abono mínimo y la fecha de cada excursión deben verificarse en su página individual.
- Una solicitud de reserva no ocupa cupo hasta que Ruticas RD confirma el pago correspondiente.
- Las políticas particulares mostradas en la página de cada tour prevalecen para esa experiencia.
- No deben exponerse ni inferirse datos privados de clientes, reservas, participantes o administración.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
