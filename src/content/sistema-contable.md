---
title: Sistema Contable
short: SC
description: Digitalización modular de una oficina de contabilidad que trabajaba con papel. Reemplazó libros físicos de seguimiento mensual (renta, IVA, F29) y fichas de clientes por una plataforma centralizada. 3+ módulos en producción, en evolución activa.
tags: [NestJS, TypeScript, PostgreSQL, Coolify]
color: "#ef4444"
category: Freelance
year: En curso
image: ../assets/contabilidad-inicio.png
gallery:
    - src: ../assets/contabilidad-usuarios.png
      caption: "Gestión de usuarios: lista paginada con nombre, apellido, correo y rol asignado"
    - src: ../assets/contabilidad-iva.png
      caption: "Declaraciones IVA del mes: tabla por cliente con fecha límite, credenciales SII/certificado enmascaradas y estado de declaración"
disclaimer: "Las capturas muestran un entorno de demo con datos ficticios. En producción el sistema opera con la información real de la oficina contable."
order: 1
---

## Contexto

_Contenido detallado próximamente — el problema que tenían, por qué papel ya no escalaba, qué procesos eran críticos._

## Decisiones técnicas

_Por qué NestJS sobre Express, modelo de datos para fichas de clientes, arquitectura modular para que cada nuevo proceso sea un módulo independiente._

## Outcomes

- 3+ módulos en producción
- Libros físicos de RENTA, IVA y F29 reemplazados
- En evolución activa con el cliente
