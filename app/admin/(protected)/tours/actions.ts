"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  tourCategoryOptions,
  tourDifficultyOptions,
  tourManagementStatusOptions,
} from "@/lib/tours/options";
import type {
  TourCategory,
  TourDifficulty,
  TourItineraryItem,
  TourStatus,
} from "@/types/tour";

export interface TourFormState {
  message?: string;
  errors?: Record<string, string>;
}

export type CreateTourState = TourFormState;

const allowedCategories = new Set<TourCategory>(
  tourCategoryOptions.map((option) => option.value),
);
const allowedDifficulties = new Set<TourDifficulty>(
  tourDifficultyOptions.map((option) => option.value),
);
const allowedStatuses = new Set<TourStatus>(
  tourManagementStatusOptions.map((option) => option.value),
);

export async function createTourAction(
  _previousState: TourFormState,
  formData: FormData,
): Promise<TourFormState> {
  const admin = await requireAdmin();
  const parsed = parseTourForm(formData);

  if (!parsed.success) {
    return {
      message:
        "Revisa los campos indicados. La información que escribiste se conserva.",
      errors: parsed.errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tours").insert({
    ...parsed.data,
    created_by: admin.id,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        message: "Ya existe un tour con ese enlace. Utiliza un slug diferente.",
        errors: { slug: "Este enlace ya está en uso." },
      };
    }

    return {
      message:
        "Supabase no pudo guardar el tour. Inténtalo nuevamente en unos momentos.",
    };
  }

  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath("/");
  redirect("/admin/tours?created=1");
}

