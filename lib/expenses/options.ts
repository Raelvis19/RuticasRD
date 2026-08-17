export const expenseCategories = [
  "transporte", "entradas", "guias", "desayuno", "almuerzo", "refrigerio",
  "permisos", "alojamiento", "camping", "reservaciones", "utensilios",
  "publicidad", "comisiones", "otros",
] as const;

export interface AdminExpense {
  id: string;
  tourId: string;
  tourTitle: string;
  concept: string;
  category: string;
  calculationType: "total" | "por_participante";
  quantity: number;
  estimatedUnitAmount: number;
  actualUnitAmount: number | null;
  estimatedAmount: number;
  actualAmount: number | null;
  recipient: string;
  paymentMethod: string | null;
  reference: string;
  expenseDate: string | null;
  notes: string;
  receiptUrl?: string;
}
