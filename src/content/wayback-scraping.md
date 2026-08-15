---
title: Wayback Scraping
short: WB
description: "Pipeline en Node + TypeScript para extraer millones de snapshots históricos de care.com desde Wayback Machine, como insumo de un paper del Prof. Luis Ignacio Valenzuela sobre brechas de género en la gig economy estadounidense durante la pandemia. Mi primera colaboración con un proyecto FONDECYT; el antecesor directo (en aprendizajes y en errores) del CORE Model."
tags: [TypeScript, Node.js, Web Scraping, Wayback Machine]
color: "#10b981"
category: Investigación
year: "2021"
github: https://github.com/etejedaw/caredotcom-fondecyt-node
---

## Contexto

Esta fue mi primera colaboración con un equipo de investigación. El Prof. Luis Ignacio Valenzuela necesitaba datos para un paper sobre cómo la pandemia reconfiguró el mercado de cuidados en Estados Unidos: _"From automation to home production via the gig economy: a novel gender-based analysis"_. La fuente natural era [care.com](https://www.care.com/), la plataforma estadounidense más grande para contratar cuidadores, niñeras, paseadores de perros y servicios domésticos por hora: una de las pocas vitrinas públicas donde ves precios, ofertas y demanda de trabajo doméstico en tiempo casi real.

El problema: care.com cambia su catálogo a diario. Cuando alguien postula un cuidador o cierra un trabajo, el listado desaparece. Si querías datos del peak de la pandemia (2020-2021) en 2021, ya no estaban en el sitio. La única manera de recuperarlos era ir a [Wayback Machine](https://web.archive.org/) y reconstruir el mercado a partir de las copias históricas que el archivo guardó cada vez que pasó por esas páginas.

Mi pega fue construir el software que automatiza esa reconstrucción: generar **todas** las combinaciones de URLs relevantes (cada tipo de trabajo × cada localidad de EE.UU.), preguntarle a Wayback por todos los snapshots existentes de cada una, descargar cada snapshot histórico, parsear el HTML y dejarlo como CSV listo para análisis estadístico. Hablamos de cerca de **60 mil combinaciones de URL** (13 tipos de servicio × 4.638 localidades) y, por cada una, decenas o cientos de snapshots a lo largo del tiempo. Millones de páginas a procesar.

Este es un proyecto de 2021 y se nota: el código es más procedural que arquitectónico, la documentación es justa, no hay tests. Es lo que sabía hacer entonces. Lo dejo en el portfolio porque fue el detonante de lo que después se volvió **CORE Model**: los problemas reales que me encontré acá (fuentes con HTML que cambia, dedup, scheduling, separar la forma de obtener datos de la forma de parsearlos) son exactamente los que la arquitectura de adapters de CORE Model resuelve. Sin este proyecto no había tenido las preguntas correctas para diseñar aquel.

## Decisiones técnicas

**Stack:** Node 16 (lts/gallium) + TypeScript + cheerio para parsing de HTML + node-fetch / request-promise para HTTP + json2csv para la salida. Sin base de datos: el output son CSVs en disco, uno por combinación `<tipo>-<servicio>`, listo para que el equipo del paper lo cargara en R o Stata.

**URLs por combinación, no por crawling.** care.com sigue una convención de URL predecible: `https://www.care.com/<servicio>/<localidad>`, donde servicio es algo como `child-care` o `pet-care` y localidad es un slug tipo `alabaster-al`. En vez de spiderear el sitio (lento, frágil, riesgo de bloqueos), genero las ~60 mil combinaciones por producto cartesiano de dos archivos de texto: `jobs.txt` / `offers.txt` con los servicios, `local_areas.txt` con todas las ciudades. Sumar un servicio nuevo o una región nueva es editar el `.txt`; no hay que tocar código.

**Enumeración de snapshots vía Wayback TimeMap API.** Para cada URL pregunto a `https://web.archive.org/web/timemap/json/{url}`, que devuelve el listado completo de snapshots históricos con su timestamp y URI archivada. Después dedupeo por fecha (mismo día → mismo snapshot semántico, aunque Wayback haya guardado varias copias) y proceso uno por uno.

**Rate limiting simple pero respetuoso.** Wayback es un servicio público y gratuito; saturarlo con miles de requests por minuto sería abusar de él (y además te bloquean rápido). Metí un `Sleep.sleep(400)` antes de cada request de HTML. Lento por diseño: un pipeline que demora días pero termina, antes que uno rápido que se cae a las dos horas.

**Parsing tolerante a HTML que cambia en el tiempo.** Este fue el aprendizaje más caro del proyecto. care.com rediseñó su sitio varias veces entre 2018 y 2021, y los snapshots de distintas épocas tienen estructuras HTML completamente distintas. Mantuve dos pipelines paralelos (`ScrapeJobs` y `ScrapeOffers`) cada uno con su provider + page-data, con selectores múltiples por campo: si el primero no encuentra, probamos el siguiente. Funcional, pero frágil, y es la razón principal por la que el CORE Model separó después `FetchAdapter` de `ParseAdapter` como ciudadanos de primera clase del diseño.

**Streaming a CSV en disco.** Decisión deliberada de _no_ guardar todo en memoria ni en una base intermedia. Cada snapshot procesado se appendea inmediatamente al CSV correspondiente. Si el proceso se cae a las 12 horas, lo perdido es solo el snapshot en curso; el resto está en disco. Para un pipeline tan largo, la durabilidad de los resultados parciales valía más que cualquier elegancia arquitectónica.

**Manejo de fallos por log, no por reintentos automáticos.** Cuando una URL no responde o un snapshot no tiene HTML válido, se imprime el error y se sigue. No hay cola de reintentos ni backoff exponencial. La razón es práctica: con millones de snapshots, una tasa de fallo del 1-2% sigue dejando datos suficientes para el análisis estadístico; gastar complejidad en recuperar cada caso individual no movía la aguja para la pregunta del paper.

## Outcomes

- **Insumo del paper publicado** del Prof. Luis Ignacio Valenzuela sobre brechas de género en la gig economy estadounidense durante la pandemia.
- **Millones de snapshots procesados** a CSV, cubriendo trece tipos de servicio en miles de localidades de EE.UU. a lo largo de varios años de archivo.
- **Cero costo de infraestructura**: el pipeline corre en un notebook, escribe a disco, no requiere servidores ni base de datos. Cualquier investigador del lab podía relanzarlo desde cero con un `npm ci && npm start`.
- **Detonante del CORE Model.** Los dolores reales de este pipeline (HTML que cambia, dedup, rate limiting, separar fetch de parse) son exactamente las decisiones que llevaron a la arquitectura de adapters de mi tesis.
