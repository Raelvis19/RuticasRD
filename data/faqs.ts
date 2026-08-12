export type FaqCategory =
  | "reservas"
  | "pagos"
  | "experiencia"
  | "cambios";

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    id: "como-reservar",
    category: "reservas",
    question: "¿Cómo puedo reservar mi cupo?",
    answer:
      "Selecciona la excursión que deseas, revisa todos los detalles y pulsa el botón de reservar. Completa los datos solicitados de la persona responsable y de los participantes. Una vez enviada la solicitud, recibirás un código de reservación.",
  },
  {
    id: "confirmacion-reserva",
    category: "reservas",
    question: "¿Cuándo queda confirmado mi cupo?",
    answer:
      "Enviar el formulario no confirma automáticamente el cupo. La reservación queda confirmada cuando Ruticas RD verifica el pago o abono correspondiente.",
  },
  {
    id: "reserva-grupal",
    category: "reservas",
    question: "¿Puedo reservar para varias personas?",
    answer:
      "Sí. Puedes realizar una reservación para varias personas siempre que existan suficientes cupos disponibles. Deberás proporcionar los datos solicitados de cada participante.",
  },
  {
    id: "datos-reserva",
    category: "reservas",
    question: "¿Qué información necesito para reservar?",
    answer:
      "Solicitamos información básica como nombre completo, documento de identidad, teléfono, ciudad y datos de contacto de emergencia. Algunos datos adicionales pueden variar dependiendo de la excursión.",
  },

  {
    id: "pago-completo",
    category: "pagos",
    question: "¿Tengo que pagar el monto completo de una vez?",
    answer:
      "No necesariamente. Algunas excursiones permiten reservar mediante un abono y completar el saldo antes de la fecha límite indicada para ese tour.",
  },
  {
    id: "metodos-pago",
    category: "pagos",
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Actualmente los pagos pueden realizarse mediante transferencia bancaria o efectivo, según las instrucciones proporcionadas por Ruticas RD. Más adelante podrán incorporarse otros métodos de pago.",
  },
  {
    id: "comprobante",
    category: "pagos",
    question: "¿Tengo que enviar un comprobante de pago?",
    answer:
      "Cuando el pago se realiza mediante transferencia, Ruticas RD puede solicitar el comprobante para poder verificarlo y confirmar la reservación.",
  },

  {
    id: "transporte",
    category: "experiencia",
    question: "¿El transporte está incluido?",
    answer:
      "Sí, el transporte desde el punto de encuentro establecido está incluido en las excursiones de Ruticas RD, salvo que en la información específica de un tour se indique algo diferente.",
  },
  {
    id: "alimentacion",
    category: "experiencia",
    question: "¿La alimentación está incluida?",
    answer:
      "Depende de cada excursión. En la página del tour encontrarás claramente qué está incluido y qué no está incluido en el precio.",
  },
  {
    id: "menores",
    category: "experiencia",
    question: "¿Pueden participar menores de edad?",
    answer:
      "Sí, cuando la excursión lo permita. Los menores deberán asistir acompañados por su padre, madre o tutor legal y cumplir las condiciones específicas indicadas para el tour.",
  },
  {
    id: "dificultad",
    category: "experiencia",
    question: "¿Cómo sé si una excursión es adecuada para mí?",
    answer:
      "Cada tour indica su nivel de dificultad: Fácil, Moderada o Demandante. También encontrarás requisitos, recomendaciones, duración aproximada y detalles del recorrido para ayudarte a decidir.",
  },
  {
    id: "que-llevar",
    category: "experiencia",
    question: "¿Qué debo llevar a una excursión?",
    answer:
      "Los artículos recomendados dependen del destino. Antes de reservar podrás consultar la ropa, calzado, equipo y otros elementos sugeridos para esa experiencia.",
  },

  {
    id: "cancelacion-participante",
    category: "cambios",
    question: "¿Qué ocurre si necesito cancelar mi participación?",
    answer:
      "Si necesitas cancelar tu participación en una excursión, Ruticas RD no realiza reembolsos de manera automática por cancelaciones de participantes. Como alternativa, podrás transferir o ceder tu cupo a otra persona, siempre que lo comuniques previamente a Ruticas RD y proporciones los datos del nuevo participante dentro del plazo establecido para la excursión. Si el cupo ya ha sido pagado, la persona que recibe el cupo podrá acordar directamente con quien lo cedió cualquier pago, compensación o diferencia correspondiente. Ruticas RD no interviene ni se responsabiliza por las transacciones económicas realizadas entre ambas partes.",
  },
  {
    id: "cancelacion-excepcional",
    category: "cambios",
    question: "¿Puedo cancelar si tengo una situación excepcional?",
    answer:
      "Entendemos que pueden surgir circunstancias que escapen al control del participante. En situaciones excepcionales, como el fallecimiento de un familiar o persona cercana, una enfermedad, accidente u otra circunstancia grave o extraordinaria que imposibilite la participación, Ruticas RD podrá evaluar el caso de manera individual. La posibilidad de ofrecer un reembolso, devolución parcial u otra alternativa dependerá de la naturaleza de la situación, el momento de la solicitud, la posibilidad de transferir el cupo, los gastos ya realizados o comprometidos y los costos que la organización no pueda recuperar. Una situación excepcional no garantiza automáticamente un reembolso. Ruticas RD podrá solicitar información o documentación razonable para evaluar el caso.",
  },
  {
    id: "cancelacion-sin-sustituto",
    category: "cambios",
    question: "¿Qué pasa si no consigo a otra persona para ocupar mi cupo?",
    answer:
      "La responsabilidad de encontrar una persona que sustituya al participante corresponde a quien cancela. Si no consigues un sustituto dentro del plazo establecido, el cupo se considerará cancelado y no habrá un reembolso automático. Cualquier alternativa solo podrá evaluarse de manera individual cuando exista una situación excepcional y estará sujeta a los costos ya realizados o comprometidos por Ruticas RD.",
  },
  {
    id: "credito-futuro",
    category: "cambios",
    question: "¿Puedo usar el monto pagado como crédito para otra excursión?",
    answer:
      "La cancelación de una participación no genera automáticamente un crédito para futuras excursiones. Si existe una situación excepcional, Ruticas RD podrá evaluar individualmente si corresponde ofrecer un crédito, una devolución parcial u otra alternativa, tomando en cuenta las circunstancias y los costos ya comprometidos o no recuperables.",
  },
  {
    id: "cancelacion-ruticas",
    category: "cambios",
    question: "¿Qué pasa si Ruticas RD cancela la excursión?",
    answer:
      "Si Ruticas RD cancela completamente una excursión, informará a los participantes y evaluará la alternativa aplicable según las circunstancias de la cancelación y los costos ya realizados o comprometidos. Según corresponda, podrá ofrecerse una reprogramación, un crédito, una devolución total o una devolución parcial. La solución dependerá de cada caso y será comunicada por los medios oficiales.",
  },
  {
    id: "cupos-agotados",
    category: "cambios",
    question: "¿Qué sucede cuando se agotan los cupos?",
    answer:
      "El tour aparecerá como Cupos agotados. Cuando esté disponible, podrás solicitar ingresar a la lista de espera por si se libera un espacio.",
  },
  {
    id: "puntualidad",
    category: "cambios",
    question: "¿Qué pasa si llego tarde al punto de encuentro?",
    answer:
      "La puntualidad es responsabilidad de cada participante. Ruticas RD podrá iniciar la excursión a la hora programada para no afectar al grupo. Llegar tarde, no presentarse o perder la salida no da derecho automático a reembolso, crédito o reprogramación, aunque una situación excepcional podrá evaluarse individualmente.",
  },
];
