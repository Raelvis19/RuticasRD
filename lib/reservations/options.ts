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

export const reservationStatusOptions: ReadonlyArray<{
  value: ReservationStatus;
  label: string;
}> = [
  { value: "pendiente_verificacion", label: "Pendiente de verificación" },
  { value: "confirmada", label: "Confirmada" },
  { value: "lista_espera", label: "Lista de espera" },
  { value: "cancelada", label: "Cancelada" },
  { value: "completada", label: "Completada" },
];

export const paymentStatusOptions: ReadonlyArray<{
  value: PaymentStatus;
  label: string;
}> = [
  { value: "sin_pago", label: "Sin pago" },
  { value: "abono", label: "Abono verificado" },
  { value: "pagado", label: "Pagado completo" },
  { value: "reembolso_parcial", label: "Reembolso parcial" },
  { value: "reembolsado", label: "Reembolsado" },
];

export const reservationStatusLabels = Object.fromEntries(
  reservationStatusOptions.map((option) => [option.value, option.label]),
) as Record<ReservationStatus, string>;

export const paymentStatusLabels = Object.fromEntries(
  paymentStatusOptions.map((option) => [option.value, option.label]),
) as Record<PaymentStatus, string>;
