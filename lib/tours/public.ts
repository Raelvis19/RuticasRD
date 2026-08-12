import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import {
  defaultCancellationPolicy,
  defaultPunctualityPolicy,
} from "@/lib/tours/options";
import { TOUR_IMAGE_BUCKET } from "@/lib/tours/storage";
import type {
  Tour,
  TourCategory,
  TourDifficulty,
  TourItineraryItem,
  TourStatus,
} from "@/types/tour";

const publicTourSelect = `
  id,
  slug,
  title,
  short_description,
  description,
  category,
  difficulty,
  location,
  province,
  meeting_point,
  departure_at,
  estimated_return_at,
  duration,
  price,
  deposit_amount,
  reservation_deadline,
  capacity,
  minimum_age,
  minors_allowed,
  transport_included,
  local_guide_included,
  includes,
  not_includes,
  requirements,
  recommendations,
  inherent_risks,
  punctuality_policy,
  cancellation_policy,
  itinerary,
  status,
  featured,
  created_at,
  updated_at,
  tour_images (
    storage_path,
    alt_text,
    position,
    is_cover
  )
`;

interface PublicTourImageRow {
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
}

interface PublicTourRow {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  category: TourCategory;
  difficulty: TourDifficulty;
  location: string;
  province: string;
  meeting_point: string;
  departure_at: string;
  estimated_return_at: string | null;
  duration: string | null;
  price: number | string;
  deposit_amount: number | string;
  reservation_deadline: string;
  capacity: number;
  minimum_age: number | null;
  minors_allowed: boolean;
  transport_included: boolean;
  local_guide_included: boolean;
  includes: string[] | null;
  not_includes: string[] | null;
  requirements: string[] | null;
  recommendations: string[] | null;
  inherent_risks: string[] | null;
  punctuality_policy: string | null;
  cancellation_policy: string | null;
  itinerary: unknown;
  status: TourStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  tour_images: PublicTourImageRow[] | null;
}

interface AvailabilityRow {
  tour_id: string;
  available_spots: number;
}

export const getPublicTours = cache(async (): Promise<Tour[]> => {
  const supabase = await createClient();
  const [{ data, error }, availability] = await Promise.all([
    supabase
      .from("tours")
      .select(publicTourSelect)
      .in("status", ["publicado", "cupos_agotados"])
      .order("departure_at", { ascending: true }),
    getAvailability(),
  ]);

  if (error) return [];

  return ((data ?? []) as PublicTourRow[]).map((row) =>
    mapPublicTour(row, availability),
  );
});

export const getPublicTourBySlug = cache(
  async (slug: string): Promise<Tour | null> => {
    if (!slug || slug.length > 140) return null;

    const supabase = await createClient();
    const [{ data, error }, availability] = await Promise.all([
      supabase
        .from("tours")
        .select(publicTourSelect)
        .eq("slug", slug)
        .in("status", ["publicado", "cupos_agotados"])
        .maybeSingle(),
      getAvailability(),
    ]);

    if (error || !data) return null;
    return mapPublicTour(data as PublicTourRow, availability);
  },
);

export const getPublicTourById = cache(
  async (tourId: string): Promise<Tour | null> => {
    if (!isUuid(tourId)) return null;

    const supabase = await createClient();
    const [{ data, error }, availability] = await Promise.all([
      supabase
        .from("tours")
        .select(publicTourSelect)
        .eq("id", tourId)
        .in("status", ["publicado", "cupos_agotados"])
        .maybeSingle(),
      getAvailability(),
    ]);

    if (error || !data) return null;
    return mapPublicTour(data as PublicTourRow, availability);
  },
);

async function getAvailability() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_tour_availability");

  if (error) return new Map<string, number>();

  return new Map(
    ((data ?? []) as AvailabilityRow[]).map((row) => [
      row.tour_id,
      Number(row.available_spots),
    ]),
  );
}

function mapPublicTour(
  row: PublicTourRow,
  availability: Map<string, number>,
): Tour {
  const departure = formatDominicanDateTime(row.departure_at);
  const estimatedReturn = formatDominicanDateTime(row.estimated_return_at);
  const deadline = formatDominicanDateTime(row.reservation_deadline);
  const images = [...(row.tour_images ?? [])].sort((first, second) => {
    if (first.is_cover !== second.is_cover) return first.is_cover ? -1 : 1;
    return first.position - second.position;
  });
  const imageUrls = images.map((image) => getPublicImageUrl(image.storage_path));
  const coverImage = imageUrls[0] ?? "/images/placeholders/tour-placeholder.webp";
  const availableSpots =
    row.status === "cupos_agotados"
      ? 0
      : Math.max(
          0,
          Math.min(availability.get(row.id) ?? row.capacity, row.capacity),
        );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    location: row.location,
    province: row.province,
    meetingPoint: row.meeting_point,
    date: departure.date,
    departureTime: departure.time,
    estimatedReturnTime: estimatedReturn.time || undefined,
    duration: row.duration ?? undefined,
    price: Number(row.price),
    depositAmount: Number(row.deposit_amount),
    reservationDeadline: deadline.date,
    capacity: row.capacity,
    availableSpots,
    minimumAge: row.minimum_age ?? undefined,
    minorsAllowed: row.minors_allowed,
    transportIncluded: row.transport_included,
    localGuideIncluded: row.local_guide_included,
    includes: row.includes ?? [],
    notIncludes: row.not_includes ?? [],
    requirements: row.requirements ?? [],
    recommendations: row.recommendations ?? [],
    inherentRisks: row.inherent_risks ?? [],
    punctualityPolicy: row.punctuality_policy ?? defaultPunctualityPolicy,
    cancellationPolicy: row.cancellation_policy ?? defaultCancellationPolicy,
    itinerary: parseItinerary(row.itinerary),
    coverImage,
    images: imageUrls.slice(1),
    status: row.status,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getPublicImageUrl(storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}/storage/v1/object/public/${TOUR_IMAGE_BUCKET}/${storagePath}`;
}

function formatDominicanDateTime(value: string | null) {
  if (!value) return { date: "", time: "" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

function parseItinerary(value: unknown): TourItineraryItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.title !== "string" || !record.title.trim()) return [];

    return [
      {
        time: typeof record.time === "string" ? record.time : undefined,
        title: record.title,
        description:
          typeof record.description === "string" ? record.description : undefined,
      },
    ];
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
