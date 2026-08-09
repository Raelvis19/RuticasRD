export function createWhatsAppUrl(
  phone: string,
  message?: string,
) {
  const cleanPhone = phone.replace(/\D/g, "");

  if (!cleanPhone) {
    return "";
  }

  const url = new URL(
    `https://wa.me/${cleanPhone}`,
  );

  if (message) {
    url.searchParams.set("text", message);
  }

  return url.toString();
}