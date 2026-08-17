import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import type {
  PaymentStatus,
  ReservationStatus,
} from "@/lib/reservations/options";
import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/types/payment";

export interface AdminReservationListItem {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  tourTitle: string;
  tourDate: string;
  participantNames: string[];
}

export interface AdminReservationParticipant {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  city: string;
  isMinor: boolean;
  guardianName: string;
  emergencyName: string;
  emergencyPhone: string;
}

export interface AdminReservationDetail extends AdminReservationListItem {
  tourId: string;
  tourSlug: string;
  customerDocumentType: string;
  customerDocumentNumber: string;
  customerEmail: string;
  customerCity: string;
  pricePerPerson: number;
  depositPerPerson: number;
  customerNotes: string;
  adminNotes: string;
  updatedAt: string;
  participants: AdminReservationParticipant[];
  payments: Payment[];
  paidAmount: number;
  balanceAmount: number;
}

interface ReservationTourRow {
  id: string;
  title: string;
  slug: string;
  departure_at: string;
}

interface ReservationListRow {
  id: string;
  reservation_code: string;
  customer_name: string;
  customer_phone: string;
  participant_count: number;
  total_amount: number | string;
  required_deposit: number | string;
  reservation_status: ReservationStatus;
  payment_status: PaymentStatus;
  created_at: string;
  tours: ReservationTourRow | ReservationTourRow[] | null;
  reservation_participants: Array<{
    full_name: string;
    participant_number?: number | null;
  }> | null;
  payments: Array<{
    id: string;
    amount: number | string;
    method: "transferencia" | "efectivo" | "otro";
    reference: string | null;
    receipt_path: string | null;
    verification_status: "pendiente" | "verificado" | "rechazado";
    paid_at: string;
    verified_at: string | null;
    verified_by: string | null;
    rejection_reason: string | null;
    created_at: string;
  }> | null;
}

interface ReservationDetailRow extends ReservationListRow {
  tour_id: string;
  customer_document_type: string;
  customer_document_number: string;
  customer_email: string | null;
  customer_city: string;
  price_per_person: number | string;
  deposit_per_person: number | string;
  customer_notes: string | null;
  admin_notes: string | null;
  updated_at: string;
  reservation_participants: Array<{
    id: string;
    full_name: string;
    document_type: string;
    document_number: string;
    city: string;
    is_minor: boolean;
    guardian_name: string | null;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    participant_number: number | null;
  }> | null;
}

export async function getAdminReservations(): Promise<{
  reservations: AdminReservationListItem[];
  error: boolean;
}> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, reservation_code, customer_name, customer_phone, participant_count, total_amount, required_deposit, reservation_status, payment_status, created_at, tours!inner(id, title, slug, departure_at), reservation_participants(full_name, participant_number)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return { reservations: [], error: true };

  return {
    error: false,
    reservations: ((data ?? []) as ReservationListRow[]).map(mapListRow),
  };
}

export async function getAdminReservationDetail(reservationId: string): Promise<{
  reservation: AdminReservationDetail | null;
  error: boolean;
}> {
  await requireAdmin();
  if (!isUuid(reservationId)) return { reservation: null, error: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, reservation_code, tour_id, customer_name, customer_document_type, customer_document_number, customer_phone, customer_email, customer_city, participant_count, customer_notes, admin_notes, price_per_person, deposit_per_person, total_amount, required_deposit, reservation_status, payment_status, created_at, updated_at, tours!inner(id, title, slug, departure_at), reservation_participants(id, full_name, document_type, document_number, city, is_minor, guardian_name, emergency_contact_name, emergency_contact_phone, participant_number), payments(id, amount, method, reference, receipt_path, verification_status, paid_at, verified_at, verified_by, rejection_reason, created_at)",
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (error) return { reservation: null, error: true };
  if (!data) return { reservation: null, error: false };

  const row = data as ReservationDetailRow;
  const list = mapListRow(row);
  const tour = getTour(row.tours);
  const paymentRows = [...(row.payments ?? [])].sort(
    (first, second) =>
      new Date(second.paid_at).getTime() - new Date(first.paid_at).getTime(),
  );
  const paidAmount = paymentRows
    .filter((payment) => payment.verification_status === "verificado")
    .reduce((total, payment) => total + Number(payment.amount), 0);
  const payments = await Promise.all(
    paymentRows.map(async (payment): Promise<Payment> => {
      let receiptUrl: string | undefined;
      if (payment.receipt_path) {
        const { data: signed } = await supabase.storage
          .from("payment-receipts")
          .createSignedUrl(payment.receipt_path, 600);
        receiptUrl = signed?.signedUrl;
      }
      return {
        id: payment.id,
        reservationId: row.id,
        amount: Number(payment.amount),
        method: payment.method,
        reference: payment.reference ?? undefined,
        receiptUrl,
        verificationStatus: payment.verification_status,
        paidAt: payment.paid_at,
        verifiedAt: payment.verified_at ?? undefined,
        verifiedBy: payment.verified_by ?? undefined,
        createdAt: payment.created_at,
        rejectionReason: payment.rejection_reason ?? undefined,
      };
    }),
  );

  return {
    error: false,
    reservation: {
      ...list,
      tourId: row.tour_id,
      tourSlug: tour?.slug ?? "",
      customerDocumentType: row.customer_document_type,
      customerDocumentNumber: row.customer_document_number,
      customerEmail: row.customer_email ?? "",
      customerCity: row.customer_city,
      pricePerPerson: Number(row.price_per_person),
      depositPerPerson: Number(row.deposit_per_person),
      customerNotes: row.customer_notes ?? "",
      adminNotes: row.admin_notes ?? "",
      updatedAt: row.updated_at,
      payments,
      paidAmount,
      balanceAmount: Math.max(0, Number(row.total_amount) - paidAmount),
      participants: [...(row.reservation_participants ?? [])]
        .sort(
          (first, second) =>
            (first.participant_number ?? Number.MAX_SAFE_INTEGER) -
            (second.participant_number ?? Number.MAX_SAFE_INTEGER),
        )
        .map((participant) => ({
        id: participant.id,
        fullName: participant.full_name,
        documentType: participant.document_type,
        documentNumber: participant.document_number,
        city: participant.city,
        isMinor: participant.is_minor,
        guardianName: participant.guardian_name ?? "",
        emergencyName: participant.emergency_contact_name,
        emergencyPhone: participant.emergency_contact_phone,
        })),
    },
  };
}

function mapListRow(row: ReservationListRow): AdminReservationListItem {
  const tour = getTour(row.tours);
  return {
    id: row.id,
    code: row.reservation_code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    participantCount: row.participant_count,
    totalAmount: Number(row.total_amount),
    requiredDeposit: Number(row.required_deposit),
    reservationStatus: row.reservation_status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    tourTitle: tour?.title ?? "Tour no disponible",
    tourDate: tour?.departure_at ?? "",
    participantNames: (row.reservation_participants ?? []).map(
      (participant) => participant.full_name,
    ),
  };
}

function getTour(value: ReservationListRow["tours"]) {
  return Array.isArray(value) ? value[0] : value;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
