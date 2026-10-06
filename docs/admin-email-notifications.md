# Aviso administrativo de nuevas reservas

Configura `RESERVATION_ADMIN_EMAIL` con una dirección de correo del administrador en el entorno local y en Vercel (en los entornos deseados). Reinicia el servidor local o despliega de nuevo en Vercel tras cambiar variables.

Se reutilizan `RESEND_API_KEY`, `RESERVATION_EMAIL_FROM` y `NEXT_PUBLIC_SITE_URL`. No se necesita ninguna migración de Supabase.

Después de guardar la reserva y recibir un código válido, se intenta enviar un correo al cliente y otro al administrador, con claves de idempotencia diferentes. El aviso incluye código, tour, fecha, responsable, teléfono, correo, cantidad de participantes, descuento, total, abono y enlace al panel protegido. No incluye documentos ni contactos de emergencia.

El destino administrativo solo se lee del entorno del servidor. Si falta o no es válido, el aviso se omite y se registra el motivo. Un fallo administrativo no cambia el resultado del correo al cliente ni revierte la reserva. El envío administrativo tiene un tiempo máximo de ocho segundos. No se implementa una cola ni reintentos automáticos: los fallos quedan en los registros del servidor y se revisan en Resend cuando corresponda.

Validación local: `npm run test:reservation-emails` usa envíos simulados; no envía correos reales. Probar además una reserva controlada con el entorno configurado y comprobar ambos mensajes en Resend.
