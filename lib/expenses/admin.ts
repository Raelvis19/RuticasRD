import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { AdminExpense } from "@/lib/expenses/options";

interface Row {
  id: string; tour_id: string; concept: string; category: string;
  calculation_type: "total" | "por_participante"; quantity: number | string;
  estimated_unit_amount: number | string; actual_unit_amount: number | string | null;
  estimated_amount: number | string; actual_amount: number | string | null;
  recipient: string; payment_method: string | null; reference: string | null;
  expense_date: string | null; notes: string | null; receipt_path: string | null;
  tours: { title: string } | Array<{ title: string }> | null;
}

export async function getAdminExpenses() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data, error }, { data: tours }] = await Promise.all([
    supabase.from("expenses").select("id, tour_id, concept, category, calculation_type, quantity, estimated_unit_amount, actual_unit_amount, estimated_amount, actual_amount, recipient, payment_method, reference, expense_date, notes, receipt_path, tours!inner(title)").order("created_at", { ascending: false }),
    supabase.from("tours").select("id, title, departure_at").order("departure_at", { ascending: false }),
  ]);
  if (error) return { expenses: [] as AdminExpense[], tours: tours ?? [], error: true };
  const expenses = await Promise.all(((data ?? []) as Row[]).map(async (row) => {
    let receiptUrl: string | undefined;
    if (row.receipt_path) {
      const { data: signed } = await supabase.storage.from("expense-receipts").createSignedUrl(row.receipt_path, 600);
      receiptUrl = signed?.signedUrl;
    }
    const tour = Array.isArray(row.tours) ? row.tours[0] : row.tours;
    return {
      id: row.id, tourId: row.tour_id, tourTitle: tour?.title ?? "Tour",
      concept: row.concept, category: row.category, calculationType: row.calculation_type,
      quantity: Number(row.quantity), estimatedUnitAmount: Number(row.estimated_unit_amount),
      actualUnitAmount: row.actual_unit_amount === null ? null : Number(row.actual_unit_amount),
      estimatedAmount: Number(row.estimated_amount), actualAmount: row.actual_amount === null ? null : Number(row.actual_amount),
      recipient: row.recipient, paymentMethod: row.payment_method, reference: row.reference ?? "",
      expenseDate: row.expense_date, notes: row.notes ?? "", receiptUrl,
    } satisfies AdminExpense;
  }));
  return { expenses, tours: tours ?? [], error: false };
}
