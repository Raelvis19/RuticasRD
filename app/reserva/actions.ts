"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  PaymentStatus,
  ReservationStatus,
} from "@/lib/reservations/options";

export interface PublicReservationSummary {
  code: string;
  tourTitle: string;
  tourSlug: string;
  tourDate: string;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface ReservationLookupState {
  message?: string;
  reservation?: PublicReservationSummary;
}

const reservationStatuses = new Set<ReservationStatus>([
  "pendiente_verificacion",
  "confirmada",
  "lista_espera",
  "cancelada",
  "completada",
]);
const paymentStatuses = new Set<PaymentStatus>([
  "sin_pago",
  "abono",
  "pagado",
  "reembolso_parcial",
  "reembolsado",
]);

export async function lookupReservationAction(
  _previousState: ReservationLookupState,
  formData: FormData,
): Promise<ReservationLookupState> {
  const code = String(formData.get("reservation_code") ?? "")
    .trim()
    .toUpperCase();

  if (!/^RUT-[0-9]{4}-[A-F0-9]{8}$/.test(code)) {
    return {
      message: "Escribe el código completo con el formato RUT-2026-XXXXXXXX.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_reservation_status", {
    p_reservation_code: code,
  });

  if (error) {
    return {
      message:
        "No pudimos consultar la reservación. Confirma que la función esté activa en Supabase.",
    };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      message: "No encontramos una reservación con ese código.",
    };
  }

  const value = data as Record<string, unknown>;
  const reservationStatus = String(value.reservationStatus ?? "");
  const paymentStatus = String(value.paymentStatus ?? "");

  if (
    !reservationStatuses.has(reservationStatus as ReservationStatus) ||
    !paymentStatuses.has(paymentStatus as PaymentStatus)
  ) {
    return { message: "La reservación contiene un estado no reconocido." };
  }

  return {
    reservation: {
      code: String(value.code ?? code),
      tourTitle: String(value.tourTitle ?? "Tour"),
      tourSlug: String(value.tourSlug ?? ""),
      tourDate: String(value.tourDate ?? ""),
      participantCount: Number(value.participantCount ?? 0),
      totalAmount: Number(value.totalAmount ?? 0),
      requiredDeposit: Number(value.requiredDeposit ?? 0),
      reservationStatus: reservationStatus as ReservationStatus,
      paymentStatus: paymentStatus as PaymentStatus,
      createdAt: String(value.createdAt ?? ""),
    },
  };
}
