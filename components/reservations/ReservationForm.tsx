"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LoaderCircle,
  Minus,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { createReservationAction } from "@/app/reservar/actions";
import { formatDop } from "@/lib/format";
import type { Tour } from "@/types/tour";

interface ReservationFormProps {
  tour: Tour;
}

interface ParticipantForm {
  fullName: string;
  documentNumber: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
  isMinor: boolean;
  guardianName: string;
}

interface CustomerForm {
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  city: string;
}

function createParticipant(): ParticipantForm {
  return {
    fullName: "",
    documentNumber: "",
    city: "",
    emergencyName: "",
    emergencyPhone: "",
    isMinor: false,
    guardianName: "",
  };
}

export default function ReservationForm({ tour }: ReservationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [participantCount, setParticipantCount] = useState(1);
  const [customer, setCustomer] = useState<CustomerForm>({
    fullName: "",
    documentNumber: "",
    phone: "",
    email: "",
    city: "",
  });
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    createParticipant(),
  ]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedData, setConfirmedData] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(
    () => tour.price * participantCount,
    [tour.price, participantCount],
  );

  const requiredDeposit = useMemo(
    () => tour.depositAmount * participantCount,
    [tour.depositAmount, participantCount],
  );

  const reservationParticipants = useMemo(
    () =>
      participants.map((participant, index) =>
        index === 0
          ? {
              ...participant,
              fullName: customer.fullName,
              documentNumber: customer.documentNumber,
              city: customer.city,
            }
          : participant,
      ),
    [customer, participants],
  );

  function updateParticipantCount(nextCount: number) {
    const safeCount = Math.max(1, Math.min(nextCount, tour.availableSpots));

    setParticipantCount(safeCount);
    setParticipants((current) => {
      if (safeCount > current.length) {
        return [
          ...current,
          ...Array.from({ length: safeCount - current.length }, () =>
            createParticipant(),
          ),
        ];
      }

      return current.slice(0, safeCount);
    });
  }

  function updateParticipant(
    index: number,
    field: keyof ParticipantForm,
    value: string | boolean,
  ) {
    setParticipants((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index
          ? { ...participant, [field]: value }
          : participant,
      ),
    );
  }

  function validateCustomerStep() {
    if (
      !customer.fullName.trim() ||
      !customer.documentNumber.trim() ||
      !customer.phone.trim() ||
      !customer.email.trim() ||
      !customer.city.trim()
    ) {
      setError(
        "Completa los datos obligatorios de la persona responsable de la reserva.",
      );
      return false;
    }

    for (const participant of reservationParticipants) {
      if (
        !participant.fullName.trim() ||
        !participant.documentNumber.trim() ||
        !participant.city.trim() ||
        !participant.emergencyName.trim() ||
        !participant.emergencyPhone.trim()
      ) {
        setError("Completa los datos obligatorios de todos los participantes.");
        return false;
      }

      if (participant.isMinor && !participant.guardianName.trim()) {
        setError(
          "Indica el padre, madre o tutor legal de cada participante menor de edad.",
        );
        return false;
      }
    }

    setError("");
    return true;
  }

  function scrollToFormTop() {
    window.requestAnimationFrame(() => {
      document.getElementById("reservation-flow")?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  }

  function goToStep(nextStep: number) {
    if (nextStep === 3 && !validateCustomerStep()) return;

    setError("");
    setStep(nextStep);
    scrollToFormTop();
  }

  async function submitReservation() {
    if (!acceptedTerms || !confirmedData) {
      setError(
        "Debes aceptar las condiciones y confirmar que los datos son correctos.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);
    let result: Awaited<ReturnType<typeof createReservationAction>>;

    try {
      result = await createReservationAction({
        tourId: tour.id,
        customer,
        participants: reservationParticipants,
      });
    } catch {
      setIsSubmitting(false);
      setError(
        "No pudimos conectar con Supabase. Comprueba tu conexión e inténtalo nuevamente.",
      );
      return;
    }

    if (!result.code) {
      setIsSubmitting(false);
      setError(result.error ?? "No pudimos registrar la reservación.");
      return;
    }

    const storedReservation = {
      code: result.code,
      tourId: tour.id,
      tourTitle: tour.title,
      tourDate: tour.date,
      participantCount,
      customer,
      participants: reservationParticipants,
      totalAmount,
      requiredDeposit,
      emailSent: result.emailSent === true,
      status: "pendiente_verificacion",
      createdAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(
        "ruticas:lastReservation",
        JSON.stringify(storedReservation),
      );
    } catch {
      // Algunos navegadores integrados o modos privados pueden restringir storage.
      // La navegación continúa; la confirmación mostrará el código aunque no haya resumen.
    }

    router.push(`/reserva/confirmacion/${result.code}`);
  }

  return (
    <div id="reservation-flow" className="mx-auto max-w-6xl scroll-mt-28">
      <ReservationSteps currentStep={step} />

      {step > 1 && (
        <MobileReservationSummary
          tour={tour}
          participantCount={participantCount}
          totalAmount={totalAmount}
          requiredDeposit={requiredDeposit}
        />
      )}

      <div className="mt-7 grid gap-8 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {step === 1 && (
            <StepOne
              tour={tour}
              participantCount={participantCount}
              totalAmount={totalAmount}
              requiredDeposit={requiredDeposit}
              onChangeCount={updateParticipantCount}
              onNext={() => goToStep(2)}
            />
          )}

          {step === 2 && (
            <StepTwo
              customer={customer}
              participants={participants}
              error={error}
              onCustomerChange={(field, value) =>
                setCustomer((current) => ({ ...current, [field]: value }))
              }
              onParticipantChange={updateParticipant}
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}

          {step === 3 && (
            <StepThree
              tour={tour}
              customer={customer}
              participants={reservationParticipants}
              participantCount={participantCount}
              totalAmount={totalAmount}
              requiredDeposit={requiredDeposit}
              acceptedTerms={acceptedTerms}
              confirmedData={confirmedData}
              error={error}
              onAcceptedTerms={setAcceptedTerms}
              onConfirmedData={setConfirmedData}
              onBack={() => goToStep(2)}
              onSubmit={submitReservation}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        <ReservationSummary
          tour={tour}
          participantCount={participantCount}
          totalAmount={totalAmount}
          requiredDeposit={requiredDeposit}
        />
      </div>
    </div>
  );
}

function ReservationSteps({ currentStep }: { currentStep: number }) {
  const steps = ["Tu reserva", "Participantes", "Confirmación"];

  return (
    <div aria-label={`Paso ${currentStep} de 3`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f5132] sm:text-sm">
          Paso {currentStep} de 3
        </p>
        <p className="text-xs font-bold text-[#71827a] sm:hidden">
          {steps[currentStep - 1]}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
        {steps.map((label, index) => {
          const number = index + 1;
          const active = number <= currentStep;

          return (
            <div key={label}>
              <div
                className={`h-2 rounded-full ${active ? "bg-[#0f5132]" : "bg-[#dce5df]"
                  }`}
              />
              <p
                className={`mt-2 hidden text-xs font-bold sm:block ${active ? "text-[#0f5132]" : "text-[#8a9a92]"
                  }`}
              >
                {number}. {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepOne({
  tour,
  participantCount,
  totalAmount,
  requiredDeposit,
  onChangeCount,
  onNext,
}: {
  tour: Tour;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
  onChangeCount: (count: number) => void;
  onNext: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onNext();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#0f5132] sm:h-14 sm:w-14">
        <UsersRound size={26} />
      </div>

      <h1 className="mt-5 text-2xl font-black leading-tight sm:mt-6 sm:text-3xl">
        ¿Cuántas personas asistirán?
      </h1>
      <p className="mt-3 leading-7 text-[#61746b]">
        Puedes realizar una reservación individual o para varias personas.
      </p>

      <div className="relative z-10 mt-7 flex flex-col gap-5 rounded-3xl border border-[#dce5df] bg-[#f8faf9] p-5 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
        <div>
          <p className="font-black">Participantes</p>
          <p className="mt-1 text-sm text-[#74867d]">
            {tour.availableSpots} cupos disponibles
          </p>
        </div>

        <div className="relative z-20 flex items-center justify-between gap-4 min-[390px]:justify-end">
          <button
            type="button"
            onClick={() => onChangeCount(participantCount - 1)}
            disabled={participantCount <= 1}
            aria-label="Reducir cantidad de participantes"
            className="tap-target flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[#cbd8d1] bg-white text-[#14231c] shadow-sm transition active:scale-95 disabled:opacity-30"
          >
            <Minus size={21} aria-hidden="true" />
          </button>

          <span
            aria-live="polite"
            className="min-w-10 text-center text-3xl font-black tabular-nums"
          >
            {participantCount}
          </span>

          <button
            type="button"
            onClick={() => onChangeCount(participantCount + 1)}
            disabled={participantCount >= tour.availableSpots}
            aria-label="Aumentar cantidad de participantes"
            className="tap-target flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#0f5132] text-white shadow-sm transition active:scale-95 active:bg-[#0b3d26] disabled:opacity-30"
          >
            <Plus size={21} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-7 rounded-3xl bg-[#07130f] p-5 text-white sm:p-6">
        <PriceRow
          label={`${participantCount} × ${formatDop(tour.price)}`}
          value={formatDop(totalAmount)}
        />
        <div className="my-4 h-px bg-white/10" />
        <PriceRow
          label="Abono requerido para reservar"
          value={formatDop(requiredDeposit)}
          highlighted
        />
      </div>

      <button
        type="submit"
        className="relative z-20 mt-7 flex min-h-14 w-full touch-manipulation select-none items-center justify-center gap-2 rounded-full bg-lime-400 px-6 text-base font-black text-[#07130f] shadow-sm transition active:scale-[0.98] active:bg-lime-300 sm:mt-8 sm:hover:bg-lime-300"
      >
        Continuar
        <ArrowRight size={20} aria-hidden="true" />
      </button>
    </form>
  );
}

function StepTwo({
  customer,
  participants,
  error,
  onCustomerChange,
  onParticipantChange,
  onBack,
  onNext,
}: {
  customer: CustomerForm;
  participants: ParticipantForm[];
  error: string;
  onCustomerChange: (field: keyof CustomerForm, value: string) => void;
  onParticipantChange: (
    index: number,
    field: keyof ParticipantForm,
    value: string | boolean,
  ) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
      <section className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#0f5132] sm:h-12 sm:w-12">
            <UserRound size={23} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-[#0f5132]">
              Participante 1
            </p>
            <h1 className="text-xl font-black sm:text-2xl">
              Datos personales y de contacto
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:mt-7 sm:grid-cols-2">
          <Field
            name="customer-name"
            label="Nombre completo *"
            value={customer.fullName}
            autoComplete="name"
            required
            onChange={(value) => onCustomerChange("fullName", value)}
          />
          <Field
            name="customer-document"
            label="Cédula o documento *"
            value={customer.documentNumber}
            autoComplete="off"
            required
            onChange={(value) => onCustomerChange("documentNumber", value)}
          />
          <Field
            name="customer-phone"
            label="Teléfono / WhatsApp *"
            type="tel"
            inputMode="tel"
            value={customer.phone}
            autoComplete="tel"
            required
            onChange={(value) => onCustomerChange("phone", value)}
          />
          <Field
            name="customer-email"
            label="Correo electrónico *"
            type="email"
            inputMode="email"
            value={customer.email}
            autoComplete="email"
            required
            onChange={(value) => onCustomerChange("email", value)}
          />
          <Field
            name="customer-city"
            label="Ciudad de residencia *"
            value={customer.city}
            autoComplete="address-level2"
            required
            onChange={(value) => onCustomerChange("city", value)}
          />
          <Field
            name="participant-0-emergency-name"
            label="Contacto de emergencia *"
            value={participants[0].emergencyName}
            autoComplete="off"
            required
            onChange={(value) =>
              onParticipantChange(0, "emergencyName", value)
            }
          />
          <Field
            name="participant-0-emergency-phone"
            label="Teléfono de emergencia *"
            type="tel"
            inputMode="tel"
            value={participants[0].emergencyPhone}
            autoComplete="off"
            required
            onChange={(value) =>
              onParticipantChange(0, "emergencyPhone", value)
            }
          />
        </div>

        <ParticipantMinorFields
          participant={participants[0]}
          index={0}
          onParticipantChange={onParticipantChange}
        />
      </section>

      {participants.slice(1).map((participant, index) => (
        <section
          key={index + 1}
          className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8"
        >
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0f5132]">
            Participante {index + 2}
          </p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">
            Información del participante
          </h2>

          <div className="mt-6 grid gap-5 sm:mt-7 sm:grid-cols-2">
            <Field
              name={`participant-${index + 1}-name`}
              label="Nombre completo *"
              value={participant.fullName}
              autoComplete="off"
              required
              onChange={(value) =>
                onParticipantChange(index + 1, "fullName", value)
              }
            />
            <Field
              name={`participant-${index + 1}-document`}
              label="Cédula o documento *"
              value={participant.documentNumber}
              autoComplete="off"
              required
              onChange={(value) =>
                onParticipantChange(index + 1, "documentNumber", value)
              }
            />
            <Field
              name={`participant-${index + 1}-city`}
              label="Ciudad *"
              value={participant.city}
              autoComplete="off"
              required
              onChange={(value) =>
                onParticipantChange(index + 1, "city", value)
              }
            />
            <Field
              name={`participant-${index + 1}-emergency-name`}
              label="Contacto de emergencia *"
              value={participant.emergencyName}
              autoComplete="off"
              required
              onChange={(value) =>
                onParticipantChange(index + 1, "emergencyName", value)
              }
            />
            <Field
              name={`participant-${index + 1}-emergency-phone`}
              label="Teléfono de emergencia *"
              type="tel"
              inputMode="tel"
              value={participant.emergencyPhone}
              autoComplete="off"
              required
              onChange={(value) =>
                onParticipantChange(index + 1, "emergencyPhone", value)
              }
            />
          </div>

          <label className="mt-6 flex min-h-14 cursor-pointer touch-manipulation items-start gap-3 rounded-2xl bg-[#f6f9f7] p-4 active:bg-[#edf3ef]">
            <input
              type="checkbox"
              checked={participant.isMinor}
              onChange={(event) =>
                onParticipantChange(index + 1, "isMinor", event.target.checked)
              }
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#0f5132]"
            />
            <div>
              <p className="font-bold">Este participante es menor de edad</p>
              <p className="mt-1 text-sm leading-6 text-[#71827a]">
                Los menores deben asistir acompañados por su padre, madre o tutor
                legal.
              </p>
            </div>
          </label>

          {participant.isMinor && (
            <div className="mt-5">
              <Field
                name={`participant-${index + 1}-guardian`}
                label="Padre, madre o tutor legal *"
                value={participant.guardianName}
                autoComplete="off"
                required
                onChange={(value) =>
                  onParticipantChange(index + 1, "guardianName", value)
                }
              />
            </div>
          )}
        </section>
      ))}

      {error && <ErrorMessage message={error} />}
      <NavigationButtons onBack={onBack} />
    </form>
  );
}

function ParticipantMinorFields({
  participant,
  index,
  onParticipantChange,
}: {
  participant: ParticipantForm;
  index: number;
  onParticipantChange: (
    index: number,
    field: keyof ParticipantForm,
    value: string | boolean,
  ) => void;
}) {
  return (
    <>
      <label className="mt-6 flex min-h-14 cursor-pointer touch-manipulation items-start gap-3 rounded-2xl bg-[#f6f9f7] p-4 active:bg-[#edf3ef]">
        <input
          type="checkbox"
          checked={participant.isMinor}
          onChange={(event) =>
            onParticipantChange(index, "isMinor", event.target.checked)
          }
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#0f5132]"
        />
        <div>
          <p className="font-bold">Este participante es menor de edad</p>
          <p className="mt-1 text-sm leading-6 text-[#71827a]">
            Los menores deben asistir acompañados por su padre, madre o tutor
            legal.
          </p>
        </div>
      </label>

      {participant.isMinor && (
        <div className="mt-5">
          <Field
            name={`participant-${index}-guardian`}
            label="Padre, madre o tutor legal *"
            value={participant.guardianName}
            autoComplete="off"
            required
            onChange={(value) =>
              onParticipantChange(index, "guardianName", value)
            }
          />
        </div>
      )}
    </>
  );
}

function StepThree({
  tour,
  customer,
  participants,
  participantCount,
  totalAmount,
  requiredDeposit,
  acceptedTerms,
  confirmedData,
  error,
  onAcceptedTerms,
  onConfirmedData,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  tour: Tour;
  customer: CustomerForm;
  participants: ParticipantForm[];
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
  acceptedTerms: boolean;
  confirmedData: boolean;
  error: string;
  onAcceptedTerms: (value: boolean) => void;
  onConfirmedData: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#0f5132] sm:h-14 sm:w-14">
        <CheckCircle2 size={28} />
      </div>

      <h1 className="mt-5 text-2xl font-black sm:mt-6 sm:text-3xl">
        Revisa tu reservación
      </h1>
      <p className="mt-3 leading-7 text-[#61746b]">
        Confirma que toda la información esté correcta antes de enviar tu
        solicitud.
      </p>

      <div className="mt-7 space-y-4 sm:mt-8">
        <ReviewSection title="Tour">
          <ReviewRow label="Experiencia" value={tour.title} />
          <ReviewRow label="Participantes" value={String(participantCount)} />
          <ReviewRow label="Total" value={formatDop(totalAmount)} />
          <ReviewRow label="Abono requerido" value={formatDop(requiredDeposit)} />
        </ReviewSection>

        <ReviewSection title="Responsable">
          <ReviewRow label="Nombre" value={customer.fullName} />
          <ReviewRow label="WhatsApp" value={customer.phone} />
          <ReviewRow label="Ciudad" value={customer.city} />
        </ReviewSection>

        <ReviewSection title="Participantes">
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div
                key={`${participant.fullName}-${index}`}
                className="rounded-xl bg-[#f6f9f7] p-4"
              >
                <p className="break-words font-black">
                  {index + 1}. {participant.fullName}
                </p>
                <p className="mt-1 break-all text-sm text-[#6d8077]">
                  Documento: {participant.documentNumber}
                </p>
              </div>
            ))}
          </div>
        </ReviewSection>
      </div>

      <div className="mt-7 space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#dce5df] p-4">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) =>
              onAcceptedTerms(event.target.checked)
            }
            className="mt-1 h-5 w-5 shrink-0 accent-[#0f5132]"
          />

          <span className="text-sm leading-6 text-[#52675e]">
            He leído y acepto las{" "}
            <Link
              href="/politicas"
              target="_blank"
              className="font-black text-[#0f5132] underline decoration-[#0f5132]/30 underline-offset-4"
            >
              políticas y condiciones
            </Link>{" "}
            aplicables, incluyendo las condiciones de cancelación y
            los riesgos informados para esta excursión.
          </span>
        </label>
        <ConfirmationCheckbox
          checked={confirmedData}
          onChange={onConfirmedData}
          text="Confirmo que los datos proporcionados son correctos."
        />
      </div>

      <div className="mt-7 rounded-2xl bg-[#edf5f0] p-5">
        <div className="flex gap-3">
          <ShieldCheck size={22} className="shrink-0 text-[#0f5132]" />
          <p className="text-sm leading-6 text-[#50655b]">
            Enviar esta solicitud no confirma automáticamente tu cupo. La
            reservación será confirmada después de verificar el pago o abono
            correspondiente.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:mt-8 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex min-h-14 flex-1 touch-manipulation items-center justify-center gap-2 rounded-full border border-[#ccd9d2] bg-white px-5 font-black transition active:scale-[0.98] active:bg-[#f4f7f5]"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-14 flex-[1.4] touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-6 font-black text-[#07130f] transition active:scale-[0.98] active:bg-lime-300 disabled:cursor-wait disabled:opacity-65 sm:hover:bg-lime-300"
        >
          {isSubmitting ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : (
            <Check size={19} />
          )}
          {isSubmitting ? "Registrando..." : "Solicitar reservación"}
        </button>
      </div>
    </form>
  );
}

function MobileReservationSummary({
  tour,
  participantCount,
  totalAmount,
  requiredDeposit,
}: {
  tour: Tour;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#dce5df] bg-white p-4 shadow-sm lg:hidden">
      <p className="truncate text-sm font-black text-[#14231c]">{tour.title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-[#7a8b83]">Personas</p>
          <p className="mt-1 font-black">{participantCount}</p>
        </div>
        <div>
          <p className="text-[#7a8b83]">Total</p>
          <p className="mt-1 font-black">{formatDop(totalAmount)}</p>
        </div>
        <div>
          <p className="text-[#7a8b83]">Abono</p>
          <p className="mt-1 font-black text-[#0f5132]">
            {formatDop(requiredDeposit)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReservationSummary({
  tour,
  participantCount,
  totalAmount,
  requiredDeposit,
}: {
  tour: Tour;
  participantCount: number;
  totalAmount: number;
  requiredDeposit: number;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 rounded-3xl border border-[#dce5df] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0f5132]">
          Tu aventura
        </p>
        <h2 className="mt-2 text-xl font-black">{tour.title}</h2>

        <div className="mt-6 space-y-4 text-sm">
          <PriceRow label="Precio por persona" value={formatDop(tour.price)} />
          <PriceRow label="Participantes" value={String(participantCount)} />
          <div className="h-px bg-[#e5ebe7]" />
          <PriceRow label="Total" value={formatDop(totalAmount)} />
          <PriceRow
            label="Abono requerido"
            value={formatDop(requiredDeposit)}
            highlighted
          />
        </div>

        <p className="mt-6 rounded-2xl bg-[#f4f7f5] p-4 text-xs leading-5 text-[#6b7d74]">
          El monto mostrado corresponde a la cantidad de participantes
          seleccionada.
        </p>
      </div>
    </aside>
  );
}

function Field({
  name,
  label,
  value,
  type = "text",
  inputMode,
  autoComplete,
  required = false,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  type?: "text" | "tel" | "email";
  inputMode?: "text" | "tel" | "email" | "numeric";
  autoComplete?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0" htmlFor={name}>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 w-full min-w-0 rounded-2xl border border-[#d5e0da] bg-[#f9fbfa] px-4 text-base text-[#14231c] outline-none transition placeholder:text-[#8d9c95] focus:border-[#0f5132] focus:ring-2 focus:ring-[#0f5132]/10"
      />
    </label>
  );
}

function PriceRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="min-w-0 text-sm opacity-65">{label}</span>
      <span
        className={`shrink-0 text-right font-black ${highlighted ? "text-lime-400" : ""
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function NavigationButtons({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-14 flex-1 touch-manipulation items-center justify-center gap-2 rounded-full border border-[#ccd9d2] bg-white px-5 font-black transition active:scale-[0.98] active:bg-[#f4f7f5]"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <button
        type="submit"
        className="flex min-h-14 flex-[1.4] touch-manipulation items-center justify-center gap-2 rounded-full bg-[#0f5132] px-6 font-black text-white transition active:scale-[0.98] active:bg-[#0b3d26]"
      >
        Continuar
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
    >
      {message}
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#dce5df] p-4 sm:p-5">
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-[#74867d]">{label}</span>
      <span className="min-w-0 break-words text-right font-bold">{value}</span>
    </div>
  );
}

function ConfirmationCheckbox({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
}) {
  return (
    <label className="flex min-h-14 cursor-pointer touch-manipulation items-start gap-3 rounded-2xl border border-[#dce5df] p-4 active:bg-[#f6f9f7]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#0f5132]"
      />
      <span className="text-sm leading-6 text-[#52675e]">{text}</span>
    </label>
  );
}
