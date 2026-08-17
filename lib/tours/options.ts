import type {
  TourCategory,
  TourDifficulty,
  TourStatus,
} from "@/types/tour";

export const tourCategoryOptions: ReadonlyArray<{
  value: TourCategory;
  label: string;
}> = [
  { value: "senderismo", label: "Senderismo" },
  { value: "balneario", label: "Balneario" },
  { value: "cascada", label: "Cascada" },
  { value: "montana", label: "Montaña" },
  { value: "parque_nacional", label: "Parque nacional" },
  { value: "playa", label: "Playa" },
  { value: "ecologico", label: "Ecológico" },
  { value: "turistico", label: "Turístico" },
];

export const tourDifficultyOptions: ReadonlyArray<{
  value: TourDifficulty;
  label: string;
}> = [
  { value: "facil", label: "Fácil" },
  { value: "moderada", label: "Moderada" },
  { value: "demandante", label: "Demandante" },
];

export const tourStatusOptions: ReadonlyArray<{
  value: Extract<TourStatus, "borrador" | "publicado">;
  label: string;
}> = [
  { value: "borrador", label: "Guardar como borrador" },
  { value: "publicado", label: "Publicar inmediatamente" },
];

export const tourManagementStatusOptions: ReadonlyArray<{
  value: TourStatus;
  label: string;
}> = [
  { value: "borrador", label: "Borrador" },
  { value: "publicado", label: "Publicado" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "pospuesto", label: "Pospuesto" },
];

export const tourCategoryLabels = Object.fromEntries(
  tourCategoryOptions.map((option) => [option.value, option.label]),
) as Record<TourCategory, string>;

export const tourDifficultyLabels = Object.fromEntries(
  tourDifficultyOptions.map((option) => [option.value, option.label]),
) as Record<TourDifficulty, string>;

export const tourStatusLabels: Record<TourStatus, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  agotado: "Agotado",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  pospuesto: "Pospuesto",
};

export const defaultPunctualityPolicy =
  "Los participantes deben llegar al punto de encuentro al menos 20 minutos antes de la hora de salida. Llegar tarde, no presentarse o perder la salida no da derecho automático a reembolso, crédito ni reprogramación.";

export const defaultCancellationPolicy =
  "Las cancelaciones de participantes no tienen reembolso ni crédito automático. El cupo puede cederse con aviso previo y dentro del plazo establecido. Los casos excepcionales se evalúan individualmente según las circunstancias y los costos ya comprometidos.";
