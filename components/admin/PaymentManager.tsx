"use client";

import { useActionState } from "react";
import { Check, FileText, Plus, X } from "lucide-react";

import {
  addPaymentAction,
  reviewPaymentAction,
  type PaymentActionState,
} from "@/app/admin/(protected)/reservaciones/payments-actions";
import { formatDop } from "@/lib/format";
import type { Payment } from "@/types/payment";

const initialState: PaymentActionState = {};

export default function PaymentManager({
  reservationId,
  payments,
  paidAmount,
  balanceAmount,
}: {
  reservationId: string;
  payments: Payment[];
  paidAmount: number;
  balanceAmount: number;
}) {
  const [state, action, pending] = useActionState(addPaymentAction, initialState);
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black">Pagos y abonos</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Amount label="Verificado" value={paidAmount} />
          <Amount label="Saldo pendiente" value={balanceAmount} />
          <Amount label="Registros" value={payments.length} count />
        </div>
      </div>

      <form action={action} className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-black"><Plus size={19} /> Registrar pago</h3>
        <input type="hidden" name="reservation_id" value={reservationId} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Monto" name="amount" type="number" required min="0.01" step="0.01" />
          <label className="block text-sm font-black text-[#294238]">Método
            <select name="method" className={fieldClass} defaultValue="transferencia">
              <option value="transferencia">Transferencia bancaria</option>
              <option value="efectivo">Efectivo</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <Input label="Referencia" name="reference" placeholder="Número de referencia" />
          <Input label="Fecha del pago" name="paid_at" type="datetime-local" defaultValue={now.toISOString().slice(0, 16)} required />
          <label className="block text-sm font-black text-[#294238] sm:col-span-2">Comprobante privado
            <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={`${fieldClass} py-3`} />
          </label>
        </div>
        {state.message && <p className={`mt-4 text-sm font-bold ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>}
        <button disabled={pending} className="mt-5 min-h-12 w-full rounded-full bg-lime-400 px-5 font-black text-[#07130f] disabled:opacity-60">
          {pending ? "Guardando..." : "Registrar como pendiente"}
        </button>
      </form>

      <div className="space-y-3">
        {payments.map((payment) => (
          <article key={payment.id} className="rounded-[1.5rem] border border-[#dce6e0] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-lg font-black">{formatDop(payment.amount)}</p><p className="text-sm text-[#667a70]">{methodLabel(payment.method)} · {formatDate(payment.paidAt)}</p></div>
              <span className={statusClass(payment.verificationStatus)}>{statusLabel(payment.verificationStatus)}</span>
            </div>
            {payment.reference && <p className="mt-3 text-sm"><span className="text-[#71847a]">Referencia:</span> <strong>{payment.reference}</strong></p>}
            {payment.receiptUrl && <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#0f5132]"><FileText size={17} /> Ver comprobante</a>}
            {payment.rejectionReason && <p className="mt-3 text-sm text-red-700">Motivo: {payment.rejectionReason}</p>}
            {payment.verificationStatus === "pendiente" && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <form action={reviewPaymentAction}>
                  <Hidden payment={payment} reservationId={reservationId} decision="verificado" />
                  <button className="min-h-11 w-full rounded-full bg-[#0f5132] px-4 text-sm font-black text-white"><Check size={16} className="mr-1 inline" /> Verificar</button>
                </form>
                <form action={reviewPaymentAction} className="flex gap-2">
                  <Hidden payment={payment} reservationId={reservationId} decision="rechazado" />
                  <input name="reason" required placeholder="Motivo" className={`${fieldClass} min-w-0 flex-1`} />
                  <button aria-label="Rechazar pago" className="h-12 w-12 shrink-0 rounded-full border border-red-200 text-red-700"><X className="mx-auto" size={18} /></button>
                </form>
              </div>
            )}
          </article>
        ))}
        {payments.length === 0 && <div className="rounded-[1.5rem] border border-dashed border-[#bdcec4] bg-white p-8 text-center text-sm text-[#71847a]">Todavía no hay pagos registrados.</div>}
      </div>
    </section>
  );
}

const fieldClass = "mt-2 min-h-12 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 outline-none focus:border-[#0f5132]";
function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="block text-sm font-black text-[#294238]">{label}<input {...props} className={fieldClass} /></label>; }
function Amount({ label, value, count }: { label: string; value: number; count?: boolean }) { return <div className="rounded-2xl bg-[#f6f9f7] p-4"><p className="text-xs font-bold text-[#71847a]">{label}</p><p className="mt-1 font-black">{count ? value : formatDop(value)}</p></div>; }
function Hidden({ payment, reservationId, decision }: { payment: Payment; reservationId: string; decision: string }) { return <><input type="hidden" name="payment_id" value={payment.id} /><input type="hidden" name="reservation_id" value={reservationId} /><input type="hidden" name="decision" value={decision} /></>; }
function methodLabel(value: string) { return value === "transferencia" ? "Transferencia" : value === "efectivo" ? "Efectivo" : "Otro"; }
function statusLabel(value: string) { return value === "verificado" ? "Verificado" : value === "rechazado" ? "Rechazado" : "Pendiente"; }
function statusClass(value: string) { return `rounded-full px-3 py-1.5 text-xs font-black ${value === "verificado" ? "bg-emerald-100 text-emerald-800" : value === "rechazado" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santo_Domingo" }).format(new Date(value)); }
