"use server";
import { createClient } from "@/lib/supabase/server";
import type { DiscountQuote } from "@/types/discount";

export async function previewDiscountAction(input: {
  tourId: string;
  code: string;
  count: number;
  email: string;
}): Promise<{ quote?: DiscountQuote; error?: string }> {
  if (
    !/^[A-Z0-9-]{4,40}$/.test(input.code) ||
    !Number.isInteger(input.count) ||
    input.count < 1 ||
    input.count > 50 ||
    input.email.length > 180
  ) {
    return { error: "Revisa el código y los datos de la reserva." };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("preview_reservation_discount", {
      p_tour_id: input.tourId,
      p_code: input.code,
      p_count: input.count,
      p_email: input.email,
    });
    if (error || !data)
      return {
        error:
          "El código no está disponible para esta excursión y correo. Revisa su vigencia o consulta con Ruticas RD.",
      };
    return { quote: data as DiscountQuote };
  } catch {
    return { error: "No pudimos validar el código. Inténtalo nuevamente." };
  }
}
