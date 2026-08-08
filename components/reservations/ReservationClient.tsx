"use client";

import dynamic from "next/dynamic";

import type { Tour } from "@/types/tour";

const ReservationForm = dynamic(() => import("./ReservationForm"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-6xl">
      <div className="h-2 w-full animate-pulse rounded-full bg-[#dce5df]" />
      <div className="mt-7 rounded-[1.5rem] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#edf5f0]" />
        <div className="mt-5 h-8 w-3/4 animate-pulse rounded-xl bg-[#edf2ef]" />
        <div className="mt-3 h-5 w-full animate-pulse rounded-lg bg-[#f1f4f2]" />
        <div className="mt-7 h-36 animate-pulse rounded-3xl bg-[#f6f9f7]" />
        <div className="mt-7 h-14 animate-pulse rounded-full bg-lime-200" />
      </div>
    </div>
  ),
});

export default function ReservationClient({ tour }: { tour: Tour }) {
  return <ReservationForm tour={tour} />;
}
