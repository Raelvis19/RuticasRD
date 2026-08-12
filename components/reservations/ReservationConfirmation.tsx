"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Copy,
  Home,
  MessageCircle,
  Search,
} from "lucide-react";

import {
  paymentAccounts,
  type PaymentAccount,
} from "@/data/payment-info";
import { siteContent } from "@/data/site-content";
import { formatDop } from "@/lib/format";
import { createWhatsAppUrl } from "@/lib/whatsapp";

interface StoredReservation {
  code: string;
  tourTitle: string;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
  status: string;
}

export default function ReservationConfirmation({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const storedReservation = useSyncExternalStore(
    subscribeToReservationStorage,
    getReservationSnapshot,
    getServerReservationSnapshot,
  );

  const reservation = useMemo(() => {
    if (!storedReservation) return null;

    try {
      const parsed = JSON.parse(storedReservation) as StoredReservation;
      return parsed.code === code ? parsed : null;
    } catch {
      return null;
    }
  }, [code, storedReservation]);
  const whatsappUrl = createWhatsAppUrl(
    siteContent.contact.whatsapp,
    `Hola Ruticas RD, ya realicé el pago o abono de la reservación ${code}. Adjunto mi comprobante para que puedan verificarlo.`,
  );

  async function copyCode() {
    try {
      await copyText(code);
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
            <p className="mt-2 whitespace-nowrap text-xl font-black tracking-[0.04em] text-lime-300 sm:text-3xl sm:tracking-wider">
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

          <div className="mt-6 rounded-3xl border border-[#dce5df] p-5 sm:mt-7 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f3ec] text-[#0f5132]">
                <Banknote size={22} />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0f5132]">
                  Transferencia bancaria
                </p>
                <h2 className="mt-1 text-lg font-black">Datos para realizar el pago</h2>
              </div>
            </div>

            {paymentAccounts.length > 0 ? (
              <div className="mt-5 space-y-4">
                {paymentAccounts.map((account) => (
                  <BankAccountCard key={account.accountNumber} account={account} />
                ))}
                {reservation && (
                  <div className="border-t border-[#dce5df] pt-4 text-sm">
                    <SummaryRow
                      label="Abono requerido"
                      value={formatDop(reservation.requiredDeposit)}
                      highlighted
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                Los datos bancarios están pendientes de configuración. Puedes
                solicitarlos directamente a Ruticas RD por WhatsApp.
              </p>
            )}

            <p className="mt-4 text-sm leading-6 text-[#61746b]">
              Incluye tu código <strong className="text-[#14231c]">{code}</strong>{" "}
              al enviar el comprobante para identificar el pago correctamente.
            </p>
          </div>

          <div className="mt-6 rounded-3xl bg-[#edf5f0] p-5 sm:mt-7 sm:p-6">
            <h2 className="font-black text-[#0f5132]">¿Qué sigue?</h2>
            <ol className="mt-4 space-y-4 text-sm leading-6 text-[#52675e]">
              <li><strong>1.</strong> Conserva tu código de reservación.</li>
              <li><strong>2.</strong> Realiza el pago o abono mediante transferencia.</li>
              <li>
                <strong>3.</strong> Abre WhatsApp con el botón de abajo y adjunta
                allí la captura de tu comprobante.
              </li>
              <li>
                <strong>4.</strong> El administrador verificará el pago y
                confirmará tu cupo.
              </li>
            </ol>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-center font-black text-[#07130f] transition active:scale-[0.98] sm:mt-8"
            >
              <MessageCircle size={19} />
              Enviar comprobante por WhatsApp
            </a>
          )}
          <p className="mt-3 text-center text-xs leading-5 text-[#71847a]">
            WhatsApp abrirá el mensaje preparado. Adjunta la captura antes de enviarlo.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/#consultar-reserva"
              className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full border border-[#ccd9d2] px-5 font-black transition active:scale-[0.98] active:bg-[#f4f7f5]"
            >
              <Search size={18} />
              Consultar reservación
            </Link>

            <Link
              href="/"
              className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-[#0f5132] px-5 font-black text-white transition active:scale-[0.98] active:bg-[#0b3d26]"
            >
              <Home size={18} />
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function subscribeToReservationStorage() {
  return () => undefined;
}

function getReservationSnapshot() {
  return sessionStorage.getItem("ruticas:lastReservation");
}

function getServerReservationSnapshot() {
  return null;
}

function SummaryRow({
  label,
  value,
  highlighted = false,
  nowrap = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  nowrap?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[#75877e]">{label}</span>
      <span
        className={`min-w-0 text-right font-black ${
          nowrap ? "whitespace-nowrap" : "break-words"
        } ${
          highlighted ? "text-[#0f5132]" : "text-[#14231c]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BankAccountCard({ account }: { account: PaymentAccount }) {
  const [copied, setCopied] = useState(false);

  async function copyAccountNumber() {
    try {
      await copyText(account.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-2xl bg-[#f5f8f6] p-4 text-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-[#14231c]">{account.bank}</h3>
          <p className="mt-1 text-xs font-bold text-[#71847a]">
            {account.accountType}
          </p>
        </div>
        <button
          type="button"
          onClick={copyAccountNumber}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cad8d0] bg-white px-3 text-xs font-black text-[#0f5132]"
        >
          <Copy size={15} />
          {copied ? "Cuenta copiada" : "Copiar cuenta"}
        </button>
      </div>
      <dl className="mt-4 space-y-3">
        <SummaryRow label="N.º de cuenta" value={account.accountNumber} nowrap />
        <SummaryRow label="Titular" value={account.accountHolder} />
      </dl>
    </article>
  );
}

async function copyText(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
