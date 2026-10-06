export interface DiscountQuote {
  originalAmount: number;
  discountAmount: number;
  totalAmount: number;
  requiredDeposit: number;
  discountCode: string | null;
  discountKind: "fixed" | "free_seat" | null;
}
