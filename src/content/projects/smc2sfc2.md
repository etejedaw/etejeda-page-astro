---
title: SMC2SFC2
short: SF
description: "Conversor de ROMs de SNES (.smc ↔ .sfc) que corre 100% en el navegador. Fork de un proyecto abandonado hace 10 años, migrado de JS + Flask a Astro. Añadí drag & drop, procesamiento múltiple, lectura de metadatos, deduplicación con SHA-256 y soporte PWA. Live en producción."
tags: [Astro, TypeScript, PWA, CapRover]
color: "#06b6d4"
category: Personal
year: "2026"
github: https://github.com/etejedaw/smc2sfc2
url: https://smc2sfc2.app.etejeda.dev
image: ../../assets/projects/smc2sfc2.png
order: 4
---

## Contexto

_Contenido detallado próximamente — el proyecto original (abandonado hace 10 años), por qué tomar fork vs empezar de cero, casos de uso (preservación, emulación)._

## Decisiones técnicas

_Procesamiento 100% en el navegador (Web Workers), lectura de header de ROM SNES, SHA-256 para deduplicación, migración JS+Flask → Astro._

## Outcomes

- Live en producción
- Drag & drop + batch processing
- PWA con instalación offline
- Lectura de metadatos de ROM
