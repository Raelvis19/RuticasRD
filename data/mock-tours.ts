import type { Tour } from "@/types/tour";

export const mockTours: Tour[] = [
  {
    id: "tour-demo-001",
    slug: "aventura-ruticas-demo",

    title: "Aventura Ruticas RD",
    shortDescription:
      "Una experiencia entre montañas, senderos y paisajes naturales.",
    description:
      "Excursión provisional utilizada para desarrollar y probar la plataforma de Ruticas RD.",

    category: "senderismo",
    difficulty: "moderada",

    location: "Constanza",
    province: "La Vega",
    meetingPoint: "San Francisco de Macorís",

    date: "2026-09-20",
    departureTime: "06:00",
    estimatedReturnTime: "18:00",
    duration: "Día completo",

    price: 1800,
    depositAmount: 800,
    reservationDeadline: "2026-09-15",

    capacity: 30,
    availableSpots: 18,

    minimumAge: 12,
    minorsAllowed: true,

    transportIncluded: true,
    localGuideIncluded: true,

    includes: [
      "Transporte de ida y vuelta",
      "Acompañamiento durante el recorrido",
      "Guía local",
      "Experiencia organizada",
    ],

    notIncludes: [
      "Alimentación",
      "Gastos personales",
      "Servicios no especificados",
    ],

    requirements: [
      "Ropa cómoda",
      "Calzado adecuado para senderismo",
      "Documento de identidad",
      "Agua suficiente",
    ],

    recommendations: [
      "Llevar protector solar",
      "Llevar repelente",
      "Llegar al punto de encuentro con anticipación",
    ],

    inherentRisks: [
      "Caminos irregulares",
      "Cambios inesperados del clima",
      "Cansancio físico durante el recorrido",
    ],

    punctualityPolicy:
      "Los participantes deben llegar al punto de encuentro al menos 20 minutos antes de la hora de salida.",

    cancellationPolicy:
      "Las condiciones de cancelación y reembolso dependerán del momento en que se solicite la cancelación.",

    itinerary: [
      {
        time: "06:00",
        title: "Salida",
        description:
          "Inicio del viaje desde el punto de encuentro establecido.",
      },
      {
        time: "09:00",
        title: "Llegada al destino",
        description:
          "Orientación del grupo e inicio de la experiencia.",
      },
      {
        time: "12:30",
        title: "Descanso",
        description:
          "Tiempo destinado para descansar y compartir con el grupo.",
      },
      {
        time: "16:00",
        title: "Regreso",
        description: "Inicio del viaje de regreso.",
      },
    ],

    coverImage: "/images/tours/tour-demo/portada.webp",

    images: [
      "/images/tours/tour-demo/tour-demo-01.webp",
      "/images/tours/tour-demo/tour-demo-02.webp",
    ],

    status: "publicado",
    featured: true,

    createdAt: "2026-08-05T00:00:00.000Z",
    updatedAt: "2026-08-05T00:00:00.000Z",
  },
];