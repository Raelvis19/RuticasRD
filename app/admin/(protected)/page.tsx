import Link from "next/link";
import {
  AlertCircle, ArrowRight, CalendarDays, CircleDollarSign,
  ClipboardCheck, Clock3, ReceiptText, TrendingUp, UsersRound,
  WalletCards, type LucideIcon,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getAdminDashboard, type DashboardTour } from "@/lib/dashboard/admin";
import { formatDop } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [admin, dashboard] = await Promise.all([requireAdmin(), getAdminDashboard()]);
  return <div className="pb-10">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">Dashboard</p>
    <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Hola, {admin.fullName}</h1>
    <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">Estado operativo y financiero de Ruticas RD con datos confirmados.</p>

    {dashboard.error ? <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700"><AlertCircle size={20} className="mt-0.5 shrink-0" />No pudimos construir el dashboard. Confirma que las migraciones de pagos y gastos estén ejecutadas en Supabase.</div> : <>
      {dashboard.nextTour ? <NextTour tour={dashboard.nextTour} /> : <section className="mt-7 rounded-[2rem] bg-[#07130f] p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">Próximo tour</p><h2 className="mt-3 text-2xl font-black">No hay excursiones próximas publicadas</h2><Link href="/admin/tours/nuevo" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-lime-400 px-5 font-black text-[#07130f]">Crear un tour <ArrowRight size={17} /></Link></section>}

      <section className="mt-6"><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={CircleDollarSign} label="Ingreso esperado" value={formatDop(dashboard.expectedRevenue)} />
        <Metric icon={WalletCards} label="Cobrado y verificado" value={formatDop(dashboard.collected)} positive />
        <Metric icon={Clock3} label="Saldo por cobrar" value={formatDop(dashboard.outstanding)} warning />
        <Metric icon={ReceiptText} label="Gastos reales" value={formatDop(dashboard.actualExpenses)} />
        <Metric icon={ReceiptText} label="Gastos estimados" value={formatDop(dashboard.estimatedExpenses)} />
        <Metric icon={TrendingUp} label="Ganancia proyectada" value={formatDop(dashboard.projectedProfit)} positive={dashboard.projectedProfit >= 0} />
        <Metric icon={TrendingUp} label="Ganancia real" value={formatDop(dashboard.actualProfit)} positive={dashboard.actualProfit >= 0} />
      </div></section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div><h2 className="text-xl font-black">Acciones pendientes</h2><div className="mt-4 space-y-3">
          <ActionCard icon={ClipboardCheck} label="Reservas sin confirmar" value={dashboard.pendingReservations} tone="amber" />
          <ActionCard icon={WalletCards} label="Pagos por verificar" value={dashboard.pendingPayments} tone="red" />
          <ActionCard icon={CircleDollarSign} label="Reservas con saldo pendiente" value={dashboard.reservationsWithBalance} tone="blue" />
          <ActionCard icon={UsersRound} label="Nuevas reservas de hoy" value={dashboard.newReservationsToday} tone="green" />
        </div></div>
        <div><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-black">Tours próximos</h2><p className="mt-1 text-sm text-[#71847a]">Capacidad y resultado por excursión.</p></div><Link href="/admin/tours" className="text-sm font-black text-[#0f5132]">Ver todos</Link></div><div className="mt-4 space-y-3">{dashboard.upcomingTours.map((tour) => <UpcomingTour key={tour.id} tour={tour} />)}</div></div>
      </section>
    </>}
  </div>;
}

function NextTour({ tour }: { tour: DashboardTour }) {
  const percent = Math.min(100, Math.round((tour.occupied / tour.capacity) * 100));
  return <section className="mt-7 overflow-hidden rounded-[2rem] bg-[#07130f] p-6 text-white shadow-xl shadow-[#07130f]/10 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">Próximo tour</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">{tour.title}</h2><p className="mt-2 flex items-center gap-2 text-sm text-white/65"><CalendarDays size={17} /> {formatDate(tour.departureAt)}</p></div><Link href={`/admin/tours/${tour.id}/editar`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime-400 px-5 font-black text-[#07130f]">Administrar tour <ArrowRight size={17} /></Link></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><DarkMetric label="Participantes" value={`${tour.occupied} / ${tour.capacity}`} /><DarkMetric label="Cobrado" value={formatDop(tour.collected)} /><DarkMetric label="Pendiente" value={formatDop(tour.outstanding)} /><DarkMetric label="Ganancia proyectada" value={formatDop(tour.projectedProfit)} /></div><div className="mt-6"><div className="flex justify-between text-xs font-bold text-white/60"><span>Ocupación</span><span>{tour.available} disponibles</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime-400" style={{ width: `${percent}%` }} /></div></div></section>;
}

function Metric({ icon: Icon, label, value, positive, warning }: { icon: LucideIcon; label: string; value: string; positive?: boolean; warning?: boolean }) { return <article className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${warning ? "border-amber-200 bg-amber-50" : positive ? "border-emerald-200 bg-emerald-50" : "border-[#dce6e0] bg-white"}`}><Icon size={20} className={warning ? "text-amber-700" : positive ? "text-emerald-700" : "text-[#0f5132]"} /><p className="mt-4 text-xs font-bold text-[#71847a]">{label}</p><p className="mt-1 text-lg font-black sm:text-2xl">{value}</p></article>; }
function DarkMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white/7 p-4"><p className="text-xs font-bold text-white/50">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>; }
const tones = { amber: "border-amber-200 bg-amber-50 text-amber-800", red: "border-red-200 bg-red-50 text-red-800", blue: "border-blue-200 bg-blue-50 text-blue-800", green: "border-emerald-200 bg-emerald-50 text-emerald-800" };
function ActionCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: keyof typeof tones }) { return <Link href="/admin/reservaciones" className={`flex min-h-18 items-center gap-4 rounded-2xl border p-4 ${tones[tone]}`}><Icon size={21} /><p className="min-w-0 flex-1 text-sm font-black">{label}</p><span className="text-2xl font-black">{value}</span><ArrowRight size={17} /></Link>; }
function UpcomingTour({ tour }: { tour: DashboardTour }) { return <Link href={`/admin/tours/${tour.id}/editar`} className="block rounded-2xl border border-[#dce6e0] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{tour.title}</h3><p className="mt-1 text-xs text-[#71847a]">{formatDate(tour.departureAt)}</p></div><span className="rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-black text-[#0f5132]">{tour.occupied}/{tour.capacity}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><Small label="Cobrado" value={formatDop(tour.collected)} /><Small label="Gastos" value={formatDop(tour.actualExpenses)} /><Small label="Ganancia" value={formatDop(tour.actualProfit)} /></div></Link>; }
function Small({ label, value }: { label: string; value: string }) { return <div><p className="text-[#71847a]">{label}</p><p className="mt-1 truncate font-black">{value}</p></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-DO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Santo_Domingo" }).format(new Date(value)); }
