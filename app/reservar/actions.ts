"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface PublicReservationCustomer {
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  city: string;
}

export interface PublicReservationParticipant {
  fullName: string;
  documentNumber: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
  isMinor: boolean;
  guardianName: string;
}

export async function createReservationAction(input: {
  tourId: string;
  customer: PublicReservationCustomer;
  participants: PublicReservationParticipant[];
}): Promise<{ code?: string; error?: string }> {
  if (!isUuid(input.tourId)) {
    return { error: "No pudimos identificar el tour seleccionado." };
  }

  if (!input.customer || !Array.isArray(input.participants)) {
    return { error: "La información de la reservación está incompleta." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_public_reservation", {
    p_tour_id: input.tourId,
    p_customer: input.customer,
    p_participants: input.participants,
  });

  if (error) {
    return { error: getReservationErrorMessage(error.message) };
  }

  if (typeof data !== "string" || !data.startsWith("RUT-")) {
    return {
      error: "Supabase no devolvió un código de reservación válido.",
    };
  }

  revalidatePath("/");
  revalidatePath("/tours");
  return { code: data };
}

function getReservationErrorMessage(message: string) {
  if (message.includes("insufficient_spots") || message.includes("tour_sold_out")) {
    return "Ya no quedan suficientes cupos para esta cantidad de participantes.";
  }
  if (message.includes("reservation_deadline_passed")) {
    return "La fecha límite para reservar este tour ya terminó.";
  }
  if (message.includes("duplicate_recent_reservation")) {
    return "Ya recibimos una solicitud reciente con este teléfono para el mismo tour.";
  }
  if (message.includes("tour_not_available")) {
    return "Este tour ya no está disponible para reservaciones.";
  }
  if (
    message.includes("invalid_") ||
    message.includes("incomplete_") ||
    message.includes("minor_requires_guardian") ||
    message.includes("data_too_long")
  ) {
    return "Revisa los datos de la persona responsable y los participantes.";
  }
  if (message.includes("create_public_reservation")) {
    return "Falta activar la función de reservaciones en Supabase.";
  }
  return "No pudimos registrar la reservación. Inténtalo nuevamente.";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
