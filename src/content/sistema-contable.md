---
title: Sistema Contable
short: SC
description: "Sistema interno para una oficina contable: gestión de clientes, generación automática de declaraciones IVA mensuales, indicadores económicos al día y panel para el staff. Reemplazó un flujo de planillas impresas y check manual por una plataforma única que centraliza el estado de cada cliente. Más de 100 clientes activos, en evolución activa con nuevas features periódicas."
tags: [NestJS, TypeScript, PostgreSQL, Coolify]
color: "#ef4444"
category: Freelance
year: "2025"
image: ../assets/contabilidad-inicio.png
gallery:
    - src: ../assets/contabilidad-usuarios.png
      caption: "Gestión de usuarios del staff: lista paginada con nombre, apellido, correo y rol asignado"
disclaimer: "Las capturas muestran un entorno de demo con datos ficticios. En producción el sistema opera con la información real de la oficina contable."
---

## Contexto

Una oficina contable que gestiona más de **100 clientes activos**. Hasta antes de este sistema, el flujo era completamente manual: una planilla con los clientes que se imprimía y se chequeaba a mano cada mes para llevar el control de qué declaraciones de IVA ya estaban hechas.

Puntos de dolor típicos de ese tipo de flujo:

- **Doble visita al mismo cliente** cuando dos personas del staff hacían el IVA del mismo cliente por falta de coordinación visible en tiempo real.
- **Falta de sincronización al actualizar datos del cliente**: cuando alguien actualizaba información de un cliente, el resto del equipo no se enteraba hasta que la siguiente persona la necesitaba.
- **Declaraciones olvidadas**: con más de 100 clientes y revisión visual sobre papel, era frecuente acordarse de un IVA pendiente un mes después con el riesgo de multa del SII asociado.

El staff actual son 2 personas pero el sistema está diseñado para escalar con el equipo.

Mi rol fue consultoría + decisiones de arquitectura + desarrollo backend completo; el frontend lo lleva mi compañera. Una ventaja en este proyecto: yo trabajé como asistente contable antes, así que el dominio (RUT, IVA, F29, plazos del SII, certificado digital) no necesité aprenderlo desde cero. Entiendo cómo trabaja una oficina contable día a día.

## Decisiones técnicas

**Stack:** NestJS 11 + TypeScript + PostgreSQL (TypeORM) + JWT (Passport) + class-validator + class-transformer. Despliegue en Coolify sobre VPS.

**Modularización por dominio.** El backend está dividido en módulos por contexto de negocio (clientes, declaraciones IVA, indicadores económicos, usuarios del staff, autenticación), cada uno autocontenido con su controlador, servicio, entidades, DTOs y errores. Un cambio queda localizado en un módulo en vez de tocar varias carpetas técnicas.

**RBAC con tres niveles** (Manager, Admin, User). La oficina recibe periódicamente practicantes y refuerzo de temporada en verano, así que no tendría sentido que todos tuvieran los mismos permisos: los roles permiten abrir capacidades por persona según su confianza, antigüedad y vínculo con la oficina. Los endpoints sensibles se decoran y un guard verifica el rol del JWT contra los permitidos; el rol viaja en el payload del token.

**Generación automática de declaraciones IVA mensuales.** Un job programado se ejecuta el día 1 de cada mes y recorre todos los clientes activos creando su registro de declaración del mes con estado "no declarado". El staff abre el panel ese día y ya tiene el tablero completo de qué falta declarar; las declaraciones dejan de depender de la memoria del equipo.

**Cascada al alta de cliente.** Cuando se da de alta un cliente nuevo, automáticamente se genera su primer registro de declaración del mes en curso para que entre al flujo desde el día uno, sin esperar al próximo job mensual.

**Indicadores económicos al día.** Un módulo dedicado consulta una API pública chilena para mostrar el valor UTM y otros indicadores relevantes para la operación contable, evitando que el staff tenga que ir a buscarlos manualmente cada vez.

**Restricción de unicidad estructural (cliente + mes) para declaraciones IVA.** Un cliente solo puede tener una declaración por mes a nivel de base de datos, no solo a nivel de aplicación. Defensa estructural contra duplicados aunque el código se equivoque o una request llegue dos veces.

## Outcomes

- **Sistema en producción**, reemplazando completamente el flujo de planillas impresas + check manual.
- **Visibilidad compartida en tiempo real**: el staff ve simultáneamente qué cliente ya fue declarado este mes y quién lo hizo, la doble visita por descoordinación deja de pasar.
- **Cero declaraciones perdidas**: el job mensual asegura que todos los clientes activos aparecen en el tablero del mes desde el día 1; ya no se descubre un IVA olvidado un mes después.
- **Datos del cliente sincronizados**: cualquier actualización (datos de contacto, plazo asignado, estado) la ve todo el equipo de inmediato.
- **Sistema en evolución activa**: liberamos features nuevas con cierta regularidad, ajustando el sistema al flujo real del staff a medida que el día a día revela necesidades. Es un proyecto de iteración continua, no un entregable cerrado.
