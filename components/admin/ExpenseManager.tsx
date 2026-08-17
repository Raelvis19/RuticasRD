"use client";

import { useActionState, useState } from "react";
import { FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteExpenseAction, saveExpenseAction, type ExpenseState } from "@/app/admin/(protected)/gastos/actions";
import { expenseCategories, type AdminExpense } from "@/lib/expenses/options";
import { formatDop } from "@/lib/format";

const labels: Record<string, string> = { transporte: "Transporte", entradas: "Entradas", guias: "Guías", desayuno: "Desayuno", almuerzo: "Almuerzo", refrigerio: "Refrigerio", permisos: "Medio ambiente / permisos", alojamiento: "Alojamiento", camping: "Camping", reservaciones: "Reservaciones", utensilios: "Utensilios e insumos", publicidad: "Publicidad", comisiones: "Comisiones", otros: "Otros" };
const initial: ExpenseState = {};

export default function ExpenseManager({ expenses, tours }: { expenses: AdminExpense[]; tours: Array<{ id: string; title: string }> }) {
  const [editing, setEditing] = useState<AdminExpense | null>(null);
  const [open, setOpen] = useState(expenses.length === 0);
  const [state, action, pending] = useActionState(saveExpenseAction, initial);
  const estimated = expenses.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const actual = expenses.reduce((sum, item) => sum + (item.actualAmount ?? 0), 0);
  function edit(item: AdminExpense) { setEditing(item); setOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div>
    <div className="grid grid-cols-3 gap-3"><Stat label="Registros" value={String(expenses.length)} /><Stat label="Estimado" value={formatDop(estimated)} /><Stat label="Real" value={formatDop(actual)} /></div>
    <button onClick={() => { setEditing(null); setOpen(!open); }} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0f5132] px-5 font-black text-white">{open ? <X size={18} /> : <Plus size={18} />}{open ? "Cerrar formulario" : "Registrar gasto"}</button>
    {open && <form key={editing?.id ?? "new"} action={action} className="mt-5 rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-black">{editing ? "Editar gasto" : "Nuevo gasto"}</h2>
      {editing && <input type="hidden" name="expense_id" value={editing.id} />}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select label="Tour" name="tour_id" defaultValue={editing?.tourId} required>{tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</Select>
        <Input label="Concepto" name="concept" defaultValue={editing?.concept} required />
        <Select label="Categoría" name="category" defaultValue={editing?.category}>{expenseCategories.map(c => <option key={c} value={c}>{labels[c]}</option>)}</Select>
        <Select label="Forma de cálculo" name="calculation_type" defaultValue={editing?.calculationType ?? "total"}><option value="total">Cantidad total</option><option value="por_participante">Por participante</option></Select>
        <Input label="Cantidad de participantes" name="quantity" type="number" min="1" step="1" defaultValue={editing?.quantity ?? 1} required />
        <Input label="Estimado unitario/total" name="estimated_unit_amount" type="number" min="0" step="0.01" defaultValue={editing?.estimatedUnitAmount} required />
        <Input label="Real unitario/total" name="actual_unit_amount" type="number" min="0" step="0.01" defaultValue={editing?.actualUnitAmount ?? ""} />
        <Input label="Proveedor o receptor" name="recipient" defaultValue={editing?.recipient} required />
        <Select label="Método de pago" name="payment_method" defaultValue={editing?.paymentMethod ?? ""}><option value="">Pendiente</option><option value="transferencia">Transferencia</option><option value="efectivo">Efectivo</option><option value="otro">Otro</option></Select>
        <Input label="Referencia" name="reference" defaultValue={editing?.reference} />
        <Input label="Fecha del gasto" name="expense_date" type="date" defaultValue={editing?.expenseDate ?? ""} />
        <label className="text-sm font-black text-[#294238]">Comprobante privado<input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={`${field} py-3`} /></label>
        <label className="text-sm font-black text-[#294238] sm:col-span-2 lg:col-span-3">Notas<textarea name="notes" defaultValue={editing?.notes} rows={3} className={`${field} py-3`} /></label>
      </div>
      {state.message && <p className={`mt-4 text-sm font-bold ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>}
      <button disabled={pending} className="mt-5 min-h-12 rounded-full bg-lime-400 px-6 font-black text-[#07130f] disabled:opacity-60">{pending ? "Guardando..." : "Guardar gasto"}</button>
    </form>}
    <div className="mt-6 grid gap-4 xl:grid-cols-2">{expenses.map(item => <article key={item.id} className="rounded-[1.5rem] border border-[#dce6e0] bg-white p-5 shadow-sm">
      <div className="flex justify-between gap-3"><div><span className="rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-black text-[#0f5132]">{labels[item.category] ?? item.category}</span><h2 className="mt-3 text-lg font-black">{item.concept}</h2><p className="text-sm text-[#667a70]">{item.tourTitle}</p></div><div className="text-right"><p className="text-xs text-[#71847a]">Real</p><p className="font-black">{item.actualAmount === null ? "Pendiente" : formatDop(item.actualAmount)}</p></div></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Info label="Estimado" value={formatDop(item.estimatedAmount)} /><Info label="Proveedor" value={item.recipient} /><Info label="Cálculo" value={item.calculationType === "total" ? "Total" : `${item.quantity} participantes`} /><Info label="Método" value={item.paymentMethod ?? "Pendiente"} /></div>
      {item.receiptUrl && <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#0f5132]"><FileText size={17} /> Ver comprobante</a>}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#e3ebe6] pt-4"><button onClick={() => edit(item)} className="min-h-11 rounded-full border border-[#cad9d0] text-sm font-black text-[#0f5132]"><Pencil size={16} className="mr-1 inline" /> Editar</button><form action={deleteExpenseAction}><input type="hidden" name="expense_id" value={item.id} /><button className="min-h-11 w-full rounded-full border border-red-200 text-sm font-black text-red-700"><Trash2 size={16} className="mr-1 inline" /> Eliminar</button></form></div>
    </article>)}</div>
  </div>;
}
const field = "mt-2 min-h-12 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 outline-none focus:border-[#0f5132]";
function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="text-sm font-black text-[#294238]">{label}<input {...props} className={field} /></label>; }
function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) { return <label className="text-sm font-black text-[#294238]">{label}<select {...props} className={field}>{children}</select></label>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-[#dce6e0] bg-white p-4 shadow-sm"><p className="text-xs font-bold text-[#71847a]">{label}</p><p className="mt-1 text-lg font-black sm:text-2xl">{value}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-[#71847a]">{label}</p><p className="mt-1 font-bold capitalize">{value}</p></div>; }
