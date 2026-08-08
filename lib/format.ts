const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const WEEKDAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

function parseDateParts(date: string) {
  const [yearText, monthText, dayText] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

export function formatDop(value: number) {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${sign}RD$${digits}`;
}

export function formatTourDate(date: string) {
  const parts = parseDateParts(date);
  if (!parts) return date;

  const { year, month, day } = parts;
  return `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}

export function formatLongTourDate(date: string) {
  const parts = parseDateParts(date);
  if (!parts) return date;

  const { year, month, day } = parts;
  const weekdayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return `${WEEKDAYS_ES[weekdayIndex]}, ${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}
