import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { TourFormValues } from "@/lib/tours/form";
import {
  TOUR_IMAGE_BUCKET,
  type AdminTourMedia,
} from "@/lib/tours/storage";
import type {
  TourCategory,
  TourDifficulty,
  TourStatus,
} from "@/types/tour";

export interface AdminTourListItem {
  id: string;
  slug: string;
  title: string;
  category: TourCategory;
  difficulty: TourDifficulty;
  location: string;
  province: string;
  departureAt: string;
  price: number;
  depositAmount: number;
  capacity: number;
  status: TourStatus;
  featured: boolean;
  createdAt: string;
}

interface AdminTourRow {
  id: string;
  slug: string;
  title: string;
  category: TourCategory;
  difficulty: TourDifficulty;
  location: string;
  province: string;
  departure_at: string;
  price: number | string;
  deposit_amount: number | string;
  capacity: number;
  status: TourStatus;
  featured: boolean;
  created_at: string;
}

interface AdminTourMediaRow {
  id: string;
  title: string;
  slug: string;
  status: TourStatus;
}

interface AdminTourImageRow {
  id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
}

interface AdminTourEditorRow {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: TourCategory;
  difficulty: TourDifficulty;
  location: string;
  province: string;
  meeting_point: string;
  departure_at: string;
  estimated_return_at: string | null;
  reservation_deadline: string;
  duration: string | null;
  price: number | string;
  deposit_amount: number | string;
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
  itinerary: unknown;
  punctuality_policy: string;
  cancellation_policy: string;
  status: TourStatus;
  featured: boolean;
}

export async function getAdminTours(): Promise<{
  tours: AdminTourListItem[];
  error: boolean;
}> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select(
      "id, slug, title, category, difficulty, location, province, departure_at, price, deposit_amount, capacity, status, featured, created_at",
    )
    .order("departure_at", { ascending: true });

  if (error) {
    return { tours: [], error: true };
  }

  const rows = (data ?? []) as AdminTourRow[];

  return {
    error: false,
    tours: rows.map((tour) => ({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      category: tour.category,
      difficulty: tour.difficulty,
      location: tour.location,
      province: tour.province,
      departureAt: tour.departure_at,
      price: Number(tour.price),
      depositAmount: Number(tour.deposit_amount),
      capacity: tour.capacity,
      status: tour.status,
      featured: tour.featured,
      createdAt: tour.created_at,
    })),
  };
}

export async function getAdminTourMedia(tourId: string): Promise<{
  tour: AdminTourMedia | null;
  error: boolean;
}> {
  await requireAdmin();

  if (!isUuid(tourId)) {
    return { tour: null, error: false };
  }

  const supabase = await createClient();
  const { data: tourData, error: tourError } = await supabase
    .from("tours")
    .select("id, title, slug, status")
    .eq("id", tourId)
    .maybeSingle();

  if (tourError) {
    return { tour: null, error: true };
  }

  if (!tourData) {
    return { tour: null, error: false };
  }

  const { data: imageData, error: imageError } = await supabase
    .from("tour_images")
    .select("id, storage_path, alt_text, position, is_cover")
    .eq("tour_id", tourId)
    .order("is_cover", { ascending: false })
    .order("position", { ascending: true });

  if (imageError) {
    return { tour: null, error: true };
  }

  const tour = tourData as AdminTourMediaRow;
  const images = (imageData ?? []) as AdminTourImageRow[];

  return {
    error: false,
    tour: {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      status: tour.status,
      images: images.map((image) => ({
        id: image.id,
        storagePath: image.storage_path,
        altText: image.alt_text ?? "",
        position: image.position,
        isCover: image.is_cover,
        publicUrl: supabase.storage
          .from(TOUR_IMAGE_BUCKET)
          .getPublicUrl(image.storage_path).data.publicUrl,
      })),
    },
  };
}

export async function getAdminTourEditor(tourId: string): Promise<{
  tour: { id: string; values: TourFormValues } | null;
  error: boolean;
}> {
  await requireAdmin();

  if (!isUuid(tourId)) {
    return { tour: null, error: false };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select(
      "id, title, slug, short_description, description, category, difficulty, location, province, meeting_point, departure_at, estimated_return_at, reservation_deadline, duration, price, deposit_amount, capacity, minimum_age, minors_allowed, transport_included, local_guide_included, includes, not_includes, requirements, recommendations, inherent_risks, itinerary, punctuality_policy, cancellation_policy, status, featured",
    )
    .eq("id", tourId)
    .maybeSingle();

  if (error) {
    return { tour: null, error: true };
  }

  if (!data) {
    return { tour: null, error: false };
  }

  const row = data as AdminTourEditorRow;
  const departure = formatDominicanDateTime(row.departure_at);
  const estimatedReturn = formatDominicanDateTime(row.estimated_return_at);
  const deadline = formatDominicanDateTime(row.reservation_deadline);

  return {
    error: false,
    tour: {
      id: row.id,
      values: {
        title: row.title,
        slug: row.slug,
        short_description: row.short_description,
        description: row.description,
        category: row.category,
        difficulty: row.difficulty,
        location: row.location,
        province: row.province,
        meeting_point: row.meeting_point,
        departure_date: departure.date,
        departure_time: departure.time,
        return_date: estimatedReturn.date,
        return_time: estimatedReturn.time,
        deadline_date: deadline.date,
        deadline_time: deadline.time,
        duration: row.duration ?? "",
        price: String(row.price),
        deposit_amount: String(row.deposit_amount),
        capacity: String(row.capacity),
        minimum_age: row.minimum_age === null ? "" : String(row.minimum_age),
        minors_allowed: row.minors_allowed,
        transport_included: row.transport_included,
        local_guide_included: row.local_guide_included,
        includes: joinLines(row.includes),
        not_includes: joinLines(row.not_includes),
        requirements: joinLines(row.requirements),
        recommendations: joinLines(row.recommendations),
        inherent_risks: joinLines(row.inherent_risks),
        itinerary: formatItinerary(row.itinerary),
        punctuality_policy: row.punctuality_policy,
        cancellation_policy: row.cancellation_policy,
        status: row.status,
        featured: row.featured,
      },
    },
  };
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

function joinLines(values: string[] | null) {
  return (values ?? []).join("\n");
}

function formatItinerary(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      const time = typeof record.time === "string" ? record.time : "";
      const title = typeof record.title === "string" ? record.title : "";
      const description =
        typeof record.description === "string" ? record.description : "";
      if (!time || !title) return "";
      return `${time} | ${title}${description ? ` | ${description}` : ""}`;
    })
    .filter(Boolean)
    .join("\n");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
