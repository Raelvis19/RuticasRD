# Revisión mobile-first — Ruticas RD

## Objetivo

Esta revisión prioriza iPhone/Safari y navegadores móviles, manteniendo la experiencia de escritorio.

## Cambios aplicados

- Viewport explícito con `viewport-fit=cover` para iPhone.
- Compatibilidad con safe areas del notch y home indicator.
- `touch-action: manipulation` para evitar que dobles taps accidentales se interpreten como zoom sobre controles.
- Objetivos táctiles de aproximadamente 48 px en botones principales.
- Inputs de 16 px en móvil para evitar el auto-zoom de Safari al enfocar campos.
- Formulario de reserva convertido a formularios semánticos con `onSubmit`.
- Selector de participantes ampliado y reajustado para pantallas estrechas.
- Inputs con `inputMode` y `autocomplete` apropiados para teclados móviles.
- Resumen de reserva compacto para móvil; el panel sticky grande se reserva para escritorio.
- Formateo monetario y de fechas determinista para reducir diferencias de hidratación entre servidor y Safari.
- CTA fijo del detalle del tour adaptado al safe area inferior del iPhone.
- Tarjetas de tours con botón de texto grande en lugar de depender de un icono pequeño.
- Filtros del catálogo convertidos en chips desplazables horizontalmente en móvil.
- Menú móvil con objetivos táctiles mayores, scroll interno y bloqueo del scroll de fondo.
- Ajustes de espaciado en Hero, tours, galería, confirmación y páginas provisionales.
- El botón de contacto de la confirmación ya no es un botón muerto: enlaza a `/contacto` mientras se configura WhatsApp.

## Pruebas recomendadas antes del siguiente deploy

1. Ejecutar `npm run lint`.
2. Ejecutar `npm run build`.
3. Probar en Safari de iPhone real:
   - abrir y cerrar el menú;
   - entrar a un tour;
   - usar `Reservar`;
   - aumentar/disminuir participantes;
   - completar paso 1, 2 y 3;
   - enfocar campos y comprobar que Safari no hace auto-zoom;
   - copiar el código de reserva;
   - volver atrás y navegar entre secciones.
4. Probar también desde el navegador interno de Instagram si ese será un canal frecuente de entrada.
5. Revisar en 320 px, 375 px, 390 px, 430 px, tablet y escritorio.

## Nota

La reserva continúa siendo una demostración local: usa `sessionStorage`. Cuando Supabase esté conectado, el guardado se moverá al servidor/base de datos sin tener que rehacer el diseño móvil.
