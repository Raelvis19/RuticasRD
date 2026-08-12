import type { LucideIcon } from "lucide-react";

import {
  Banknote,
  CalendarClock,
  Camera,
  CircleAlert,
  Clock3,
  FileText,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

export interface PolicySection {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  points: string[];
  important?: string;
}

export const policies: PolicySection[] = [
  {
    id: "reservaciones",
    shortTitle: "Reservaciones",
    title: "Reservaciones y confirmación de cupos",
    description:
      "Cómo funciona una solicitud de reservación y cuándo un cupo se considera confirmado.",
    icon: FileText,
    points: [
      "Completar y enviar el formulario de reservación representa una solicitud de participación en la excursión.",
      "Una solicitud no garantiza automáticamente el cupo.",
      "La reservación se considera confirmada cuando Ruticas RD verifica el pago o abono requerido para la excursión.",
      "El participante es responsable de proporcionar información correcta y actualizada durante el proceso de reservación.",
      "Las reservaciones grupales requieren los datos correspondientes de cada participante.",
    ],
    important:
      "Mientras una reservación se encuentre pendiente de verificación, el cupo todavía no debe considerarse confirmado.",
  },

  {
    id: "pagos",
    shortTitle: "Pagos",
    title: "Pagos, abonos y saldos pendientes",
    description:
      "Condiciones generales relacionadas con los pagos realizados para una excursión.",
    icon: WalletCards,
    points: [
      "Cada excursión indicará claramente su precio, el abono mínimo requerido cuando corresponda y la fecha límite para completar el pago.",
      "Los participantes podrán realizar pagos utilizando los métodos habilitados por Ruticas RD para cada actividad.",
      "Cuando se utilice transferencia bancaria, puede ser necesario proporcionar un comprobante para verificar el pago.",
      "Los abonos y pagos serán registrados una vez que hayan sido verificados.",
      "Cuando exista un saldo pendiente, este deberá completarse antes de la fecha límite establecida para la excursión.",
    ],
    important:
      "Las condiciones económicas específicas mostradas en la página de cada tour forman parte de las condiciones aplicables a esa excursión.",
  },

  {
    id: "cancelaciones",
    shortTitle: "Cancelaciones",
    title: "Cancelaciones solicitadas por el participante",
    description:
      "Qué ocurre cuando una persona necesita cancelar su participación.",
    icon: CalendarClock,
    points: [
      "Las cancelaciones solicitadas por participantes no generan un reembolso automático.",
      "El participante podrá transferir o ceder su cupo a otra persona si lo comunica previamente a Ruticas RD y entrega los datos del sustituto dentro del plazo establecido.",
      "Cualquier pago o compensación entre quien cede el cupo y quien lo recibe será acordado directamente entre ambas partes, sin intervención ni responsabilidad de Ruticas RD.",
      "Encontrar un sustituto es responsabilidad del participante. Si no lo consigue dentro del plazo, el cupo se considerará cancelado sin reembolso automático.",
      "Una cancelación tampoco genera automáticamente crédito para futuras excursiones.",
      "Las situaciones graves o extraordinarias podrán evaluarse individualmente. Ruticas RD podrá solicitar información o documentación razonable y considerar la naturaleza del caso, el momento de la solicitud y los costos ya realizados, comprometidos o no recuperables.",
      "La evaluación de una situación excepcional no garantiza un reembolso, una devolución parcial, un crédito ni otra alternativa.",
    ],
    important:
      "Toda cancelación o cesión de cupo debe comunicarse por los medios oficiales de Ruticas RD dentro del plazo aplicable a la excursión.",
  },

  {
    id: "cancelacion-ruticas",
    shortTitle: "Cambios de Ruticas",
    title: "Cancelaciones o cambios realizados por Ruticas RD",
    description:
      "Cómo se manejarán situaciones en las que la organización tenga que modificar una actividad.",
    icon: RefreshCw,
    points: [
      "Ruticas RD podrá modificar horarios, rutas o determinados aspectos logísticos cuando existan razones operativas o de seguridad.",
      "Si una excursión debe ser cancelada por Ruticas RD, se informará a los participantes utilizando los medios de contacto disponibles.",
      "Cuando Ruticas RD cancele completamente la excursión, evaluará la solución aplicable según las circunstancias y los costos ya realizados o comprometidos.",
      "Según corresponda, la solución podrá consistir en una reprogramación, un crédito, una devolución total o una devolución parcial; ninguna alternativa se presume automáticamente antes de evaluar el caso.",
      "Los cambios importantes serán comunicados con la mayor anticipación posible.",
    ],
  },

  {
    id: "puntualidad",
    shortTitle: "Puntualidad",
    title: "Horarios, salida y puntualidad",
    description:
      "Las excursiones dependen del cumplimiento de horarios para no perjudicar al resto del grupo.",
    icon: Clock3,
    points: [
      "Cada excursión indicará la hora y el lugar oficial de encuentro.",
      "Los participantes deberán presentarse con la anticipación recomendada en la información del tour.",
      "Ruticas RD podrá iniciar el recorrido a la hora programada para evitar afectar al resto del grupo.",
      "Llegar tarde, no presentarse o perder la salida no da derecho automático a reembolso, crédito ni reprogramación.",
      "Una circunstancia excepcional relacionada con la tardanza o ausencia podrá evaluarse individualmente, sin que ello garantice una compensación.",
    ],
  },

  {
    id: "menores",
    shortTitle: "Menores",
    title: "Participación de menores de edad",
    description:
      "Condiciones especiales cuando una excursión permite la participación de menores.",
    icon: UserRoundCheck,
    points: [
      "No todas las excursiones necesariamente serán adecuadas para menores de edad.",
      "La página de cada tour indicará cuando existan requisitos de edad o restricciones particulares.",
      "Cuando se permita la participación de menores, deberán asistir acompañados por su padre, madre o tutor legal, salvo que se establezca expresamente otra condición válida para la actividad.",
      "La persona responsable deberá proporcionar los datos solicitados para el menor y su acompañante.",
    ],
  },

  {
    id: "seguridad",
    shortTitle: "Seguridad",
    title: "Seguridad y riesgos inherentes",
    description:
      "Las actividades en espacios naturales pueden implicar condiciones que no están presentes en actividades convencionales.",
    icon: ShieldCheck,
    points: [
      "Cada participante debe revisar el nivel de dificultad, requisitos y recomendaciones de la excursión antes de reservar.",
      "Las actividades pueden desarrollarse en senderos, montañas, ríos, cascadas, playas u otros espacios naturales.",
      "Pueden existir condiciones como superficies irregulares, exposición al clima, esfuerzo físico u otros riesgos propios del destino.",
      "Los participantes deben seguir las instrucciones de los organizadores y guías durante la actividad.",
      "Ruticas RD podrá tomar decisiones operativas destinadas a proteger la seguridad del grupo cuando las condiciones del recorrido lo requieran.",
    ],
    important:
      "La información específica sobre riesgos, equipamiento recomendado y nivel de dificultad estará disponible en cada excursión.",
  },

  {
    id: "lista-espera",
    shortTitle: "Lista de espera",
    title: "Cupos agotados y lista de espera",
    description:
      "Qué sucede cuando una excursión alcanza su capacidad máxima.",
    icon: UsersRound,
    points: [
      "Cuando todos los cupos disponibles estén ocupados, la excursión aparecerá como Cupos agotados.",
      "Cuando la función esté disponible, los interesados podrán solicitar ingresar a una lista de espera.",
      "Estar en una lista de espera no representa una reservación confirmada.",
      "Si se libera un espacio, Ruticas RD podrá contactar a las personas en espera para ofrecer el cupo disponible.",
    ],
  },

  {
    id: "imagenes",
    shortTitle: "Fotografías",
    title: "Fotografías y contenido audiovisual",
    description:
      "Durante las experiencias pueden realizarse fotografías y videos de los destinos y del grupo.",
    icon: Camera,
    points: [
      "Ruticas RD puede realizar fotografías o videos durante sus experiencias para documentar las actividades.",
      "Cuando una imagen permita identificar claramente a una persona y se pretenda utilizar con fines promocionales, se procurará contar con la autorización correspondiente.",
      "Se prestará especial atención al uso de imágenes en las que aparezcan menores de edad.",
      "Los participantes podrán comunicar a Ruticas RD cualquier inquietud relacionada con el uso de su imagen.",
    ],
  },

  {
    id: "datos",
    shortTitle: "Datos personales",
    title: "Uso y protección de datos personales",
    description:
      "Información relacionada con los datos proporcionados durante una reservación.",
    icon: HeartHandshake,
    points: [
      "Ruticas RD solicitará únicamente la información necesaria para gestionar las reservaciones, participantes, pagos, comunicación y seguridad de las excursiones.",
      "Los datos podrán incluir nombre, documento de identidad, teléfono, ciudad, contacto de emergencia y otra información necesaria para la actividad.",
      "Los comprobantes de pago y documentos asociados a una reservación deberán mantenerse con acceso restringido.",
      "La información proporcionada no deberá utilizarse para finalidades incompatibles con aquellas para las que fue recopilada.",
      "Los participantes podrán contactar a Ruticas RD para realizar consultas relacionadas con los datos asociados a su reservación.",
    ],
    important:
      "Cuando conectemos la plataforma a Supabase, los comprobantes de pago se almacenarán de forma privada y no como archivos públicamente accesibles.",
  },

  {
    id: "conducta",
    shortTitle: "Convivencia",
    title: "Convivencia y turismo responsable",
    description:
      "Cada participante forma parte de una experiencia compartida.",
    icon: Banknote,
    points: [
      "Se espera un comportamiento respetuoso hacia otros participantes, organizadores, guías y comunidades visitadas.",
      "Los participantes deberán respetar las normas establecidas en parques, áreas protegidas y espacios privados visitados.",
      "Se promueve evitar dejar residuos y reducir el impacto ambiental durante las actividades.",
      "Ruticas RD podrá intervenir ante comportamientos que comprometan seriamente la seguridad, organización o bienestar del grupo.",
    ],
  },

  {
    id: "informacion-tour",
    shortTitle: "Información del tour",
    title: "Condiciones específicas de cada excursión",
    description:
      "Cada destino puede requerir reglas adicionales.",
    icon: CircleAlert,
    points: [
      "Las condiciones generales de esta página se complementan con la información publicada para cada excursión.",
      "Cada tour podrá especificar horarios, punto de encuentro, precio, abono, fecha límite, dificultad, edad mínima, inclusiones, exclusiones, requisitos y políticas particulares.",
      "Cuando exista una condición específica aplicable a un tour, esta deberá mostrarse antes de realizar la reservación.",
    ],
  },
];
