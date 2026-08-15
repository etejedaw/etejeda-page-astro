---
title: CORE Model
short: CM
description: "Pipeline ETL para mi tesis de Ingeniería Civil en Informática, hecho con el PRU-Lab dentro de un proyecto FONDECYT sobre resiliencia comunitaria ante tsunamis en la costa chilena. Recopila indicadores sociales desde fuentes abiertas heterogéneas (HTML, APIs JSON, PDFs, planillas), las normaliza y las publica como dashboards en Metabase. Arquitectura modular con adapters para que sumar una fuente nueva no requiera reescribir el core. Sistema funcional; defensa pendiente."
tags: [TypeScript, Node.js, MongoDB, Metabase]
color: "#3b82f6"
category: Investigación
year: "2022"
github: https://github.com/etejedaw/coremodel-fondecyt-node
order: 6
---

## Contexto

Este es mi proyecto de título de Ingeniería Civil en Informática, hecho con el [PRU-Lab](https://www.pru-lab.cl/) dentro de un proyecto FONDECYT: _"Resiliencia comunitaria ante tsunami en la costa chilena: modelando escenarios multidimensionales con una aproximación participativa"_. La idea del proyecto madre es bastante directa de explicar y muy difícil de operacionalizar: si vas a invertir dinero público en preparar a una comuna costera para un tsunami, ¿en cuál inviertes primero? ¿En qué dimensión? Para responder eso, necesitas un índice comparable entre comunas. Y para tener un índice, necesitas los datos.

Los datos no están en un lugar. Están desperdigados entre el INE, ONEMI, la Biblioteca del Congreso Nacional, CASEN, SUBDERE, SINIM y un largo etcétera. Cada uno publica como puede: algunos exponen API JSON, otros tienen tablas HTML, otros sueltan PDFs anuales, otros mandan planillas Excel a quien las pide. El equipo del lab venía haciendo este trabajo a mano, descargando y limpiando, y se demoraba semanas en actualizar un solo indicador.

Mi tesis fue construir el software que automatiza ese pipeline: **un sistema modular donde cada fuente nueva se declara como una pieza de configuración y se enchufa al motor común**, sin tocar nada del core. El objetivo era que un futuro tesista o un investigador del lab pudiera sumar el indicador N+1 sin tener que entender todo el sistema, solo escribir el pedazo específico de su fuente.

El sistema **está listo y funcionando**, corriendo crons, poblando MongoDB, alimentando dashboards de Metabase. Lo que me queda es la defensa y ver si sale a producción para un uso real.

## Decisiones técnicas

**Stack:** Node 18 + TypeScript + Express para la API + MongoDB (Mongoose) como almacenamiento + node-cron como scheduler + Metabase para visualización. Para scraping uso cheerio (HTML), request-promise (HTTP simple), puppeteer (páginas con JS) y xlsx (planillas). Todo en Docker Compose para que un nuevo desarrollador levante el stack completo con un comando.

**Arquitectura de adapters: cada indicador es una configuración.** El corazón del sistema es la idea de que cualquier indicador, no importa la fuente, se puede describir como una composición de seis piezas intercambiables:

1. **FetchAdapter**: cómo obtener la data cruda (HTTP simple, navegador headless, descarga de archivo, etc.).
2. **ParseAdapter**: cómo extraer estructura del crudo (parsear HTML, deserializar JSON, leer celdas de Excel).
3. **MapperAdapter**: cómo normalizar la estructura al formato interno del proyecto.
4. **HashAdapter**: cómo construir una key única para cada registro (para detectar duplicados sin reprocesar).
5. **StorageAdapter**: cómo persistir el crudo en MongoDB.
6. **CalculatorAdapter** (opcional): cómo agregar el crudo en un resultado calculado, con historial.

Un indicador se declara con un `IndicatorBuilder` que es básicamente `setName().setUrl().setFrequency().setFetchAdapter(...)...build()`. El módulo no necesita saber nada del CronRegistry, del manejo de errores ni del ciclo ETL. **Sumar una fuente nueva es escribir adapters específicos y registrar el módulo**; el core ya sabe orquestar.

**Cuatro FetchAdapters cubren todo el espectro de fuentes públicas chilenas que probé:**

- `RequestPromiseAdapter` para scraping de HTML estático (BCN tasa de pobreza, registros de simulacros).
- `JsonFetchAdapter` para APIs JSON (BCN organizaciones comunitarias).
- `PuppeteerAdapter` para páginas que renderizan en cliente y no entregan el dato en el HTML inicial.
- `DownloadAdapter` para CSV/XLSX publicados como link estático.

Cada uno implementa la misma interfaz, así que el resto del pipeline es ignorante de cómo llegó el dato.

**Deduplicación a nivel de schema, no de aplicación.** Cada registro lleva un campo `key` único generado por el HashAdapter del módulo (típicamente algún hash determinístico de los campos identificadores: comuna + año + indicador). El schema de Mongoose declara ese campo como `unique: true`, así que la deduplicación la hace el motor de base de datos. Si un cron reprocesa los mismos datos, el insert duplicado revienta con un error que el sistema atrapa y sigue. No hay "consulto si existe antes de insertar", esa carrera siempre se pierde tarde o temprano. Confiar en el índice único es más simple y más correcto.

**CalculatorAdapter con historial sin duplicados.** Los datos crudos se guardan en colecciones por módulo (`emergencia-desastres`, `tasa-pobreza-ingresos`, etc.). Encima, una colección `indicator-results` guarda los resultados calculados, por ejemplo, "cantidad de organizaciones comunitarias por comuna en 2024". Cada CalculatorAdapter, antes de insertar, compara su resultado con el último registro existente para ese indicador: si nada cambió, no escribe. Eso me da un timeline limpio de cuándo cambió realmente el indicador, sin filas redundantes por cada vez que corrió el cron.

**Errores en dos capas: `DomainError → ServiceError`.** Los errores de negocio (URL no responde, parsing falla, columna esperada no aparece) se lanzan como `DomainError` desde los adapters; el ScrapeBase los envuelve en `ServiceError` antes de que lleguen al handler de Express. La capa HTTP nunca ve el detalle interno; el log estructurado en pino sí. Si una fuente cambia su HTML y rompe el parser, el cron sigue corriendo el resto de los indicadores y el error queda registrado para revisión.

**Metabase como front-end del proyecto.** Decidí no escribir un dashboard custom. Metabase lee directo de MongoDB, los investigadores arman sus propios queries en una UI gráfica y los dashboards se actualizan solos a medida que el CronRegistry pobla las colecciones. Para un proyecto de tesis con un equipo no-técnico, sacarle de encima la UI fue una decisión correcta me libera para concentrarme en lo que sí es novedoso (el pipeline) en vez de reinventar Tableau.

**Tests cubriendo cada pieza del ETL.** Cada ParseAdapter, MapperAdapter y HashAdapter tiene tests unitarios contra fixtures reales descargadas de la fuente. Además hay tests de integración del flujo completo (parse → map → hash) y validaciones contra datasets de referencia chequeados a mano. Cuando una fuente cambia y algo se rompe, el test apunta al adapter exacto que falló, no al sistema entero.

## Outcomes

- **Sistema funcional**, alimentando MongoDB con datos de varias fuentes institucionales y publicando dashboards en Metabase.
- **De semanas a minutos**: actualizar un indicador pasó de ser un trabajo manual de descarga + limpieza, a un cron que corre solo según la frecuencia declarada de cada fuente.
- **Extensible por construcción**: el siguiente tesista del lab puede sumar una fuente nueva escribiendo solo sus adapters y registrando el módulo, sin tocar el core ni entender el ciclo ETL completo.
- **Documentación dura**: README con paso a paso para crear un módulo nuevo, colección Bruno con todos los endpoints de la API, guía de setup de Metabase, y tests como contrato de comportamiento de cada adapter.
- **Tesis lista; defensa pendiente.** El software cumple sus objetivos; lo que me falta es presentar.
