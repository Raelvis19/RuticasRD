# Pruebas locales en iPhone

El proyecto usa Next.js 16. Cuando se abre el servidor de desarrollo desde un teléfono usando la IP local de la PC, Next.js puede bloquear los recursos internos de desarrollo si ese origen no está autorizado.

## Síntoma

- La página se ve correctamente en el iPhone.
- Los controles React no responden.
- Los botones `+` y `-` no cambian el estado.
- Un botón `submit` recarga la página porque el formulario funciona como HTML sin hidratar.

## Configuración actual

`next.config.ts` permite la IP local usada para las pruebas:

```ts
allowedDevOrigins: ["192.168.1.15"]
```

Inicia el servidor para pruebas en la red local con:

```powershell
npm run dev:network
```

Luego abre en el iPhone:

```text
http://192.168.1.15:3000
```

Si Windows asigna otra IP a la PC, ejecuta `ipconfig`, actualiza `allowedDevOrigins` con la nueva IPv4 y reinicia el servidor.

Esta opción solo afecta el servidor de desarrollo. El despliegue normal en Vercel no necesita esta IP.

## Chrome/Edge en iOS/iPadOS y atributos `__gcr*`

Algunas versiones de Chrome/Edge sobre iOS/iPadOS pueden insertar atributos privados en el DOM antes de que React hidrate la página (por ejemplo `__gchrome_uniqueid`, `__gcruniqueid` o similares). Esto puede producir un hydration mismatch aunque el HTML generado por la aplicación sea correcto.

Para aislar el flujo crítico de reservas de este comportamiento, `ReservationForm` se carga únicamente en el cliente mediante `next/dynamic(..., { ssr: false })`. La página del tour y el resto del sitio continúan usando SSR normalmente.

También se usa `suppressHydrationWarning` en el elemento `<html>` para ignorar atributos de nivel raíz añadidos por el navegador antes de la hidratación.
