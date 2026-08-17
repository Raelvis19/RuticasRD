import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

interface ReservationRow {
  reservation_code: string;
  customer_phone: string;
  reservation_participants: Array<{
    participant_number: number;
    full_name: string;
    document_type: string;
    document_number: string;
    phone: string | null;
    city: string;
    is_minor: boolean;
    guardian_name: string | null;
    emergency_contact_name: string;
    emergency_contact_phone: string;
  }> | null;
}

export interface AttendanceParticipant {
  number: number;
  reservationCode: string;
  fullName: string;
  document: string;
  phone: string;
  city: string;
  emergencyContact: string;
  notes: string;
}

export async function getTourAttendance(tourId: string) {
  await requireAdmin();
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(tourId)) {
    return { tour: null, participants: [], error: false };
  }
  const supabase = await createClient();
  const [{ data: tour, error: tourError }, { data, error }] = await Promise.all([
    supabase
      .from("tours")
      .select("id, title, location, province, departure_at, meeting_point")
      .eq("id", tourId)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("reservation_code, customer_phone, reservation_participants(participant_number, full_name, document_type, document_number, phone, city, is_minor, guardian_name, emergency_contact_name, emergency_contact_phone)")
      .eq("tour_id", tourId)
      .in("reservation_status", ["confirmada", "completada"])
      .order("customer_name"),
  ]);
  if (tourError || error) return { tour: null, participants: [], error: true };
  if (!tour) return { tour: null, participants: [], error: false };

  const participants = ((data ?? []) as ReservationRow[])
    .flatMap((reservation) =>
      (reservation.reservation_participants ?? []).map((participant) => ({
        reservationCode: reservation.reservation_code,
        fullName: participant.full_name,
        document: `${documentLabel(participant.document_type)} ${participant.document_number}`,
        phone: participant.phone || reservation.customer_phone,
        city: participant.city,
        emergencyContact: `${participant.emergency_contact_name} - ${participant.emergency_contact_phone}`,
        notes: participant.is_minor
          ? `Menor - Tutor: ${participant.guardian_name || "No indicado"}`
          : "",
      })),
    )
    .sort((first, second) => first.fullName.localeCompare(second.fullName, "es"))
    .map((participant, index) => ({ ...participant, number: index + 1 }));

  return { tour, participants: participants satisfies AttendanceParticipant[], error: false };
}

function documentLabel(value: string) {
  if (value === "cedula") return "Cédula";
  if (value === "pasaporte") return "Pasaporte";
  return "Documento";
}
