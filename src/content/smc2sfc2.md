---
title: SMC2SFC2
short: SF
description: "Conversor de ROMs de SNES (.smc ↔ .sfc) que corre 100% en el navegador. Rescate de un proyecto que llevaba abandonado ~10 años y al que Heroku le bajó la persiana en algún momento de 2022. Lo reescribí en Astro + TypeScript, le metí drag & drop, batch, lector de header de SNES, deduplicación con SHA-256 y PWA. Live en producción."
tags: [Astro, TypeScript, PWA, CapRover]
color: "#2d4f9e"
category: Personal
year: "2026"
github: https://github.com/etejedaw/smc2sfc2
url: https://smc2sfc2.app.etejeda.dev
image: ../assets/smc2sfc2.png
---

## Contexto

Yo era usuario del proyecto original ([mwmccarthy/smc2sfc2](https://github.com/mwmccarthy/smc2sfc2), repo de hace ~10 años): una webapp ñoña y útil que convertía headers de ROMs de SNES entre `.smc` (con header de copier de 512 bytes) y `.sfc` (sin header). Lo usaba cada vez que quería pasar una ROM de un emulador a otro y los formatos no calzaban.

Un día quise entrar y la URL no respondía. Heroku había terminado el tier gratuito y el creador no había migrado el deploy a ningún lado. En ese momento no tenía las herramientas para revivirlo: era una app en Flask + React + Webpack con dependencias bien antiguas, y yo todavía no manejaba lo suficiente del stack como para forkear, modernizar y desplegar por mi cuenta.

Años después volví al problema con más kilometraje encima y con asistencia de IA en el medio. La decisión no fue "lo voy a portar tal cual": el código original ya no compilaba con node moderno, el frontend estaba escrito antes de los hooks y el backend solo existía para servir un static. Aproveché para repensarlo: **mismo propósito, stack mínimo, mejor diseño**. Mantengo crédito al autor original en el repo y en la app.

## Decisiones técnicas

**Stack:** Astro 6 + TypeScript + [fflate](https://github.com/101arrowz/fflate) para ZIPs en cliente. Nginx en Docker, deploy en CapRover sobre VPS. Cero backend: el servidor solo sirve estáticos.

**100% en el navegador, sin backend.** El original tenía Flask para hacer la conversión server-side; las ROMs subían al servidor y volvían convertidas. Acá la conversión ocurre íntegramente en el cliente usando `ArrayBuffer` y `Blob`. Razones: (1) ROMs son archivos personales del usuario, no tiene por qué pasar nada al servidor; (2) elimina toda una capa de infraestructura (workers, storage, límites de tamaño, costos por GB); (3) hace el proyecto trivialmente desplegable como static + Nginx, que es justo lo que mató al original cuando Heroku cerró el grifo.

**Parser de header SNES propio.** La conversión real es trivial (agregar o quitar 512 bytes), pero quería que la UI mostrara qué ROM estás convirtiendo: título interno, región, tipo (HiROM/LoROM), modo de video (NTSC/PAL), coprocessor (SA-1, SuperFX, DSP-1…), tamaño declarado, checksum. Eso fue meterme a leer la [especificación del header de SNES](https://snes.nesdev.org/wiki/ROM_header) y portarla a TypeScript. Detección de HiROM vs LoROM por validación de checksum complementario (`checksum + complement === 0xFFFF`), no por nombre de archivo. Side effect inesperado: aprendí bastante de arquitectura SNES como yapa.

**Deduplicación con SHA-256.** Si arrastras 30 ROMs y dos son la misma con distinta extensión, no tiene sentido procesarlas dos veces. Calculo el hash con `crypto.subtle.digest("SHA-256", buffer)` (Web Crypto API nativa, sin dependencias) y omito duplicados. Funciona también para detectar el caso "ya está en el formato destino".

**Batch + ZIP de salida.** Drag & drop de múltiples archivos, procesamiento secuencial con progreso, y al final un único ZIP descargable armado con fflate. fflate va sobre JSZip porque pesa una fracción y es streaming-friendly; para batches grandes la diferencia se nota.

**Hardening del Nginx.** CSP estricta sin `unsafe-inline` ni `unsafe-eval`, HSTS con preload, `X-Frame-Options: DENY`, COOP/CORP/COEP para aislamiento, `Permissions-Policy` cerrando casi todo. Sobreingeniería para una app que convierte ROMs, sí, pero también es práctica para mí: el mismo `nginx.conf` me sirve de plantilla para los otros estáticos que despliego en el VPS.

**PWA con instalación offline.** Como toda la lógica ya vive en el cliente, hacerlo instalable y funcional sin red era casi gratis. Service worker cacheando el shell, manifest con íconos, y queda como app nativa en el dock si quieres.

## Outcomes

- **Live en producción** en [smc2sfc2.app.etejeda.dev](https://smc2sfc2.app.etejeda.dev), reemplazando el deploy original caído.
- **Stack reducido a la mitad**: Flask + React + Webpack + Heroku → Astro + TypeScript + Nginx + VPS. Menos piezas que mantener, menos cosas que se pueden romper en 10 años.
- **Privacidad por construcción**: las ROMs nunca salen del navegador. No hay servidor que pueda filtrar, perder o ser hackeado.
- **Crédito al autor original mantenido** en el repo y en la app: la idea no es mía, el rescate sí.
- **Un proyecto de hace 10 años respira de nuevo**: pequeño, pero el tipo de utility tool que cuando no existe te das cuenta de cuánto la usabas.
