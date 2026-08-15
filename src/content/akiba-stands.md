---
title: Akiba Stands
short: AK
description: "Plataforma para gestionar las postulaciones y asignación de stands en Akiba Festival, evento anual de cultura japonesa en Valdivia. Reemplazó un flujo manual de planillas, correo y mensajería por un único sistema con postulación, selección de stands, mapa de disponibilidad y confirmación de pago. Sistema en producción."
tags: [Express, TypeScript, PostgreSQL, Sequelize, Coolify]
color: "#f59e0b"
category: Freelance
year: "2026"
image: ../assets/akiba-dashboard.png
gallery:
    - src: ../assets/akiba-postulaciones.png
      caption: "Postulaciones recibidas: tabla con estado, recaudación por categoría y filtros (estado, pago, huérfanos)"
    - src: ../assets/akiba-recinto.png
      caption: "Mapa del recinto: vista de stands con ocupación, categorías Arcano/Runa/Mana/Kami y total de stands disponibles"
disclaimer: "Las capturas muestran un entorno de demo con datos ficticios. En producción el sistema opera con la información real de Akiba Festival."
---

## Contexto

Akiba Festival es un evento anual de cultura japonesa en Valdivia. Hasta antes de este sistema, los stands se gestionaban con un flujo manual basado en planillas paralelas, correo y mensajería directa con cada postulante.

Puntos de dolor típicos de ese tipo de flujo:

- **Riesgo de doble venta** cuando varios canales actualizan el mismo dato de disponibilidad y la sincronización es manual.
- **Pérdida de trazabilidad** del historial de cada postulante repartido entre mensajería, correo y notas sueltas.
- **Verificación lenta de pagos** cruzando comprobantes contra planillas a mano.

El recinto tiene **54 stands** y la ventana de venta es corta (el día que abre la inscripción se concentra la demanda). Es la primera edición operando con plataforma; el sistema está actualmente en producción recibiendo postulaciones.

Mi rol fue consultoría + decisiones de arquitectura + desarrollo backend completo. Diseño y desarrollo del frontend lo lleva mi compañera; backend y frontend viven en repos separados.

## Decisiones técnicas

**Stack:** Node 24 + Express 5 + TypeScript + PostgreSQL 17 (Sequelize 6). Zod 4 como única fuente de validación. Deploy: Coolify sobre VPS.

**Modularización por bounded context, no por capa técnica.** Cada carpeta bajo `src/` representa un agregado o conjunto cohesivo del dominio (`events/`, `vendors/`, `stands/`, `reservations/`, `webhooks/`, `notifications/`, etc.) y dentro de cada uno se replica la misma forma: router → controller → service → model + schemas/dtos/serializers/errors. Una sola regla firme: cada capa solo conoce las inferiores. Un cambio queda localizado en un módulo en vez de tocar 3-5 carpetas por feature.

**Pagos: dos rieles convergentes.** El sistema soporta dos modos de pago, pasarela online (con webhook firmado e idempotencia por id de notificación) y transferencia bancaria con confirmación del admin contra el comprobante recibido, seleccionables por configuración. Ambos rieles convergen en una **única transición de estado a "pagado"** definida en un solo punto del código, así que sumar un tercer riel (Webpay, Flow, Khipu) implica solo conectar el nuevo proveedor: los efectos asociados (vender los stands, consumir el token del cliente, cerrar el reloj de expiración) no se duplican ni se vuelven a tocar.

## Outcomes

- **Sistema en producción**, primera edición operando con plataforma.
- **Doble venta eliminada por construcción**: resuelto con locks pesimistas a nivel de fila en Postgres + una máquina de estado donde "vendido" es terminal.
- **Trazabilidad completa**: cada correo transaccional, cada cambio de estado y cada pago manual queda registrado con el admin que lo confirmó y las notas asociadas, todo dentro del sistema.
- **Cambio de modo de pago sin rediseño**: la separación de rieles y la transición de estado centralizada en un solo punto permiten alternar el modo activo sin reescribir lógica.
