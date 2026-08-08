import ReservationConfirmation from "@/components/reservations/ReservationConfirmation";

interface ConfirmationPageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { codigo } = await params;

  return (
    <ReservationConfirmation code={codigo} />
  );
}