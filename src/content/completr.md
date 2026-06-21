---
title: Completr
short: C
description: "Aplicación web para hacer seguimiento a tu backlog de videojuegos: pendientes, jugando, completados, abandonados. Inspirada en Trakt pero enfocada en gaming, con un sistema de ratio (puntaje / duración estimada) que prioriza qué jugar primero. Proyecto 100% personal, backend y frontend hechos íntegramente por mí. Actualmente en beta cerrada, abierta a invitaciones."
tags: [Express, PostgreSQL, Angular, PWA, CapRover]
color: "#8b5cf6"
category: Personal
year: "2026"
url: https://www.completr.app
image: ../assets/completr.png
gallery:
    - src: ../assets/completr-games.png
      caption: "Vista de descubrimiento: featured juego del momento + carrusel de últimos agregados"
    - src: ../assets/completr-feed.png
      caption: "Feed de actividad: historial de juegos iniciados, completados, abandonados o añadidos a backlog"
order: 3
---

## Contexto

Completr nace de [un video de YouTube](https://www.youtube.com/watch?v=yCWmnEHR1CI) donde un creador explica cómo prioriza qué juegos jugar usando una hoja de cálculo: por cada juego anota su puntaje (Metacritic), su duración estimada (HowLongToBeat) y calcula un **ratio = puntaje / duración**. Mientras más alto el ratio, más "vale la pena". Un juego corto y bien puntuado gana sobre uno largo y mediocre. Florence (82 pts, 1h) → ratio 82.0; Crash Bandicoot (82 pts, 6h) → ratio 13.67. Para alguien con backlog grande, ese número decide qué empezar el fin de semana.

Copié el Excel del video, lo personalicé, empecé a agregar columnas (estado, plataforma, fecha de finalización, semestre), lo compartí con amigos y terminamos pasándonos versiones del archivo. En algún momento era obvio que el Excel ya no escalaba: tenía que ser una app. Completr empezó como una app para mí mismo y de a poco se fue volviendo para más gente.

Es un **proyecto 100% personal**, sin cliente. Backend (Node + Express), frontend (Angular + PWA), infra (CapRover sobre VPS), diseño y producto, todo lo llevo yo. La ventaja: cada decisión técnica nace del uso real, porque soy el primer usuario que sufre cuando algo está mal.

Hoy está en **beta cerrada**, abierta a quien quiera probarla.

## Decisiones técnicas

**Stack:** Node 22 + Express 5 + TypeScript + PostgreSQL (Sequelize 6) en backend; Angular + PWA en frontend; Zod 4 como única fuente de validación; Pino para logs; Helmet + CORS + rate-limiter-flexible para hardening. Despliegue en CapRover sobre VPS.

**Sistema de puntajes en tres niveles**, la decisión más distintiva del diseño. Los puntajes y duraciones de un juego viven en tres lugares según el contexto:

1. **Catálogo global por fuente**: tablas separadas para puntaje (Metacritic, OpenCritic, RAWG, comunidad) y para duración (HowLongToBeat, RAWG, comunidad), con UUID propio y unique index en (juego, fuente). Cada fuente se actualiza independientemente vía cron mensual. La ficha del juego muestra todas las disponibles.
2. **Datos del usuario en su backlog**: al añadir un juego a tu backlog se precarga el puntaje y duración de la fuente preferida (Metacritic + HLTB por default), pero puedes editarlos manualmente. De aquí sale el ratio que vas a ver en tu cola.
3. **Datos congelados en listas curadas**: al armar una lista temática ("RPGs cortos sub-5h", "Saga Resident Evil"), los items copian puntaje y duración desde la fuente declarada por la lista. No editable manualmente, solo refrescable como bloque.

¿Por qué tres? Cada nivel responde una pregunta distinta del producto: el catálogo dice _qué se sabe del juego_ (objetivo, multifuente), el backlog dice _cómo lo voy a evaluar yo_ (subjetivo, editable), y la lista dice _esta colección está cerrada bajo una vara consistente entre todos los que la ven_. Mezclarlos llevaría al problema típico del Excel: un campo "puntaje" ambiguo del que nadie sabe si es Metacritic, tu opinión o lo que recuerdas.

**Backlog inspirado en Trakt.** Cada vez que un usuario quiere, inicia o reinicia un juego se crea un **nuevo** registro de tracking, no se reutilizan. El estado actual sobre un juego se deriva del backlog más reciente; el contador de veces jugado se calcula contando filas. Esto permite comparar runs ("lo completé en 8h en PSX, después en 5h en Steam") y respeta el caso real: rejugar es una experiencia nueva, no un edit de la anterior.

**Vistas vs Listas, dos modelos distintos.** En el Excel original todo era "lista", pestañas con filtros confundidas con colecciones curadas. Acá los separé:

- **Vistas** = filtros sobre tu backlog (Completados, Pendientes, Semestre 2025-S01). Son query params guardables como vista con nombre, no tablas separadas.
- **Listas** = colecciones curadas con puntajes congelados de una fuente declarada ("Saga Resident Evil", "TOP 10 RPGs cortos"). Cualquier usuario puede crear y compartir, estilo Trakt/Letterboxd.

**Modularización por bounded context.** Cada módulo del backend (`games`, `backlogs`, `lists`, `wishlist`, `favorites`, etc.) es autocontenido con router, controlador, servicio, modelos, validaciones y errores. Regla firme: los módulos se cruzan vía el servicio del módulo dueño, no importando modelos ajenos. Sin esta disciplina el grafo de dependencias se vuelve un plato de spaghetti rápido.

**Errores en tres capas** (`ServiceError → DomainError → HttpError`). El servicio lanza errores de negocio sin saber de HTTP; un middleware global los normaliza al formato Problem Details (RFC 9457). Cada módulo declara sus códigos en una tabla; el normalizer solo delega. Sumar un módulo nuevo no requiere tocar código común.

**Toda la lógica de cálculo en backend.** Ratios, estadísticas, status derivado, ratios personales, todo se calcula server-side. El frontend solo renderiza. Permite cambiar la fórmula del ratio (o agregar uno nuevo) sin tocar el cliente Angular.

**RBAC con cuatro roles** (`user`, `premium`, `moderator`, `admin`) + registro público cerrado: solo el admin crea usuarios. Es deliberado para la fase actual, invitar persona por persona da control sobre el feedback temprano y previene crecimiento descontrolado de datos sucios mientras itero rápido en el modelo.

## Outcomes

- **Live en producción** en [completr.app](https://www.completr.app), en beta cerrada y abierta a quien quiera probarla.
- **El Excel original quedó obsoleto**: lo que arrancó como una hoja de cálculo personal escaló a una app multi-usuario con catálogo global, ratios, vistas guardables y listas compartibles.
- **Desarrollo guiado por feedback de usuarios reales** (incluido el mío). Roadmap a corto plazo: sincronización con Steam, listas colaborativas y estadísticas anuales, todo viene de cosas que los usuarios beta y yo hemos venido pidiendo en el día a día.
- **Hecho por alguien que lo usa, para gente que juega**: cada decisión de producto y de código pasa por "¿esto me molestaría a mí jugando?". Es lo que permite resolver problemas reales y no inventados.
