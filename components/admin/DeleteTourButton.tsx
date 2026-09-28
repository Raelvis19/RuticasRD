"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";

import {
  deleteTourAction,
  type DeleteTourState,
} from "@/app/admin/(protected)/tours/actions";

interface RelatedData {
  reservations: number;
  payments: number;
  expenses: number;
  images: number;
  waitlistEntries: number;
}

interface DeleteTourButtonProps {
  tourId: string;
  tourTitle: string;
  relatedData: RelatedData;
}

const initialState: DeleteTourState = {};

export default function DeleteTourButton({
  tourId,
  tourTitle,
  relatedData,
}: DeleteTourButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, pending] = useActionState(
    deleteTourAction,
    initialState,
  );
  const relatedItems: Array<[number, string]> = [
    [relatedData.reservations, "reservas"],
    [relatedData.payments, "pagos"],
    [relatedData.expenses, "gastos"],
    [relatedData.images, "imágenes"],
    [relatedData.waitlistEntries, "personas en lista de espera"],
  ];
  const affectedItems = relatedItems.filter(([count]) => count > 0);

  function close() {
    if (pending) return;
    setOpen(false);
    setConfirmation("");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 text-sm font-black text-red-700 transition active:scale-[0.98] sm:hover:bg-red-50"
      >
        <Trash2 size={17} aria-hidden="true" />
        Eliminar tour
      </button>

      {open && (
        <form
          action={formAction}
          className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"
        >
          <input type="hidden" name="tour_id" value={tourId} />
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-700"
              aria-hidden="true"
            />
            <div>
              <p className="font-black">Eliminar “{tourTitle}”</p>
              <p className="mt-1 leading-6 text-red-800">
                Esta acción es permanente. Eliminará el tour y todos sus datos
                relacionados para que no sigan afectando el dashboard.
              </p>
              {affectedItems.length > 0 && (
                <p className="mt-2 leading-6 text-red-800">
                  Se quitarán: {formatAffectedItems(affectedItems)}.
                </p>
              )}
            </div>
          </div>

          <label className="mt-4 block font-black text-red-950">
            Para confirmar, escribe exactamente: <span className="select-all">{tourTitle}</span>
            <input
              name="confirmation_title"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
              className="mt-2 min-h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-[#14231c] outline-none focus:border-red-500 disabled:opacity-60"
            />
          </label>

          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              className={`mt-3 font-bold ${
                state.success ? "text-emerald-800" : "text-red-700"
              }`}
            >
              {state.message}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 font-black text-red-800 disabled:opacity-60"
            >
              <X size={17} aria-hidden="true" />
              Cancelar
            </button>
            <button
              disabled={pending || confirmation !== tourTitle}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 size={17} aria-hidden="true" />
              )}
              Eliminar todo
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function formatAffectedItems(items: Array<[number, string]>) {
  const values = items.map(([count, label]) => `${count} ${label}`);
  if (values.length <= 1) return values[0] ?? "datos relacionados";
  return `${values.slice(0, -1).join(", ")} y ${values.at(-1)}`;
}
