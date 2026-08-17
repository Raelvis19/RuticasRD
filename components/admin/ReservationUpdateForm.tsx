"use client";

import { useActionState, useState } from "react";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";

import {
  updateReservationAction,
  type ReservationUpdateState,
} from "@/app/admin/(protected)/reservaciones/actions";
import {
  paymentStatusLabels,
  reservationStatusOptions,
  type PaymentStatus,
  type ReservationStatus,
} from "@/lib/reservations/options";

const initialState: ReservationUpdateState = {};

export default function ReservationUpdateForm({
  reservationId,
  initialReservationStatus,
  initialPaymentStatus,
  initialAdminNotes,
}: {
  reservationId: string;
  initialReservationStatus: ReservationStatus;
  initialPaymentStatus: PaymentStatus;
  initialAdminNotes: string;
}) {
  const [state, action, pending] = useActionState(
    updateReservationAction,
    initialState,
  );
  const [reservationStatus, setReservationStatus] = useState(
    initialReservationStatus,
  );
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes);

  return (
    <form
      action={action}
      className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6"
    >
      <input type="hidden" name="reservation_id" value={reservationId} />
      <h2 className="text-xl font-black">Actualizar reservación</h2>
      <p className="mt-2 text-sm leading-6 text-[#667a70]">
        Los cupos se descuentan al confirmar una reservación con abono o pago
        verificado.
      </p>

      {state.message && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}

      <fieldset disabled={pending} className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-black text-[#294238]">
            Estado de la reservación
          </span>
          <select
            name="reservation_status"
            value={reservationStatus}
            onChange={(event) =>
              setReservationStatus(event.target.value as ReservationStatus)
            }
            className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 font-bold outline-none focus:border-[#0f5132]"
          >
            {reservationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="block">
          <span className="mb-2 block text-sm font-black text-[#294238]">
            Estado del pago
          </span>
          <input type="hidden" name="payment_status" value={initialPaymentStatus} />
          <div className="flex min-h-13 items-center rounded-2xl border border-[#d5e1da] bg-[#f1f5f2] px-4 font-bold text-[#52675e]">
            {paymentStatusLabels[initialPaymentStatus]}
          </div>
          <p className="mt-2 text-xs leading-5 text-[#71847a]">
            Se calcula automáticamente con los pagos verificados.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-[#294238]">
            Notas internas
          </span>
          <textarea
            name="admin_notes"
            rows={5}
            maxLength={3000}
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Referencia del pago, seguimiento o información importante..."
            className="w-full resize-y rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 py-3 leading-6 outline-none focus:border-[#0f5132]"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 font-black text-[#07130f] disabled:cursor-wait disabled:opacity-65"
        >
          {pending ? (
            <LoaderCircle size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </fieldset>
    </form>
  );
}
