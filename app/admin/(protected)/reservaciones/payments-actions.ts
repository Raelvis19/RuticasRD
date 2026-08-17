"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { sendConfirmedReservationEmail } from "@/lib/email/reservation-confirmed";
import { createClient } from "@/lib/supabase/server";

export interface PaymentActionState {
  message?: string;
  success?: boolean;
}

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function addPaymentAction(
  _state: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  await requireAdmin();
  const reservationId = text(formData, "reservation_id");
  const amount = Number(text(formData, "amount"));
  const method = text(formData, "method");
  const reference = text(formData, "reference");
  const paidAt = text(formData, "paid_at");
  const receipt = formData.get("receipt");

  if (!isUuid(reservationId) || !Number.isFinite(amount) || amount <= 0) {
    return { message: "Indica un monto válido." };
  }
  if (!["transferencia", "efectivo", "otro"].includes(method)) {
    return { message: "Selecciona un método de pago válido." };
  }
  if (method === "transferencia" && !reference) {
    return { message: "La transferencia necesita un número de referencia." };
  }

  const supabase = await createClient();
  let receiptPath: string | null = null;
  if (receipt instanceof File && receipt.size > 0) {
    if (!acceptedTypes.has(receipt.type) || receipt.size > 8 * 1024 * 1024) {
      return { message: "El comprobante debe ser JPG, PNG, WebP o PDF y pesar menos de 8 MB." };
    }
    const extension = receipt.name.split(".").pop()?.toLowerCase() || "bin";
    receiptPath = `${reservationId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-receipts")
      .upload(receiptPath, receipt, { contentType: receipt.type, upsert: false });
    if (uploadError) return { message: "No se pudo guardar el comprobante privado." };
  }

  const { error } = await supabase.from("payments").insert({
    reservation_id: reservationId,
    amount,
    method,
    reference: reference || null,
    receipt_path: receiptPath,
    paid_at: paidAt ? new Date(`${paidAt}:00-04:00`).toISOString() : new Date().toISOString(),
    verification_status: "pendiente",
  });
  if (error) {
    if (receiptPath) await supabase.storage.from("payment-receipts").remove([receiptPath]);
    return { message: "No se pudo registrar el pago." };
  }
  revalidatePath(`/admin/reservaciones/${reservationId}`);
  revalidatePath("/admin/reservaciones");
  return { success: true, message: "Pago registrado y pendiente de verificación." };
}

export async function reviewPaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  const paymentId = text(formData, "payment_id");
  const reservationId = text(formData, "reservation_id");
  const decision = text(formData, "decision");
  const reason = text(formData, "reason");
  if (!isUuid(paymentId) || !isUuid(reservationId) || !["verificado", "rechazado"].includes(decision)) return;

  const supabase = await createClient();
  const { data: previousReservation, error: previousError } = await supabase
    .from("reservations")
    .select("reservation_status")
    .eq("id", reservationId)
    .maybeSingle();
  if (previousError || !previousReservation) return;

  const { error: reviewError } = await supabase
    .from("payments")
    .update({
      verification_status: decision,
      verified_at: decision === "verificado" ? new Date().toISOString() : null,
      verified_by: decision === "verificado" ? admin.id : null,
      rejection_reason: decision === "rechazado" ? reason || "Comprobante no válido" : null,
    })
    .eq("id", paymentId)
    .eq("reservation_id", reservationId);
  if (reviewError) {
    console.error("[payments] Could not review payment:", reviewError);
    return;
  }

  const { data: currentReservation, error: currentError } = await supabase
    .from("reservations")
    .select("reservation_status")
    .eq("id", reservationId)
    .maybeSingle();
  if (currentError || !currentReservation) return;

  let emailDelivery: "sent" | "failed" | undefined;
  if (
    previousReservation.reservation_status !== "confirmada" &&
    currentReservation.reservation_status === "confirmada"
  ) {
    const emailResult = await sendConfirmedReservationEmail(reservationId);
    emailDelivery = emailResult.sent ? "sent" : "failed";
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/reservaciones/${reservationId}`);
  revalidatePath("/admin/reservaciones");
  revalidatePath("/tours");

  if (emailDelivery) {
    redirect(
      `/admin/reservaciones/${reservationId}?email=${emailDelivery}`,
    );
  }
}

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}
function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value);
}
