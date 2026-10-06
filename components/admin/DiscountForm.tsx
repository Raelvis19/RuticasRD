"use client";
import { useActionState, useState } from "react";
import {
  saveDiscountAction,
  releaseDiscountAction,
  type DiscountState,
} from "@/app/admin/(protected)/descuentos/actions";

export interface DiscountRecord {
  id: string;
  code: string;
  tour_id: string;
  kind: "fixed" | "free_seat";
  amount: number;
  max_uses: number;
  expires_at: string | null;
  winner_email: string | null;
  is_active: boolean;
}
const field =
  "mt-2 min-h-12 w-full rounded-xl border border-[#d5e1da] bg-white px-3";
const initial: DiscountState = {};
export default function DiscountForm({
  tours,
  discount,
  used = false,
}: {
  tours: { id: string; title: string }[];
  discount?: DiscountRecord;
  used?: boolean;
}) {
  const [state, action, pending] = useActionState(saveDiscountAction, initial);
  const [kind, setKind] = useState(discount?.kind ?? "fixed");
  const date = discount?.expires_at
    ? new Date(new Date(discount.expires_at).getTime() - 4 * 3600000)
        .toISOString()
        .slice(0, 16)
    : "";
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={discount?.id ?? ""} />
      {used && (
        <p className="text-sm text-[#52675e]">
          Ya utilizado: puedes cambiar la vigencia, el límite y la activación.
          El premio original se conserva.
        </p>
      )}
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Código
          <input
            className={field}
            name="code"
            defaultValue={discount?.code}
            required
            pattern="[A-Za-z0-9-]{4,40}"
            maxLength={40}
            readOnly={used}
            placeholder="PREMIO500"
          />
        </label>
        <label className="text-sm font-bold">
          Excursión
          <select
            className={field}
            name="tour_id"
            defaultValue={discount?.tour_id ?? ""}
            required
            disabled={used}
          >
            <option value="" disabled>
              Selecciona un tour
            </option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {used && (
            <input type="hidden" name="tour_id" value={discount?.tour_id} />
          )}
        </label>
        <label className="text-sm font-bold">
          Tipo
          <select
            className={field}
            name="kind"
            value={kind}
            disabled={used}
            onChange={(e) => setKind(e.target.value as "fixed" | "free_seat")}
          >
            <option value="fixed">Monto fijo</option>
            <option value="free_seat">Un cupo gratis</option>
          </select>
          {used && <input type="hidden" name="kind" value={kind} />}
        </label>
        {kind === "fixed" && (
          <label className="text-sm font-bold">
            Descuento en RD$
            <input
              className={field}
              name="amount"
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
              defaultValue={discount?.amount}
              readOnly={used}
            />
          </label>
        )}
        <label className="text-sm font-bold">
          Máximo de usos
          <input
            className={field}
            name="max_uses"
            type="number"
            min="1"
            max="10000"
            required
            defaultValue={discount?.max_uses ?? 1}
          />
        </label>
        <label className="text-sm font-bold">
          Vence (hora de República Dominicana)
          <input
            className={field}
            name="expires_at"
            type="datetime-local"
            defaultValue={date}
          />
        </label>
        <label className="text-sm font-bold">
          Correo del ganador (opcional)
          <input
            className={field}
            name="winner_email"
            type="email"
            maxLength={180}
            defaultValue={discount?.winner_email ?? ""}
            readOnly={used}
          />
        </label>
        <label className="flex min-h-12 items-center gap-3 text-sm font-bold">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={discount?.is_active ?? true}
            className="h-5 w-5 accent-green-800"
          />
          Código activo
        </label>
        <button
          className="min-h-12 rounded-full bg-[#0f5132] px-5 font-bold text-white disabled:opacity-50"
          disabled={pending}
        >
          {pending ? "Guardando…" : "Guardar descuento"}
        </button>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-800">
          {state.success}
        </p>
      )}
    </form>
  );
}

export function ReleaseDiscountForm({
  reservationId,
}: {
  reservationId: string;
}) {
  const [state, action, pending] = useActionState(
    releaseDiscountAction,
    initial,
  );
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "¿Liberar este uso? La reserva anterior no podrá reactivarse.",
          )
        )
          event.preventDefault();
      }}
    >
      <input type="hidden" name="reservation_id" value={reservationId} />
      <button
        disabled={pending}
        className="min-h-11 rounded-full border border-[#cad9d0] px-4 text-sm font-bold"
      >
        {pending ? "Liberando…" : "Liberar uso cancelado"}
      </button>
      <p role={state.error ? "alert" : "status"} className="mt-2 text-sm">
        {state.error ?? state.success}
      </p>
    </form>
  );
}
