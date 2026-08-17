import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

interface TourRow {
  id: string;
  title: string;
  departure_at: string;
  capacity: number;
  price: number | string;
  status: string;
}

interface ReservationRow {
  id: string;
  tour_id: string;
  participant_count: number;
  total_amount: number | string;
  reservation_status: string;
  created_at: string;
}

interface PaymentRow {
  reservation_id: string;
  amount: number | string;
  verification_status: string;
}

interface ExpenseRow {
  tour_id: string;
  estimated_amount: number | string;
  actual_amount: number | string | null;
}

export interface DashboardTour {
  id: string;
  title: string;
  departureAt: string;
  capacity: number;
  occupied: number;
  available: number;
  expectedRevenue: number;
  collected: number;
  outstanding: number;
  estimatedExpenses: number;
  actualExpenses: number;
  projectedProfit: number;
  actualProfit: number;
}

export interface AdminDashboardData {
  expectedRevenue: number;
  collected: number;
  outstanding: number;
  estimatedExpenses: number;
  actualExpenses: number;
  projectedProfit: number;
  actualProfit: number;
  pendingReservations: number;
  pendingPayments: number;
  reservationsWithBalance: number;
  newReservationsToday: number;
  nextTour: DashboardTour | null;
  upcomingTours: DashboardTour[];
  error: boolean;
}

const capacityStatuses = new Set(["confirmada", "completada"]);
const expectedStatuses = new Set([
  "pendiente_verificacion",
  "confirmada",
  "completada",
]);

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  await requireAdmin();
  const supabase = await createClient();
  const [tourResult, reservationResult, paymentResult, expenseResult] =
    await Promise.all([
      supabase
        .from("tours")
        .select("id, title, departure_at, capacity, price, status")
        .order("departure_at", { ascending: true }),
      supabase
        .from("reservations")
        .select(
          "id, tour_id, participant_count, total_amount, reservation_status, created_at",
        ),
      supabase
        .from("payments")
        .select("reservation_id, amount, verification_status"),
      supabase
        .from("expenses")
        .select("tour_id, estimated_amount, actual_amount"),
    ]);

  if (
    tourResult.error ||
    reservationResult.error ||
    paymentResult.error ||
    expenseResult.error
  ) {
    return emptyDashboard(true);
  }

  const tours = (tourResult.data ?? []) as TourRow[];
  const reservations = (reservationResult.data ?? []) as ReservationRow[];
  const payments = (paymentResult.data ?? []) as PaymentRow[];
  const expenses = (expenseResult.data ?? []) as ExpenseRow[];
  const verifiedByReservation = new Map<string, number>();

  for (const payment of payments) {
    if (payment.verification_status !== "verificado") continue;
    verifiedByReservation.set(
      payment.reservation_id,
      (verifiedByReservation.get(payment.reservation_id) ?? 0) +
        Number(payment.amount),
    );
  }

  const mappedTours = tours.map((tour) =>
    mapTour(tour, reservations, expenses, verifiedByReservation),
  );
  const now = new Date();
  const upcomingTours = mappedTours
    .filter((tour) => {
      const status = tours.find((item) => item.id === tour.id)?.status;
      return (
        status === "publicado" && new Date(tour.departureAt).getTime() >= now.getTime()
      );
    })
    .slice(0, 6);
  const activeReservations = reservations.filter((reservation) =>
    expectedStatuses.has(reservation.reservation_status),
  );
  const confirmedReservations = reservations.filter((reservation) =>
    capacityStatuses.has(reservation.reservation_status),
  );
  const today = dominicanDateKey(now);

  return {
    expectedRevenue: sum(activeReservations, (item) => Number(item.total_amount)),
    collected: sum(
      [...verifiedByReservation.values()],
      (amount) => amount,
    ),
    outstanding: sum(confirmedReservations, (item) =>
      Math.max(
        0,
        Number(item.total_amount) - (verifiedByReservation.get(item.id) ?? 0),
      ),
    ),
    estimatedExpenses: sum(expenses, (item) => Number(item.estimated_amount)),
    actualExpenses: sum(expenses, (item) => Number(item.actual_amount ?? 0)),
    projectedProfit:
      sum(activeReservations, (item) => Number(item.total_amount)) -
      sum(expenses, (item) => Number(item.estimated_amount)),
    actualProfit:
      sum([...verifiedByReservation.values()], (amount) => amount) -
      sum(expenses, (item) => Number(item.actual_amount ?? 0)),
    pendingReservations: reservations.filter(
      (item) => item.reservation_status === "pendiente_verificacion",
    ).length,
    pendingPayments: payments.filter(
      (item) => item.verification_status === "pendiente",
    ).length,
    reservationsWithBalance: confirmedReservations.filter(
      (item) =>
        (verifiedByReservation.get(item.id) ?? 0) < Number(item.total_amount),
    ).length,
    newReservationsToday: reservations.filter(
      (item) => dominicanDateKey(new Date(item.created_at)) === today,
    ).length,
    nextTour: upcomingTours[0] ?? null,
    upcomingTours,
    error: false,
  };
}

function mapTour(
  tour: TourRow,
  reservations: ReservationRow[],
  expenses: ExpenseRow[],
  verified: Map<string, number>,
): DashboardTour {
  const tourReservations = reservations.filter((item) => item.tour_id === tour.id);
  const active = tourReservations.filter((item) =>
    expectedStatuses.has(item.reservation_status),
  );
  const confirmed = tourReservations.filter((item) =>
    capacityStatuses.has(item.reservation_status),
  );
  const tourExpenses = expenses.filter((item) => item.tour_id === tour.id);
  const occupied = sum(confirmed, (item) => item.participant_count);
  const expectedRevenue = sum(active, (item) => Number(item.total_amount));
  const collected = sum(tourReservations, (item) => verified.get(item.id) ?? 0);
  const outstanding = sum(confirmed, (item) =>
    Math.max(0, Number(item.total_amount) - (verified.get(item.id) ?? 0)),
  );
  const estimatedExpenses = sum(tourExpenses, (item) => Number(item.estimated_amount));
  const actualExpenses = sum(tourExpenses, (item) => Number(item.actual_amount ?? 0));

  return {
    id: tour.id,
    title: tour.title,
    departureAt: tour.departure_at,
    capacity: tour.capacity,
    occupied,
    available: Math.max(0, tour.capacity - occupied),
    expectedRevenue,
    collected,
    outstanding,
    estimatedExpenses,
    actualExpenses,
    projectedProfit: expectedRevenue - estimatedExpenses,
    actualProfit: collected - actualExpenses,
  };
}

function sum<T>(items: T[], value: (item: T) => number) {
  return items.reduce((total, item) => total + value(item), 0);
}

function dominicanDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function emptyDashboard(error: boolean): AdminDashboardData {
  return {
    expectedRevenue: 0,
    collected: 0,
    outstanding: 0,
    estimatedExpenses: 0,
    actualExpenses: 0,
    projectedProfit: 0,
    actualProfit: 0,
    pendingReservations: 0,
    pendingPayments: 0,
    reservationsWithBalance: 0,
    newReservationsToday: 0,
    nextTour: null,
    upcomingTours: [],
    error,
  };
}
