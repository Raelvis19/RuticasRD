"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import {
  paymentStatusOptions,
  reservationStatusOptions,
  type PaymentStatus,
  type ReservationStatus,
} from "@/lib/reservations/options";
import { createClient } from "@/lib/supabase/server";

export interface ReservationUpdateState {
  message?: string;
}

const allowedReservationStatuses = new Set<ReservationStatus>(
  reservationStatusOptions.map((option) => option.value),
);
const allowedPaymentStatuses = new Set<PaymentStatus>(
  paymentStatusOptions.map((option) => option.value),
);

export async function updateReservationAction(
  _previousState: ReservationUpdateState,
  formData: FormData,
): Promise<ReservationUpdateState> {
  await requireAdmin();

  const reservationId = getText(formData, "reservation_id");
  const reservationStatus = getText(formData, "reservation_status");
  const paymentStatus = getText(formData, "payment_status");
  const adminNotes = getText(formData, "admin_notes");

  if (!isUuid(reservationId)) {
    return { message: "No pudimos identificar la reservación." };
  }
  if (!allowedReservationStatuses.has(reservationStatus as ReservationStatus)) {
    return { message: "Selecciona un estado de reservación válido." };
  }
  if (!allowedPaymentStatuses.has(paymentStatus as PaymentStatus)) {
    return { message: "Selecciona un estado de pago válido." };
  }
  if (adminNotes.length > 3000) {
    return { message: "Las notas administrativas son demasiado extensas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_reservation", {
    p_reservation_id: reservationId,
    p_reservation_status: reservationStatus,
    p_payment_status: paymentStatus,
    p_admin_notes: adminNotes || null,
  });

  if (error) {
    if (error.message.includes("confirmation_requires_payment")) {
      return {
        message:
          "Para confirmar la reservación debes verificar primero un abono o el pago completo.",
      };
    }
    if (error.message.includes("insufficient_spots")) {
      return {
        message:
          "No quedan suficientes cupos para confirmar a todos los participantes de esta reservación.",
      };
    }
    if (error.message.includes("admin_update_reservation")) {
      return {
        message: "Falta ejecutar la migración de administración en Supabase.",
      };
    }
    return { message: "No pudimos actualizar la reservación." };
  }

  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/admin");
  revalidatePath("/admin/reservaciones");
  revalidatePath(`/admin/reservaciones/${reservationId}`);
  redirect(`/admin/reservaciones/${reservationId}?updated=1`);
}

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
