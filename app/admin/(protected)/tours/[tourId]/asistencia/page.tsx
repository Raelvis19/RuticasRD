import Link from "next/link";
import { ArrowLeft, AlertCircle, MapPin, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";

import PrintAttendanceButton from "@/components/admin/PrintAttendanceButton";
import { getTourAttendance } from "@/lib/attendance/admin";

export const metadata = { title: "Listado de asistencia" };

export default async function TourAttendancePage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  const { tour, participants, error } = await getTourAttendance(tourId);

  if (!tour && !error) notFound();
  if (error || !tour) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <AlertCircle className="mr-2 inline" size={20} />
        No pudimos preparar el listado de asistencia.
      </div>
    );
  }

  return (
    <div className="attendance-sheet bg-white print:text-black">
      <style>{`
        @page { size: A4 landscape; margin: 10mm; }
        @media print {
          html, body { background: white !important; }
          .attendance-sheet { width: 100%; }
          .attendance-row { break-inside: avoid; }
          .attendance-table { font-size: 8.5pt; }
        }
      `}</style>

      <div className="mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/tours"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#0f5132]"
        >
          <ArrowLeft size={18} /> Volver a tours
        </Link>
        <PrintAttendanceButton />
      </div>

      <header className="border-b-2 border-[#0f5132] pb-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
              Ruticas RD
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Listado de asistencia
            </h1>
            <h2 className="mt-2 text-lg font-bold text-[#294238]">
              {tour.title}
            </h2>
          </div>
          <div className="shrink-0 text-right text-sm">
            <p className="font-black">{formatDate(tour.departure_at)}</p>
            <p className="mt-1 text-[#52675e]">
              {tour.location}, {tour.province}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <Info icon={MapPin} label="Punto de encuentro" value={tour.meeting_point} />
          <Info icon={UsersRound} label="Participantes confirmados" value={String(participants.length)} />
          <div>
            <p className="text-xs font-bold text-[#71847a]">Responsable del listado</p>
            <div className="mt-2 h-6 border-b border-[#82938a]" />
          </div>
        </div>
      </header>

      {participants.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#bdcec4] p-10 text-center">
          <h2 className="text-xl font-black">No hay participantes confirmados</h2>
          <p className="mt-2 text-sm text-[#667a70]">
            Las reservas pendientes o sin pago confirmado no aparecen en este listado.
          </p>
        </div>
      ) : (
        <table className="attendance-table mt-5 w-full table-fixed border-collapse text-left text-xs">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[19%]" />
            <col className="w-[15%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#0f5132] text-white print:bg-[#dce6e0] print:text-black">
              <Th>#</Th><Th>Participante</Th><Th>Documento</Th><Th>Teléfono</Th>
              <Th>Ciudad</Th><Th>Contacto de emergencia</Th><Th>Notas</Th><Th>Presente</Th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={`${participant.reservationCode}-${participant.number}`} className="attendance-row border-b border-[#cddbd3] odd:bg-[#f7faf8]">
                <Td>{participant.number}</Td>
                <Td><strong>{participant.fullName}</strong><span className="mt-1 block text-[10px] text-[#71847a]">{participant.reservationCode}</span></Td>
                <Td>{participant.document}</Td><Td>{participant.phone}</Td><Td>{participant.city}</Td>
                <Td>{participant.emergencyContact}</Td><Td>{participant.notes || "-"}</Td>
                <Td><span className="mx-auto block h-5 w-5 border-2 border-[#52675e]" aria-label="Casilla de asistencia" /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer className="mt-6 flex items-end justify-between gap-5 border-t border-[#bdcec4] pt-4 text-[10px] text-[#667a70]">
        <p>Documento administrativo privado. Contiene datos personales y contactos de emergencia.</p>
        <p className="shrink-0">Generado: {formatGeneratedAt()}</p>
      </footer>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="flex items-start gap-2"><Icon size={17} className="mt-0.5 shrink-0 text-[#0f5132]" /><div><p className="text-xs font-bold text-[#71847a]">{label}</p><p className="mt-1 font-black">{value}</p></div></div>;
}
function Th({ children }: { children: React.ReactNode }) { return <th className="border border-[#8eaa9a] px-2 py-2 font-black">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="break-words border-x border-[#d5e1da] px-2 py-2 align-middle leading-4">{children}</td>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-DO", { dateStyle: "full", timeStyle: "short", timeZone: "America/Santo_Domingo" }).format(new Date(value)); }
function formatGeneratedAt() { return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santo_Domingo" }).format(new Date()); }
