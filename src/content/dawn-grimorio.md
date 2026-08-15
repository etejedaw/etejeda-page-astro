---
title: Dawn Grimorio
short: DG
description: "Fork del tema oficial de Ghost (Dawn) personalizado para blog.etejeda.dev, construido con asistencia de IA. Más de cuarenta cambios sobre el original: dark mode rediseñado para lectura nocturna, TOC sticky con heading activo, barra de progreso, copiar código, share híbrido y 404 narrativo. Sin jQuery, sin Owl Carousel, deploy automático vía GitHub Actions."
tags: [Ghost, Handlebars, GitHub Actions, Claude Code]
color: "#8b5cf6"
category: Personal
year: "2026"
github: https://github.com/etejedaw/ghost-blog-dawn
url: https://blog.etejeda.dev
image: ../assets/dawn-grimorio-home.png
gallery:
    - src: ../assets/dawn-grimorio-toc.png
      caption: "TOC sticky a la derecha con heading activo destacado en color accent, sobre el dark mode rediseñado para lectura nocturna"
    - src: ../assets/dawn-grimorio-404.png
      caption: "Página 404 propia en español con CTAs y sección 'Pero quizá te interesen estos posts' (3 destacados con fallback a recientes)"
---

## Contexto

Quería un blog para escribir y elegí [Ghost](https://ghost.org/) por encima de las opciones SSG (Astro, Hugo, Eleventy). El razonamiento fue práctico: si quiero que escribir sea una práctica sostenida, el rozamiento de "abrir el repo, escribir markdown, commitear, esperar el build, revisar el deploy" termina siendo un freno. No me quiero complicar la vida, por eso un CMS con editor decente, drafts, scheduling y members built-in baja ese rozamiento a "abrir el admin y escribir". El precio es resignar parte del control que da un SSG; el beneficio es que efectivamente publico.

El tema base elegido fue [Dawn](https://github.com/TryGhost/Dawn), el oficial de Ghost: limpio, minimal, bien estructurado. Pero "bien estructurado" no es lo mismo que "lo que yo quiero": la paleta no calzaba con [etejeda.dev](https://etejeda.dev), el dark mode era demasiado contrastado, el carrusel de featured posts arrastraba jQuery y Owl Carousel, faltaban cosas que para mí son canónicas en un blog técnico (TOC, barra de progreso, botón de copiar código) y la página de error era el fallback genérico de Ghost. En vez de empezar de cero o tragarme las decisiones por defecto, lo forkié y lo fui empujando hacia lo que quería.

**Sobre la IA en el proceso.** Buena parte del trabajo se hizo con Claude Code. No es un proyecto "generado con IA" en el sentido vago, es un proyecto donde yo decidí qué quería, por qué, y dónde encajaba cada cosa, y usé IA para acelerar la implementación, descubrir APIs de Ghost que no conocía y discutir tradeoffs en voz alta. Lo dejo explícito porque el flujo "humano dirige, IA ejecuta y propone" es parte de cómo trabajo hoy y no tiene sentido esconderlo.

## Decisiones técnicas

**Stack:** Ghost 5.x + Handlebars + Gulp para CSS/JS + GitHub Actions para deploy. Fork directo de [TryGhost/Dawn](https://github.com/TryGhost/Dawn) con upstream configurado para traer parches del original.

**Eliminé jQuery y Owl Carousel del bundle.** Dawn arrastraba jQuery 3.5.1 desde CDN (~87kb) y Owl Carousel para el slider de featured posts. Reemplacé el carrusel por scroll-snap CSS nativo + ~50 líneas de JS vanilla con botones prev/next, estado disabled y swipe nativo en móvil. Más rápido, menos dependencias, menos superficie de cosas que se rompen cuando Ghost actualice.

**Dark mode repintado para lectura nocturna.** El default de Dawn en oscuro es high contrast puro: funciona, pero cansa después de varios párrafos. Suavicé los backgrounds, ajusté los grises para que el cuerpo de texto cumpla WCAG AA contra el fondo, y agregué un toggle manual sol/luna en el header con persistencia entre navegación (override del `prefers-color-scheme`).

**TOC sticky con heading activo.** En posts de 8+ minutos aparece una tabla de contenidos plegable debajo de la imagen. En pantallas ≥1400px el TOC se transforma en panel fijo a la derecha del contenido, con fade-in cuando entras al cuerpo y fade-out cuando llegas al final (no pelea con related posts ni footer). El heading visible en el tercio superior del viewport se marca en el TOC con color accent usando `IntersectionObserver`, sin polling. Lista H2 y H3, excluye headings de cards de Ghost (signup, CTA) y se oculta si el post tiene menos de 2 headings útiles.

**Share híbrido por contexto.** En desktop muestra botones rápidos de WhatsApp y Telegram al lado del botón Share (que abre el modal de Ghost con Twitter/Facebook/LinkedIn/Bluesky/copy link). En móvil/tablet el botón Share dispara directamente `navigator.share()` con la hoja nativa del SO y los botones rápidos se ocultan. La elección por dispositivo no es estética: en móvil la hoja nativa es objetivamente mejor (más apps, menos clics); en desktop no existe y el modal de Ghost compensa.

**Members con identidad propia.** Saludo de bienvenida personalizado en home para members logueados ("Bienvenido al Grimorio, _{nombre}_") con pool de 10 frases y 6 prefijos invariables (joven/alquimista/ilustre/venerable/honorable/noble) elegidos al azar por visita. Despedida al final del post con el mismo sistema. Línea sutil de aniversario ("Llevas X días en el Grimorio") calculada desde `created_at` vía `/members/api/member/` (Ghost no expone ese campo en Handlebars). 404 narrativo distinto para members vs. anónimos. Pequeño, pero el tipo de detalle que hace que un member sienta que el sitio le habla a él y no a un visitante anónimo.

**JSON-LD `BlogPosting` schema inyectado en cada post** para rich snippets en buscadores. Costo bajo, beneficio SEO concreto.

**Deploy automático vía GitHub Actions.** Push a `main` → build con Gulp → deploy a Ghost vía [TryGhost/action-deploy-theme](https://github.com/marketplace/actions/deploy-ghost-theme). Cache de `node_modules` con `actions/cache@v4` y key del hash de `package-lock.json`: cuando hay cache hit, el step de `npm ci` se salta entero (~13s ahorrados por run). Solo se reinstala cuando cambia el lock.

**Upstream configurado.** El repo mantiene a [TryGhost/Dawn](https://github.com/TryGhost/Dawn) como remote upstream, así que parches de seguridad o mejoras del tema oficial se pueden mergear (con conflictos esperables en los archivos que más divergieron: `main.js`, `featured-posts.hbs`, `default.hbs`, varios CSS).

## Outcomes

- **Live en producción** en [blog.etejeda.dev](https://blog.etejeda.dev) sirviendo todos los posts del sitio.
- **Bundle más liviano**: jQuery y Owl Carousel fuera, carrusel reescrito en ~50 líneas de vanilla JS con scroll-snap nativo.
- **Lectura nocturna usable**: dark mode reajustado para no cansar después de varios párrafos, con toggle manual que sobrescribe el `prefers-color-scheme` del SO.
- **Flujo de escritura sin rozamiento**: abrir el admin de Ghost, escribir, publicar. Sin builds locales, sin PRs para corregir un typo.
- **Flujo de desarrollo con IA documentado en el repo**: el README lista las ~40 features con su racional, así que cualquier persona (incluido yo en 6 meses) puede entender por qué cada cambio existe.
