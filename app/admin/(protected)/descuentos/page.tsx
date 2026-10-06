import Link from "next/link";
import DiscountForm, {
  ReleaseDiscountForm,
  type DiscountRecord,
} from "@/components/admin/DiscountForm";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDop } from "@/lib/format";

export const metadata = { title: "Descuentos" };
interface Redemption {
  discount_id: string;
  reservation_id: string | null;
  reservation_code: string;
  released_at: string | null;
  reservations:
    { reservation_status: string } | { reservation_status: string }[] | null;
}
export default async function DiscountsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [discounts, tours, redemptions] = await Promise.all([
    supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("tours")
      .select("id,title")
      .order("departure_at", { ascending: false }),
    supabase
      .from("discount_redemptions")
      .select(
        "discount_id,reservation_id,reservation_code,released_at,reservations(reservation_status)",
      )
      .order("created_at", { ascending: false }),
  ]);
  if (discounts.error || tours.error || redemptions.error)
    return (
      <div role="alert" className="rounded-2xl bg-amber-50 p-6">
        No pudimos cargar los descuentos. Comprueba la conexión y que la
        migración de descuentos esté instalada.
      </div>
    );
  const now = new Date().getTime();
  const uses = (redemptions.data ?? []) as unknown as Redemption[];
  const tourList = tours.data ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Descuentos</h1>
        <p className="mt-3 text-[#52675e]">
          Premios para una excursión: un monto fijo o un participante gratis.
          Cada reserva admite un código.
        </p>
      </div>
      <details
        className="rounded-3xl border border-[#dce6e0] bg-white p-5 sm:p-7"
        open={(discounts.data ?? []).length === 0}
      >
        <summary className="cursor-pointer text-lg font-black">
          Crear código de descuento
        </summary>
        <div className="mt-5">
          <DiscountForm tours={tourList} />
        </div>
      </details>
      {(discounts.data ?? []).map((raw) => {
        const d = raw as DiscountRecord;
        const history = uses.filter((r) => r.discount_id === d.id);
        const count = history.filter((r) => !r.released_at).length;
        const expired =
          !!d.expires_at && new Date(d.expires_at).getTime() <= now;
        return (
          <section
            key={d.id}
            className="rounded-3xl border border-[#dce6e0] bg-white p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">{d.code}</h2>
              <p className="text-sm font-bold">
                {!d.is_active
                  ? "Desactivado"
                  : expired
                    ? "Vencido"
                    : count >= d.max_uses
                      ? "Agotado"
                      : "Activo"}{" "}
                · {count}/{d.max_uses} usos
              </p>
            </div>
            <p className="mt-2 text-sm">
              {tourList.find((t) => t.id === d.tour_id)?.title} ·{" "}
              {d.kind === "free_seat"
                ? "Un cupo gratis"
                : formatDop(Number(d.amount))}
            </p>
            <details className="mt-5">
              <summary className="cursor-pointer font-bold text-[#0f5132]">
                Editar código
              </summary>
              <div className="mt-4">
                <DiscountForm
                  tours={tourList}
                  discount={d}
                  used={history.length > 0}
                />
              </div>
            </details>
            {history.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-[#dce6e0] pt-4">
                <h3 className="font-bold">Reservas que usaron este código</h3>
                {history.map((r) => {
                  const reservation = Array.isArray(r.reservations)
                    ? r.reservations[0]
                    : r.reservations;
                  return (
                    <div
                      key={r.reservation_code}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f4f7f5] p-3"
                    >
                      {r.reservation_id ? (
                        <Link
                          className="font-bold underline"
                          href={`/admin/reservaciones/${r.reservation_id}`}
                        >
                          {r.reservation_code}
                        </Link>
                      ) : (
                        <span>{r.reservation_code} (eliminada)</span>
                      )}
                      {r.released_at ? (
                        <span className="text-sm">Uso liberado</span>
                      ) : reservation?.reservation_status === "cancelada" &&
                        r.reservation_id ? (
                        <ReleaseDiscountForm reservationId={r.reservation_id} />
                      ) : (
                        <span className="text-sm">Uso asignado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
