export type TourDifficulty =
  | "facil"
  | "moderada"
  | "demandante";

export type TourCategory =
  | "senderismo"
  | "balneario"
  | "cascada"
  | "montana"
  | "parque_nacional"
  | "playa"
  | "ecologico"
  | "turistico";

export type TourStatus =
  | "borrador"
  | "publicado"
  | "cupos_agotados"
  | "cancelado"
  | "completado";

export interface TourItineraryItem {
  time?: string;
  title: string;
  description?: string;
}

export interface Tour {
  id: string;
  slug: string;

  title: string;
  shortDescription: string;
  description: string;

  category: TourCategory;
  difficulty: TourDifficulty;

  location: string;
  province: string;
  meetingPoint: string;

  date: string;
  departureTime: string;
  estimatedReturnTime?: string;
  duration?: string;

  price: number;
  depositAmount: number;
  reservationDeadline: string;

  capacity: number;
  availableSpots: number;

  minimumAge?: number;
  minorsAllowed: boolean;

  transportIncluded: boolean;
  localGuideIncluded: boolean;

  includes: string[];
  notIncludes: string[];

  requirements: string[];
  recommendations: string[];
  inherentRisks: string[];

  punctualityPolicy: string;
  cancellationPolicy: string;

  itinerary: TourItineraryItem[];

  coverImage: string;
  images: string[];

  status: TourStatus;
  featured: boolean;

  createdAt: string;
  updatedAt: string;
}