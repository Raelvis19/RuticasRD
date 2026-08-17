"use client";

import { Printer } from "lucide-react";

export default function PrintAttendanceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0f5132] px-6 font-black text-white print:hidden"
    >
      <Printer size={19} />
      Imprimir o guardar PDF
    </button>
  );
}
