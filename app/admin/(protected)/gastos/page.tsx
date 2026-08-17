import ExpenseManager from "@/components/admin/ExpenseManager";
import { getAdminExpenses } from "@/lib/expenses/admin";

export default async function AdminExpensesPage() {
  const { expenses, tours, error } = await getAdminExpenses();
  return <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">Gastos</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Gastos de excursiones</h1><p className="mt-3 max-w-2xl leading-7 text-[#667a70]">Compara lo presupuestado con el costo real de cada tour.</p>{error ? <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">No pudimos cargar los gastos. Ejecuta la migración de esta etapa en Supabase.</div> : <div className="mt-7"><ExpenseManager expenses={expenses} tours={tours as Array<{ id: string; title: string }>} /></div>}</div>;
}
