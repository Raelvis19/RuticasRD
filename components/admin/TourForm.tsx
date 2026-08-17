"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Save,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  createTourAction,
  updateTourAction,
  type TourFormState,
} from "@/app/admin/(protected)/tours/actions";
import {
  createDefaultTourFormValues,
  type TourFormValues,
} from "@/lib/tours/form";
import {
  tourCategoryOptions,
  tourDifficultyOptions,
  tourManagementStatusOptions,
  tourStatusOptions,
} from "@/lib/tours/options";

const initialState: TourFormState = {};
const inputClassName =
  "min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 py-3 text-base text-[#14231c] outline-none transition placeholder:text-[#91a199] focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10 disabled:cursor-wait disabled:opacity-65";
const textareaClassName = `${inputClassName} min-h-32 resize-y leading-7`;

interface TourFormProps {
  mode?: "create" | "edit";
  tourId?: string;
  initialValues?: TourFormValues;
}

export default function TourForm({
  mode = "create",
  tourId,
  initialValues,
}: TourFormProps) {
  const formAction = mode === "edit" ? updateTourAction : createTourAction;
  const [state, action, pending] = useActionState(
    formAction,
    initialState,
  );
  const [values, setValues] = useState<TourFormValues>(() =>
    initialValues ?? createDefaultTourFormValues(),
  );
  const [slugEdited, setSlugEdited] = useState(
    mode === "edit" || Boolean(initialValues?.slug),
  );
  const isEditing = mode === "edit";
  const statusOptions = isEditing
    ? tourManagementStatusOptions
    : tourStatusOptions;

  function setField<K extends keyof TourFormValues>(
    name: K,
    value: TourFormValues[K],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleTitleChange(value: string) {
    setValues((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setField("slug", slugify(value));
    setSlugEdited(value.trim().length > 0);
  }

  return (
    <form action={action} className="pb-24">
      {isEditing && <input type="hidden" name="tour_id" value={tourId ?? ""} />}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/tours"
            className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-bold text-[#0f5132]"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Volver a tours
          </Link>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            {isEditing ? "Editar tour" : "Nuevo tour"}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {isEditing ? "Editar la excursión" : "Crear una excursión"}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">
            {isEditing
              ? "Actualiza la información o cambia el estado de publicación del tour."
              : "Completa la información que utilizará Ruticas RD para organizar y publicar esta experiencia."}
          </p>
        </div>
      </div>

      {state.message && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}

      <fieldset disabled={pending} className="mt-7 space-y-6">
        <FormSection
          icon={ClipboardList}
          title="Información principal"
          description="Nombre, enlace y descripción que identificarán la excursión."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Título del tour" name="title" error={state.errors?.title}>
              <input
                id="title"
                name="title"
                value={values.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                required
                maxLength={120}
                placeholder="Ej. Aventura en Salto de Jima"
                className={inputClassName}
              />
            </Field>

            <Field
              label="Enlace del tour"
              name="slug"
              hint="Se genera automáticamente y debe ser único."
              error={state.errors?.slug}
            >
              <div className="flex min-h-13 items-center rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] focus-within:border-[#0f5132] focus-within:ring-4 focus-within:ring-[#0f5132]/10">
                <span className="pl-4 text-sm text-[#7b8d84]">/tours/</span>
                <input
                  id="slug"
                  name="slug"
                  value={values.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  required
                  maxLength={140}
                  className="min-h-13 min-w-0 flex-1 bg-transparent px-1 py-3 pr-4 text-base outline-none"
                />
              </div>
            </Field>
          </div>

          <Field
            label="Descripción corta"
            name="short_description"
            hint="Aparecerá en las tarjetas del catálogo. Máximo 240 caracteres."
            error={state.errors?.short_description}
          >
            <textarea
              id="short_description"
              name="short_description"
              value={values.short_description}
              onChange={(event) =>
                setField("short_description", event.target.value)
              }
              required
              maxLength={240}
              rows={3}
              placeholder="Resume la experiencia en una o dos frases."
              className={textareaClassName}
            />
          </Field>

          <Field
            label="Descripción completa"
            name="description"
            error={state.errors?.description}
          >
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              required
              maxLength={5000}
              rows={7}
              placeholder="Describe el destino, la experiencia y lo que puede esperar el participante."
              className={textareaClassName}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Categoría" name="category" error={state.errors?.category}>
              <select
                id="category"
                name="category"
                required
                value={values.category}
                onChange={(event) => setField("category", event.target.value)}
                className={inputClassName}
              >
                {tourCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Dificultad"
              name="difficulty"
              error={state.errors?.difficulty}
            >
              <select
                id="difficulty"
                name="difficulty"
                required
                value={values.difficulty}
                onChange={(event) => setField("difficulty", event.target.value)}
                className={inputClassName}
              >
                {tourDifficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={MapPin}
          title="Ubicación y encuentro"
          description="Información necesaria para ubicar el destino y organizar la salida."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Destino o municipio"
              name="location"
              value={values.location}
              onChange={(value) => setField("location", value)}
              placeholder="Constanza"
              error={state.errors?.location}
              required
            />
            <TextField
              label="Provincia"
              name="province"
              value={values.province}
              onChange={(value) => setField("province", value)}
              placeholder="La Vega"
              error={state.errors?.province}
              required
            />
          </div>
          <TextField
            label="Punto de encuentro"
            name="meeting_point"
            value={values.meeting_point}
            onChange={(value) => setField("meeting_point", value)}
            placeholder="San Francisco de Macorís"
            error={state.errors?.meeting_point}
            required
          />
        </FormSection>

        <FormSection
          icon={CalendarClock}
          title="Fechas y horarios"
          description="Todos los horarios se guardarán con la zona horaria de República Dominicana."
        >
          <DateTimeFields
            title="Salida"
            dateName="departure_date"
            timeName="departure_time"
            dateValue={values.departure_date}
            timeValue={values.departure_time}
            onDateChange={(value) => setField("departure_date", value)}
            onTimeChange={(value) => setField("departure_time", value)}
            error={state.errors?.departure_date}
            required
          />
          <DateTimeFields
            title="Regreso estimado"
            dateName="return_date"
            timeName="return_time"
            dateValue={values.return_date}
            timeValue={values.return_time}
            onDateChange={(value) => setField("return_date", value)}
            onTimeChange={(value) => setField("return_time", value)}
            error={state.errors?.return_date}
          />
          <DateTimeFields
            title="Fecha límite para reservar"
            dateName="deadline_date"
            timeName="deadline_time"
            dateValue={values.deadline_date}
            timeValue={values.deadline_time}
            onDateChange={(value) => setField("deadline_date", value)}
            onTimeChange={(value) => setField("deadline_time", value)}
            error={state.errors?.deadline_date}
            required
          />
          <TextField
            label="Duración mostrada"
            name="duration"
            value={values.duration}
            onChange={(value) => setField("duration", value)}
            placeholder="Ej. Día completo"
          />
        </FormSection>

        <FormSection
          icon={DollarSign}
          title="Precio y capacidad"
          description="El abono no puede ser mayor que el precio por persona."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="Precio por persona"
              name="price"
              value={values.price}
              onChange={(value) => setField("price", value)}
              min="0"
              step="0.01"
              error={state.errors?.price}
              required
            />
            <NumberField
              label="Abono requerido"
              name="deposit_amount"
              value={values.deposit_amount}
              onChange={(value) => setField("deposit_amount", value)}
              min="0"
              step="0.01"
              error={state.errors?.deposit_amount}
              required
            />
            <NumberField
              label="Capacidad"
              name="capacity"
              value={values.capacity}
              onChange={(value) => setField("capacity", value)}
              min="1"
              max="1000"
              step="1"
              error={state.errors?.capacity}
              required
            />
            <NumberField
              label="Edad mínima"
              name="minimum_age"
              value={values.minimum_age}
              onChange={(value) => setField("minimum_age", value)}
              min="0"
              max="100"
              step="1"
              error={state.errors?.minimum_age}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Checkbox
              name="transport_included"
              label="Incluye transporte"
              checked={values.transport_included}
              onChange={(checked) => setField("transport_included", checked)}
            />
            <Checkbox
              name="local_guide_included"
              label="Incluye guía local"
              checked={values.local_guide_included}
              onChange={(checked) => setField("local_guide_included", checked)}
            />
            <Checkbox
              name="minors_allowed"
              label="Permite menores"
              checked={values.minors_allowed}
              onChange={(checked) => setField("minors_allowed", checked)}
            />
            <Checkbox
              name="featured"
              label="Tour destacado"
              checked={values.featured}
              onChange={(checked) => setField("featured", checked)}
            />
          </div>
        </FormSection>

        <FormSection
          icon={CheckCircle2}
          title="Detalles de la experiencia"
          description="Escribe un elemento por línea. Las líneas vacías se ignorarán."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <ListField
              label="Qué incluye"
              name="includes"
              value={values.includes}
              onChange={(value) => setField("includes", value)}
              placeholder={"Transporte de ida y vuelta\nAcompañamiento durante el recorrido"}
            />
            <ListField
              label="Qué no incluye"
              name="not_includes"
              value={values.not_includes}
              onChange={(value) => setField("not_includes", value)}
              placeholder={"Alimentación\nGastos personales"}
            />
            <ListField
              label="Que debes llevar"
              name="requirements"
              value={values.requirements}
              onChange={(value) => setField("requirements", value)}
              placeholder={"Ropa cómoda\nCalzado adecuado\nDocumento de identidad"}
            />
            <ListField
              label="Recomendaciones"
              name="recommendations"
              value={values.recommendations}
              onChange={(value) => setField("recommendations", value)}
              placeholder={"Llevar protector solar\nLlevar repelente"}
            />
          </div>
          <ListField
            label="Riesgos inherentes"
            name="inherent_risks"
            value={values.inherent_risks}
            onChange={(value) => setField("inherent_risks", value)}
            placeholder={"Caminos irregulares\nCambios inesperados del clima\nCansancio físico"}
          />
        </FormSection>

        <FormSection
          icon={ClipboardList}
          title="Itinerario"
          description="Escribe un evento por línea con el formato indicado."
        >
          <Field
            label="Eventos del recorrido"
            name="itinerary"
            hint="Formato: HH:MM | Título | Descripción"
            error={state.errors?.itinerary}
          >
            <textarea
              id="itinerary"
              name="itinerary"
              value={values.itinerary}
              onChange={(event) => setField("itinerary", event.target.value)}
              rows={6}
              placeholder={
                "06:00 | Salida | Inicio desde el punto de encuentro\n09:00 | Llegada | Orientación e inicio de la experiencia"
              }
              className={textareaClassName}
            />
          </Field>
        </FormSection>

        <FormSection
          icon={ShieldCheck}
          title="Políticas"
          description="Las políticas generales ya están precargadas y puedes particularizarlas para este tour."
        >
          <Field
            label="Política de puntualidad"
            name="punctuality_policy"
            error={state.errors?.punctuality_policy}
          >
            <textarea
              id="punctuality_policy"
              name="punctuality_policy"
              required
              rows={5}
              value={values.punctuality_policy}
              onChange={(event) =>
                setField("punctuality_policy", event.target.value)
              }
              className={textareaClassName}
            />
          </Field>
          <Field
            label="Política de cancelación"
            name="cancellation_policy"
            error={state.errors?.cancellation_policy}
          >
            <textarea
              id="cancellation_policy"
              name="cancellation_policy"
              required
              rows={6}
              value={values.cancellation_policy}
              onChange={(event) =>
                setField("cancellation_policy", event.target.value)
              }
              className={textareaClassName}
            />
          </Field>
        </FormSection>

        <FormSection
          icon={ImagePlus}
          title="Imágenes"
          description="Después de guardar el tour podrás añadir su portada y galería desde el listado de tours."
        >
          <div className="rounded-2xl border border-dashed border-[#bdcec4] bg-[#f7faf8] px-5 py-7 text-sm leading-6 text-[#667a70]">
            Primero guardaremos la información del tour. Luego utiliza el botón
            “Administrar imágenes” para cargar sus fotografías promocionales.
          </div>
        </FormSection>

        <FormSection
          icon={Save}
          title="Publicación"
          description={
            isEditing
              ? "Cambia aquí un borrador a publicado o actualiza el estado operativo del tour."
              : "Un borrador solo será visible dentro del panel administrativo."
          }
        >
          <Field
            label={isEditing ? "Estado del tour" : "Estado inicial"}
            name="status"
            error={state.errors?.status}
          >
            <select
              id="status"
              name="status"
              required
              value={values.status}
              onChange={(event) => setField("status", event.target.value)}
              className={inputClassName}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        <div className="safe-bottom sticky bottom-0 z-20 -mx-4 border-t border-[#dce6e0] bg-white/95 px-4 py-4 shadow-[0_-12px_30px_rgba(7,19,15,0.08)] backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/tours"
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-[#cddbd3] px-6 py-3 font-black text-[#294238]"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-3 font-black text-[#07130f] shadow-lg shadow-[#07130f]/10 transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-65 sm:hover:bg-lime-300"
            >
              {pending ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {pending
                ? "Guardando en Supabase..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar tour"}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
          <Icon size={23} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#71847a]">{description}</p>
        </div>
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-black text-[#294238]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-5 text-[#7b8d84]">{hint}</p>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} name={name} error={error}>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={180}
        placeholder={placeholder}
        className={inputClassName}
      />
    </Field>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step,
  error,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} name={name} error={error}>
      <input
        id={name}
        name={name}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        max={max}
        step={step}
        required={required}
        className={inputClassName}
      />
    </Field>
  );
}

function DateTimeFields({
  title,
  dateName,
  timeName,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  error,
  required = false,
}: {
  title: string;
  dateName: string;
  timeName: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-[#294238]">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          id={dateName}
          name={dateName}
          type="date"
          value={dateValue}
          onChange={(event) => onDateChange(event.target.value)}
          required={required}
          aria-label={`${title}: fecha`}
          className={inputClassName}
        />
        <input
          id={timeName}
          name={timeName}
          type="time"
          value={timeValue}
          onChange={(event) => onTimeChange(event.target.value)}
          required={required}
          aria-label={`${title}: hora`}
          className={inputClassName}
        />
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function ListField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Field label={label} name={name}>
      <textarea
        id={name}
        name={name}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={textareaClassName}
      />
    </Field>
  );
}

function Checkbox({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 py-3 text-sm font-bold text-[#294238]">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#0f5132]"
      />
      {label}
    </label>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}
