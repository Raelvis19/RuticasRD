import type { PaymentMethod } from "@/types/reservation";

export type PaymentVerificationStatus =
  | "pendiente"
  | "verificado"
  | "rechazado";

export interface Payment {
  id: string;
  reservationId: string;

  amount: number;
  method: PaymentMethod;

  reference?: string;
  receiptUrl?: string;

  verificationStatus: PaymentVerificationStatus;

  paidAt: string;
  verifiedAt?: string;
  verifiedBy?: string;

  createdAt: string;
  rejectionReason?: string;
}
