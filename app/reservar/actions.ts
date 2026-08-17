"use server";

import { revalidatePath } from "next/cache";

import { sendReservationConfirmationEmail } from "@/lib/email/reservation-confirmation";
import { createClient } from "@/lib/supabase/server";
import { getPublicTourById } from "@/lib/tours/public";

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
}): Promise<{ code?: string; emailSent?: boolean; error?: string }> {
  if (!isUuid(input.tourId)) {
    return { error: "No pudimos identificar el tour seleccionado." };
  }

  if (!input.customer || !Array.isArray(input.participants)) {
    return { error: "La información de la reservación está incompleta." };
  }

  const customer = normalizeCustomer(input.customer);
  const participants = input.participants.map(normalizeParticipant);

  if (!isValidEmail(customer.email)) {
    return {
      error: "Escribe un correo electrónico válido para recibir tu reservación.",
    };
  }

  if (participants.length < 1 || participants.length > 50) {
    return { error: "La cantidad de participantes no es válida." };
  }

  const tour = await getPublicTourById(input.tourId);
  if (!tour) {
    return { error: "Este tour ya no está disponible para reservaciones." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_public_reservation", {
    p_tour_id: input.tourId,
    p_customer: customer,
    p_participants: participants,
  });

  if (error) {
    return { error: getReservationErrorMessage(error.message) };
  }

  if (typeof data !== "string" || !data.startsWith("RUT-")) {
    return {
      error: "Supabase no devolvió un código de reservación válido.",
    };
  }

  const emailResult = await sendReservationConfirmationEmail({
    reservationCode: data,
    customer,
    participants,
    tour: {
      title: tour.title,
      location: tour.location,
      province: tour.province,
      meetingPoint: tour.meetingPoint,
      date: tour.date,
      departureTime: tour.departureTime,
      price: tour.price,
      depositAmount: tour.depositAmount,
    },
  });

  revalidatePath("/");
  revalidatePath("/tours");
  return { code: data, emailSent: emailResult.sent };
}

function normalizeCustomer(customer: PublicReservationCustomer) {
  return {
    fullName: String(customer.fullName ?? "").trim(),
    documentNumber: String(customer.documentNumber ?? "").trim(),
    phone: String(customer.phone ?? "").trim(),
    email: String(customer.email ?? "").trim().toLowerCase(),
    city: String(customer.city ?? "").trim(),
  };
}

function normalizeParticipant(participant: PublicReservationParticipant) {
  return {
    fullName: String(participant.fullName ?? "").trim(),
    documentNumber: String(participant.documentNumber ?? "").trim(),
    city: String(participant.city ?? "").trim(),
    emergencyName: String(participant.emergencyName ?? "").trim(),
    emergencyPhone: String(participant.emergencyPhone ?? "").trim(),
    isMinor: Boolean(participant.isMinor),
    guardianName: String(participant.guardianName ?? "").trim(),
  };
}

function isValidEmail(value: string) {
  return (
    value.length <= 180 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
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
