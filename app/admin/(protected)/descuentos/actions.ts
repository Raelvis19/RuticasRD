"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export interface DiscountState {
  error?: string;
  success?: string;
}
export async function saveDiscountAction(
  _state: DiscountState,
  form: FormData,
): Promise<DiscountState> {
  await requireAdmin();
  const text = (name: string) => String(form.get(name) ?? "").trim();
  const kind = text("kind");
  const amount = kind === "free_seat" ? 0 : Number(text("amount"));
  const maxUses = Number(text("max_uses"));
  const email = text("winner_email").toLowerCase();
  const expiration = text("expires_at");
  const expiresAt = expiration ? new Date(`${expiration}:00-04:00`) : null;
  if (
    !/^[A-Z0-9-]{4,40}$/.test(text("code").toUpperCase()) ||
    !["fixed", "free_seat"].includes(kind) ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    amount > 9999999999.99 ||
    (kind === "fixed" && amount <= 0) ||
    !Number.isInteger(maxUses) ||
    maxUses < 1 ||
    maxUses > 10000 ||
    (expiresAt && Number.isNaN(expiresAt.getTime())) ||
    (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180))
  ) {
    return {
      error: "Revisa el código, monto, límite de usos, fecha y correo.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_discount", {
    p_id: text("id") || null,
    p_code: text("code").toUpperCase(),
    p_tour_id: text("tour_id"),
    p_kind: kind,
    p_amount: amount,
    p_max_uses: maxUses,
    p_expires_at: expiresAt?.toISOString() ?? null,
    p_winner_email: email || null,
    p_is_active: form.get("is_active") === "on",
  });
  if (error) {
    if (error.code === "23505")
      return { error: "Ese código ya existe. Usa otro." };
    if (error.message.includes("discount_already_used"))
      return {
        error:
          "Este código ya se utilizó. Solo puedes cambiar vigencia, límite de usos y activación.",
      };
    if (error.message.includes("discount_limit_below_usage"))
      return { error: "El límite no puede ser menor que los usos actuales." };
    return {
      error:
        "No se pudo guardar el descuento. Comprueba los datos y que la migración esté instalada.",
    };
  }
  revalidatePath("/admin/descuentos");
  return { success: "Descuento guardado." };
}

export async function releaseDiscountAction(
  _state: DiscountState,
  form: FormData,
): Promise<DiscountState> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_release_discount", {
    p_reservation_id: String(form.get("reservation_id") ?? ""),
  });
  if (error)
    return {
      error: "Solo se puede liberar el descuento de una reserva cancelada.",
    };
  revalidatePath("/admin/descuentos");
  return {
    success: "Uso liberado. La reserva anterior permanecerá cancelada.",
  };
}
