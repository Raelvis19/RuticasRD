import ReservationConfirmation from "@/components/reservations/ReservationConfirmation";
import { lookupReservationAction } from "@/app/reserva/actions";

export default async function ConfirmationPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const form = new FormData();
  form.set("reservation_code", codigo);
  const result = await lookupReservationAction({}, form);
  return <ReservationConfirmation code={codigo} summary={result.reservation ?? null} />;
}
