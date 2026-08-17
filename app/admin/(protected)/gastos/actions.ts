"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { expenseCategories } from "@/lib/expenses/options";

export interface ExpenseState { message?: string; success?: boolean }
const files = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function saveExpenseAction(_state: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const admin = await requireAdmin();
  const id = text(formData, "expense_id");
  const tourId = text(formData, "tour_id");
  const concept = text(formData, "concept");
  const category = text(formData, "category");
  const calculationType = text(formData, "calculation_type");
  const quantity = calculationType === "por_participante" ? Number(text(formData, "quantity")) : 1;
  const estimatedUnit = Number(text(formData, "estimated_unit_amount"));
  const actualText = text(formData, "actual_unit_amount");
  const actualUnit = actualText ? Number(actualText) : null;
  const recipient = text(formData, "recipient");
  const method = text(formData, "payment_method");
  const receipt = formData.get("receipt");
  if (!uuid(tourId) || concept.length < 3 || !expenseCategories.includes(category as never) || !["total", "por_participante"].includes(calculationType) || !Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(estimatedUnit) || estimatedUnit < 0 || (actualUnit !== null && (!Number.isFinite(actualUnit) || actualUnit < 0)) || !recipient) {
    return { message: "Revisa el tour, concepto, proveedor y los importes." };
  }
  const supabase = await createClient();
  let receiptPath: string | undefined;
  if (receipt instanceof File && receipt.size > 0) {
    if (!files.has(receipt.type) || receipt.size > 8 * 1024 * 1024) return { message: "El comprobante debe ser una imagen o PDF menor de 8 MB." };
    receiptPath = `${tourId}/${crypto.randomUUID()}.${receipt.name.split(".").pop()?.toLowerCase() || "bin"}`;
    const { error } = await supabase.storage.from("expense-receipts").upload(receiptPath, receipt, { contentType: receipt.type });
    if (error) return { message: "No se pudo guardar el comprobante." };
  }
  const payload = {
    tour_id: tourId, concept, category, calculation_type: calculationType, quantity,
    estimated_unit_amount: estimatedUnit, actual_unit_amount: actualUnit,
    estimated_amount: estimatedUnit * quantity, actual_amount: actualUnit === null ? null : actualUnit * quantity,
    recipient, payment_method: method || null, reference: text(formData, "reference") || null,
    expense_date: text(formData, "expense_date") || null, notes: text(formData, "notes") || null,
    ...(receiptPath ? { receipt_path: receiptPath } : {}), created_by: admin.id,
  };
  const query = id && uuid(id) ? supabase.from("expenses").update(payload).eq("id", id) : supabase.from("expenses").insert(payload);
  const { error } = await query;
  if (error) { if (receiptPath) await supabase.storage.from("expense-receipts").remove([receiptPath]); return { message: "No se pudo guardar el gasto." }; }
  revalidatePath("/admin/gastos");
  return { success: true, message: id ? "Gasto actualizado." : "Gasto registrado." };
}

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "expense_id");
  if (!uuid(id)) return;
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("receipt_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (!error && data?.receipt_path) await supabase.storage.from("expense-receipts").remove([data.receipt_path]);
  revalidatePath("/admin/gastos");
}
function text(data: FormData, name: string) { return String(data.get(name) ?? "").trim(); }
function uuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value); }
