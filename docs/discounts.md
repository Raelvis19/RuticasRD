# Códigos de descuento

## Activación

1. Probar primero en un proyecto Supabase de pruebas con las migraciones anteriores aplicadas.
2. Ejecutar `supabase/migrations/202610060001_discount_codes.sql` completa. La migración es transaccional, se ejecuta una vez y agrega tablas/campos; no borra reservas ni reemplaza sus importes.
3. Publicar la aplicación después de aplicar la migración. El código anterior sigue funcionando con el esquema nuevo.
4. Probar creación, aplicación, correo, pago parcial, confirmación gratuita y consulta por enlace en móvil.

Si se necesita revertir la aplicación, mantener la migración y volver al despliegue anterior. No eliminar los campos/tablas que conservan premios utilizados. La versión anterior no permitirá confirmar premios gratis; gestionarlos desde la nueva versión.

## Operación

En Administración → Descuentos se crean códigos por excursión. Se permite un código por reserva: monto fijo sobre el total o precio de un participante. Los importes nunca son negativos. El código puede limitarse a un correo, vencer o desactivarse.

El correo restringido se compara con el introducido por el responsable; no verifica la identidad del ganador. El administrador revisa el premio antes de confirmar.

Los cupos gratis eliminan el abono de una persona. El monto fijo mantiene el abono habitual hasta el máximo del total final. Un premio que cubre todo requiere confirmación administrativa sin pagos ficticios, con control de capacidad y nota de auditoría.

El uso se asigna al crear la solicitud pendiente. La validación previa no consume usos ni garantiza disponibilidad. La transacción bloquea tour y código, vuelve a verificar vigencia y límites, y revierte el uso si falla la reserva.

Cancelar no libera el código automáticamente. Desde Descuentos se puede liberar un uso cancelado; queda registrado quién y cuándo lo hizo. La reserva cuyo uso se liberó no puede reactivarse. El historial conserva importes y código originales. Tras el primer uso solo se editan vigencia, límite y activación del código.

Los saldos y estadísticas existentes utilizan `total_amount`, que ya incluye el descuento. Los ingresos cobrados siguen sumando pagos reales. Las reservas gratis cuentan para ocupación cuando se confirman.

## Verificación

`npm run test:discounts` usa PostgreSQL embebido (PGlite), con datos ficticios y sin conexión a Supabase. Aplica el esquema y las migraciones relevantes y prueba descuentos, abonos, elegibilidad, uso único, rollback, permisos, cancelaciones, premios gratis y capacidad. No simula sesiones PostgreSQL concurrentes independientes ni los servicios Auth/Storage reales.

Ejecutar además `npm run lint` y `npm run build`. Confirmar en Supabase de pruebas que dos solicitudes concurrentes con un código de un uso solo producen una reserva con descuento y que el envío de correos funciona con Resend.
