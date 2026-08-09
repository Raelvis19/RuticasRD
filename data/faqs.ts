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
    id: "cancelacion-cliente",
    category: "cambios",
    question: "¿Qué ocurre si necesito cancelar?",
    answer:
      "Cada excursión puede tener condiciones diferentes de cancelación. Dependiendo del momento en que solicites la cancelación, el reembolso puede ser total, parcial o no aplicar. Las condiciones estarán disponibles antes de realizar la reserva.",
  },
  {
    id: "cancelacion-ruticas",
    category: "cambios",
    question: "¿Qué pasa si Ruticas RD cancela la excursión?",
    answer:
      "Si Ruticas RD cancela una actividad, se ofrecerá el reembolso correspondiente o la posibilidad de mover la reservación a una nueva fecha, según corresponda.",
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
      "La puntualidad es muy importante para evitar retrasos al grupo. Cada excursión indicará la hora de encuentro y la anticipación recomendada. Te aconsejamos llegar con tiempo suficiente.",
  },
];