export async function updateTourAction(
  _previousState: TourFormState,
  formData: FormData,
): Promise<TourFormState> {
  await requireAdmin();

  const tourId = getText(formData, "tour_id");
  if (!isUuid(tourId)) {
    return { message: "No pudimos identificar el tour que deseas editar." };
  }

  const parsed = parseTourForm(formData);
  if (!parsed.success) {
    return {
      message:
        "Revisa los campos indicados. La información que escribiste se conserva.",
      errors: parsed.errors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .update(parsed.data)
    .eq("id", tourId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return {
        message: "Ya existe un tour con ese enlace. Utiliza un slug diferente.",
        errors: { slug: "Este enlace ya está en uso." },
      };
    }

    return {
      message:
        "Supabase no pudo actualizar el tour. Inténtalo nuevamente en unos momentos.",
    };
  }

  if (!data) {
    return { message: "El tour ya no existe o no está disponible." };
  }

  revalidatePath("/admin/tours");
  revalidatePath(`/admin/tours/${tourId}/editar`);
  revalidatePath("/tours");
  revalidatePath("/");
  redirect("/admin/tours?updated=1");
}

function parseTourForm(formData: FormData):
  | { success: true; data: Record<string, unknown> }
  | { success: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const title = getText(formData, "title");
  const slug = slugify(getText(formData, "slug") || title);
  const shortDescription = getText(formData, "short_description");
  const description = getText(formData, "description");
  const category = getText(formData, "category");
  const difficulty = getText(formData, "difficulty");
  const location = getText(formData, "location");
  const province = getText(formData, "province");
  const meetingPoint = getText(formData, "meeting_point");
  const departureDate = getText(formData, "departure_date");
  const departureTime = getText(formData, "departure_time");
  const returnDate = getText(formData, "return_date");
  const returnTime = getText(formData, "return_time");
  const deadlineDate = getText(formData, "deadline_date");
  const deadlineTime = getText(formData, "deadline_time");
  const duration = getText(formData, "duration");
  const status = getText(formData, "status");
  const punctualityPolicy = getText(formData, "punctuality_policy");
  const cancellationPolicy = getText(formData, "cancellation_policy");

  if (title.length < 3 || title.length > 120) {
    errors.title = "Escribe un título de 3 a 120 caracteres.";
  }
  if (!slug || slug.length > 140) {
    errors.slug = "Escribe un enlace válido y breve.";
  }
  if (shortDescription.length < 10 || shortDescription.length > 240) {
    errors.short_description = "Escribe un resumen de 10 a 240 caracteres.";
  }
  if (description.length < 20 || description.length > 5000) {
    errors.description = "La descripción debe tener entre 20 y 5,000 caracteres.";
  }
  if (!allowedCategories.has(category as TourCategory)) {
    errors.category = "Selecciona una categoría válida.";
  }
  if (!allowedDifficulties.has(difficulty as TourDifficulty)) {
    errors.difficulty = "Selecciona una dificultad válida.";
  }
  if (!location) errors.location = "Indica la ubicación.";
  if (!province) errors.province = "Indica la provincia.";
  if (!meetingPoint) errors.meeting_point = "Indica el punto de encuentro.";

  const departureAt = toDominicanIso(departureDate, departureTime);
  const estimatedReturnAt =
    returnDate || returnTime
      ? toDominicanIso(returnDate, returnTime)
      : null;
  const reservationDeadline = toDominicanIso(deadlineDate, deadlineTime);

  if (!departureAt) errors.departure_date = "Indica una fecha y hora válidas.";
  if ((returnDate || returnTime) && !estimatedReturnAt) {
    errors.return_date = "Completa correctamente la fecha y hora de regreso.";
  }
  if (!reservationDeadline) {
    errors.deadline_date = "Indica una fecha límite válida.";
  }
  if (
    departureAt &&
    estimatedReturnAt &&
    new Date(estimatedReturnAt) <= new Date(departureAt)
  ) {
    errors.return_date = "El regreso debe ser posterior a la salida.";
  }
  if (
    departureAt &&
    reservationDeadline &&
    new Date(reservationDeadline) >= new Date(departureAt)
  ) {
    errors.deadline_date = "La fecha límite debe ser anterior a la salida.";
  }

  const price = getNumber(formData, "price");
  const depositAmount = getNumber(formData, "deposit_amount");
  const capacity = getNumber(formData, "capacity");
  const minimumAgeText = getText(formData, "minimum_age");
  const minimumAge = minimumAgeText ? Number(minimumAgeText) : null;

  if (price === null || price < 0 || price > 10_000_000) {
    errors.price = "Indica un precio válido.";
  }
  if (
    depositAmount === null ||
    depositAmount < 0 ||
    depositAmount > 10_000_000
  ) {
    errors.deposit_amount = "Indica un abono válido.";
  } else if (price !== null && depositAmount > price) {
    errors.deposit_amount = "El abono no puede superar el precio.";
  }
  if (
    capacity === null ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 1000
  ) {
    errors.capacity = "La capacidad debe ser un número entero entre 1 y 1,000.";
  }
  if (
    minimumAge !== null &&
    (!Number.isInteger(minimumAge) || minimumAge < 0 || minimumAge > 100)
  ) {
    errors.minimum_age = "Indica una edad mínima válida.";
  }
  if (!allowedStatuses.has(status as TourStatus)) {
    errors.status = "Selecciona un estado válido.";
  }
  if (!punctualityPolicy) {
    errors.punctuality_policy = "Incluye la política de puntualidad.";
  }
  if (!cancellationPolicy) {
    errors.cancellation_policy = "Incluye la política de cancelación.";
  }

  const itineraryResult = parseItinerary(getText(formData, "itinerary"));
  if (itineraryResult.error) {
    errors.itinerary = itineraryResult.error;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      slug,
      title,
      short_description: shortDescription,
      description,
      category,
      difficulty,
      location,
      province,
      meeting_point: meetingPoint,
      departure_at: departureAt,
      estimated_return_at: estimatedReturnAt,
      duration: duration || null,
      price,
      deposit_amount: depositAmount,
      reservation_deadline: reservationDeadline,
      capacity,
      minimum_age: minimumAge,
      minors_allowed: formData.get("minors_allowed") === "on",
      transport_included: formData.get("transport_included") === "on",
      local_guide_included: formData.get("local_guide_included") === "on",
      includes: getLines(formData, "includes"),
      not_includes: getLines(formData, "not_includes"),
      requirements: getLines(formData, "requirements"),
      recommendations: getLines(formData, "recommendations"),
      inherent_risks: getLines(formData, "inherent_risks"),
      punctuality_policy: punctualityPolicy,
      cancellation_policy: cancellationPolicy,
      itinerary: itineraryResult.items,
      status,
      featured: formData.get("featured") === "on",
    },
  };
}

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getNumber(formData: FormData, name: string) {
  const value = getText(formData, name);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getLines(formData: FormData, name: string) {
  return getText(formData, name)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function toDominicanIso(date: string, time: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const calendarCheck = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const parsed = new Date(`${date}T${time}:00-04:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseItinerary(value: string): {
  items: TourItineraryItem[];
  error?: string;
} {
  if (!value) return { items: [] };

  const items: TourItineraryItem[] = [];
  const lines = value.split(/\r?\n/).filter((line) => line.trim());

  for (const [index, line] of lines.entries()) {
    const [time, title, ...descriptionParts] = line
      .split("|")
      .map((part) => part.trim());

    if (!time || !isValidTime(time) || !title) {
      return {
        items: [],
        error: `La línea ${index + 1} debe usar: HH:MM | Título | Descripción.`,
      };
    }

    items.push({
      time,
      title,
      description: descriptionParts.join(" | ") || undefined,
    });
  }

  return { items };
}

function isValidTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  return Number(match[1]) <= 23 && Number(match[2]) <= 59;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
