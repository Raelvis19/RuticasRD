"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Home, MessageCircle } from "lucide-react";

import { formatDop } from "@/lib/format";

interface StoredReservation {
  code: string;
  tourTitle: string;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
  status: string;
}

export default function ReservationConfirmation({ code }: { code: string }) {
  const [reservation, setReservation] = useState<StoredReservation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("ruticas:lastReservation");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as StoredReservation;
      if (parsed.code === code) setReservation(parsed);
    } catch {
      setReservation(null);
    }
  }, [code]);

  async function copyCode() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07130f] px-4 pb-20 nav-offset text-white sm:px-6">
      <section className="mx-auto max-w-2xl">
        <div className="rounded-[1.5rem] bg-white p-5 text-[#14231c] shadow-2xl sm:rounded-[2rem] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f3ec] text-[#0f5132] sm:h-20 sm:w-20">
            <CheckCircle2 size={38} />
          </div>

          <div className="mt-6 text-center sm:mt-7">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-[#0f5132] sm:text-sm">
              Solicitud recibida
            </p>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl">
              ¡Tu aventura está en camino!
            </h1>
            <p className="mt-4 leading-7 text-[#61746b]">
              Hemos registrado tu solicitud. Recuerda que el cupo será
              confirmado después de verificar el pago o abono.
            </p>
          </div>

          <div className="mt-7 rounded-3xl bg-[#07130f] p-5 text-center text-white sm:mt-8 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Código de reservación
            </p>
            <p className="mt-2 break-all text-2xl font-black tracking-wider text-lime-300 sm:text-3xl">
              {code}
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="mt-4 inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-white/75 transition active:bg-white/10 active:text-white sm:hover:text-white"
            >
              <Copy size={17} />
              {copied ? "Código copiado" : "Copiar código"}
            </button>
          </div>

          {reservation && (
            <div className="mt-6 rounded-3xl border border-[#dce5df] p-5 sm:mt-7 sm:p-6">
              <h2 className="text-lg font-black">Resumen</h2>
              <div className="mt-5 space-y-4 text-sm">
                <SummaryRow label="Tour" value={reservation.tourTitle} />
                <SummaryRow
                  label="Participantes"
                  value={String(reservation.participantCount)}
                />
                <SummaryRow label="Total" value={formatDop(reservation.totalAmount)} />
                <SummaryRow
                  label="Abono requerido"
                  value={formatDop(reservation.requiredDeposit)}
                  highlighted
                />
                <SummaryRow label="Estado" value="Pendiente de verificación" />
              </div>
            </div>
          )}

          <div className="mt-6 rounded-3xl bg-[#edf5f0] p-5 sm:mt-7 sm:p-6">
            <h2 className="font-black text-[#0f5132]">¿Qué sigue?</h2>
            <ol className="mt-4 space-y-4 text-sm leading-6 text-[#52675e]">
              <li><strong>1.</strong> Conserva tu código de reservación.</li>
              <li><strong>2.</strong> Realiza el pago o abono correspondiente.</li>
              <li><strong>3.</strong> Envía tu comprobante a Ruticas RD.</li>
              <li>
                <strong>4.</strong> El administrador verificará el pago y
                confirmará tu cupo.
              </li>
            </ol>
          </div>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:grid-cols-2">
            <Link
              href="/"
              className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full border border-[#ccd9d2] px-5 font-black transition active:scale-[0.98] active:bg-[#f4f7f5]"
            >
              <Home size={18} />
              Ir al inicio
            </Link>

            <Link
              href="/contacto"
              className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-[#0f5132] px-5 font-black text-white transition active:scale-[0.98] active:bg-[#0b3d26]"
            >
              <MessageCircle size={18} />
              Contactar a Ruticas RD
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[#75877e]">{label}</span>
      <span
        className={`min-w-0 break-words text-right font-black ${
          highlighted ? "text-[#0f5132]" : "text-[#14231c]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
