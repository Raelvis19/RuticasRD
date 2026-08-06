export type ReservationStatus =
  | "pendiente_verificacion"
  | "confirmada"
  | "lista_espera"
  | "cancelada"
  | "completada";

export type PaymentStatus =
  | "sin_pago"
  | "abono"
  | "pagado"
  | "reembolso_parcial"
  | "reembolsado";

export type PaymentMethod =
  | "transferencia"
  | "efectivo"
  | "otro";

export interface EmergencyContact {
  fullName: string;
  phone: string;
  relationship?: string;
}

export interface ReservationParticipant {
  id: string;

  fullName: string;

  documentType: "cedula" | "pasaporte" | "otro";
  documentNumber: string;

  phone?: string;
  city: string;

  isMinor: boolean;
  guardianName?: string;

  emergencyContact: EmergencyContact;
}

export interface Reservation {
  id: string;
  reservationCode: string;
  tourId: string;

  customerName: string;
  customerEmail?: string;
  customerPhone: string;

  participantCount: number;
  participants: ReservationParticipant[];

  customerNotes?: string;
  adminNotes?: string;

  totalAmount: number;
  amountPaid: number;
  balanceDue: number;

  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;

  createdAt: string;
  updatedAt: string;
}