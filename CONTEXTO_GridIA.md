# CONTEXTO TÉCNICO — GridIA by LID Marketing

> Documento de contexto para la migración del artefacto a **Google Antigravity**.
> Describe el sistema tal como existe hoy: funciones, lógica, maquetado y datos.
> Fuente de verdad del comportamiento actual. No es una lista de deseos.

**Estado del origen:** artefacto React monolítico, 1 archivo, ~2,320 líneas, ~150 KB.
**Destino:** aplicación modular en Antigravity con Gemini 3.1 Pro (thinking level: high).

---

## 1. QUÉ ES EL PRODUCTO

Generador de parrillas de contenido para LID Marketing (agencia mexicana de marketing digital, unidad Media & Growth). Produce calendarios editoriales mensuales con copy, dirección de arte y prompts de producción, usando IA.

Opera en **dos espacios de trabajo independientes**, con estado separado que nunca se cruza:

| Espacio | Para qué | Estado |
|---|---|---|
| **Parrillas de cliente** | Clientes de la agencia (Bait, Movistar, etc.), segmentadas por país y zona geográfica con modismos regionales | `form`, `results`, `selectedStates` |
| **LID Marketing** | Redes propias de la agencia, con sistema de marca B2B propio | `lidForm`, `results.lid` |

Regla de aislamiento crítica: **el manual de voz de un cliente jamás debe filtrarse a las publicaciones de la agencia, ni al revés.** Por eso los formularios están duplicados a propósito.

---

## 2. ARQUITECTURA ACTUAL (origen)

### 2.1 Capas lógicas

```
UI (React)
 └── Estado del formulario (form / lidForm)
      └── buildPrompt()          ← construye el prompt según el modo
           └── callWithRetry()   ← reintentos + backoff
                └── callClaudeGrid()  ← HTTP a la API del modelo
                     └── parseGridJSON()  ← parseo + reparación de JSON truncado
                          └── Normalización (fechas, días, créditos, glosario)
                               └── GridTable + exportadores (XLSX / CSV)
```

### 2.2 Módulos que deben existir en el destino

El monolito debe partirse así (esta es la estructura objetivo, no la actual):

```
src/
├── domain/
│   ├── brand/            LID_BRAND, pilares, propiedades, funnel, audiencias
│   ├── regions/          COUNTRIES (10 países × 3 zonas + notas lingüísticas)
│   ├── schema/           Definición del post y de las columnas de parrilla
│   └── credits/          computeCredits()
├── ai/
│   ├── promptBuilder/    buildPrompt() — 3 modos: zona | general | lid
│   ├── client/           callClaudeGrid, callWithRetry, throttle
│   └── parsing/          parseGridJSON, repairTruncatedJSON, pendingClosers
├── data/
│   ├── baseFile/         parseBaseFile, baseResumen, baseDigest, normalizadores
│   ├── trends/           fetchDemandaSEO (proxy externo)
│   └── export/           XLSX y CSV por plantilla
├── ui/
│   ├── theme/            PALETTES (4), tokens, conmutador claro/oscuro
│   ├── components/       GridTable, LoadingBlock, chips, tagbox
│   └── views/            ClienteWorkspace, LidWorkspace
└── app/
```

---

## 3. MODELO DE DATOS

### 3.1 Entidad `Post` (unidad atómica de la parrilla)

Todos los campos que produce la IA. **No inventar campos nuevos sin autorización.**

| Campo | Tipo | Modo | Descripción |
|---|---|---|---|
| `dia` | número | todos | Día del mes (1–30), asignado por la app, no por la IA |
| `fecha` | string | todos | ISO `YYYY-MM-DD`, calculado por la app |
| `diaSemana` | string | todos | "Lunes"…, calculado por la app |
| `hora` | string | todos | 24h `HH:MM`; se muestra en 12h |
| `status` | enum | todos | Pendiente / En diseño / Aprobado / Programado / Publicado |
| `enfoquePublicacion` | enum | todos | Atraer / Convertir / Cerrar / Deleitar (Inbound) |
| `etapaFunnel` | enum | cliente: TOFU/MOFU/BOFU/Fidelización · LID: Awareness/Consideration/Trust/Conversion/Retention |
| `ideaPrincipal` | string | todos | ≤15 palabras |
| `copyIn` | string | todos | Titular, ≤5 palabras |
| `copyOut` | string | todos | Cuerpo, ≤2 párrafos, cierra con CTA del funnel |
| `explicacionArte` | string | todos | ≤35 palabras |
| `formatoArte` | enum | todos | Imagen / Video |
| `masterPromptMidjourney` | string | todos | Inglés, ≤45 palabras |
| `videoDetails` | objeto\|null | todos | `{numEscenas 2–3, videoAITool, promptsEscenasMidjourney[], promptsVideoAI[]}` |
| `pasoAPaso` | string | todos | ≤40 palabras |
| `estadoFoco` | string | cliente | Estado de la república; "Nacional" en general/LID |
| `tecnicismosRegionales` | array | cliente | `{termino, significado}` — vacío en LID |
| `redesSociales` | array | LID | Varias redes por pieza |
| `audiencia` | string | LID | Decisor concreto (CMO, Marketing Manager…) |
| `insight` | string | LID | Verdad de negocio, ≤20 palabras |
| `pilar` | string | LID | Uno de los 7 pilares con su % |
| `propiedad` | string | LID | Propiedad editorial (LID POV, LID Breakdown…) |
| `tipoPost` | string | LID | Formato nativo |
| `temaCampana` | string | LID | Campaña del mes |
| `fichaCanal` | string | LID | Especificación por canal (SEO: keyword/slug/meta; YouTube: título/thumbnail/capítulos) |
| `repurposing` | string | LID | ≤20 palabras |
| `hashtags` | array | LID | 0–3, solo si el subtema coincide; vacío en X |

### 3.2 Plantillas de columnas (orden fijo, replican los XLSX reales de LID)

**Parrilla de cliente** (`TPL_PARAMS`):
`Fecha · Hora · Status · Enfoque (Inbound) · Etapa del funnel · Idea principal · Copy in · Copy out · Formato del arte · Arte`
Extras: `Estado foco · Modismos usados · Master Prompt · Video · Paso a paso`

**Parrilla LID** (`LID_PARAMS`) — replica exacta del template "LID MKT":
`Red social · Fecha · Hora · Status · Enfoque de la publicación (Inbound Marketing) · Etapa del funnel · INSIGHT · Idea principal · Copy in · Copy out · Arte`
Extras: `Día · Audiencia · Pilar · Propiedad editorial · Tema/Campaña · Ficha de canal · Repurposing · Hashtags · Tipo de post · Formato del arte · Master Prompt · Video · Paso a paso`

> La tabla se renderiza **transpuesta**: parámetros como filas, días como columnas. Es el formato de trabajo real de LID. No cambiar.

### 3.3 Catálogos

- `COUNTRIES`: 10 países (México, Colombia, Argentina, Perú, Chile, Ecuador, España, Venezuela, Guatemala, República Dominicana). Cada uno con zonas norte/centro/sur, lista de estados y una **nota lingüística** que describe los modismos de la zona.
- `PLATAFORMAS`: LinkedIn, Instagram, Facebook, X, TikTok, YouTube, SEO / Blog.
- `VIDEO_AI_TOOLS`: 13 herramientas con su costo en créditos (Kling, Veo, Runway, Seedance…).
- `STATUS_OPTIONS`, `FOCUS_OPTIONS`, `TIPOS_POST`, `MONTHS`, `POST_COUNTS`.

### 3.4 Persistencia

**No hay base de datos.** Todo vive en memoria de sesión. En Antigravity esto debe cambiar:
- Parrillas generadas → persistencia local (SQLite o archivos JSON versionados).
- Base histórica de publicaciones → tabla consultable.
- Configuración por cliente → perfiles reutilizables.

---

## 4. LÓGICA CRÍTICA (no reimplementar a la ligera)

Cada punto aquí resolvió un fallo real en producción. Perderlos es regresar.

### 4.1 Generación por bloques
Una parrilla no se pide en una sola llamada. Se parte en bloques (`5` en LID, `8` en cliente) porque respuestas largas se truncan. Cada bloque recibe:
- Los días exactos que debe cubrir.
- Las ideas ya generadas (para no repetirse).
- El balance de formatos acumulado.
- Los estados o pilares aún sin cubrir.

### 4.2 Reparación de JSON truncado
`repairTruncatedJSON()` corta en el último objeto completo, cierra la estructura pendiente y rescata lo válido. Usa `pendingClosers()`, que recorre el prefijo ignorando llaves dentro de cadenas y escapes. Probado contra 6 escenarios de corte.

### 4.3 Reintentos con espera progresiva
Ante 429/529: espera 12 → 25 → 40 segundos (no menos: los límites son por minuto). Muestra cuenta regresiva al usuario. Máximo 4 intentos. Hay además un **throttle de 3 s** entre cualquier par de llamadas.

### 4.4 Pase de auto-completado
Si un bloque llega recortado y se rescatan 6 de 8 posts, se piden **solo los días faltantes** en una llamada pequeña, hasta 2 veces. No se rehace toda la parrilla.

### 4.5 Normalización de días
Los días se asignan con `planDays(n)` (distribución uniforme en el mes). Si la IA devuelve un día fuera de plan o duplicado, se reasigna al primer hueco libre.

### 4.6 Créditos calculados en la app
`computeCredits()` es determinista: Imagen = 1 crédito; Video = créditos de la herramienta × escenas; rango superior = ×1.4 por retomas. **La IA no calcula créditos** (antes lo hacía y sumaba mal).

### 4.7 Ingesta del archivo base
`parseBaseFile()` acepta XLSX/XLS/CSV. Detecta la fila de encabezados por coincidencia difusa (mínimo 4 columnas reconocidas). Puntos que costaron depuración:
- **Fechas**: se leen del valor real de celda (`raw: true`, `cellDates: true`), no del texto mostrado. El archivo real de LID tenía dos formatos distintos en la misma columna (`dd-mmm-yyyy` y `mm-dd-yy`).
- Para CSV se detecta el orden día/mes escaneando toda la columna.
- Saltos de línea `\r\n` normalizados a `\n` (si no, el copy no coincide con el origen).
- El día de la semana **se conserva tal cual viene**; la canonización solo se usa para estadísticas.
- Mapeo de nomenclatura: `Meta → Facebook + Instagram`, `Blog SEO → SEO / Blog`, `YouTube Shorts → YouTube`.

Verificado: 11/11 columnas y 43/43 filas idénticas al documento original.

### 4.8 Digest de la base histórica
`baseDigest()` comprime la base en contexto para el prompt: taxonomía con conteos, campañas únicas, cadencia por día, y las últimas 20 publicaciones con copy truncado a 115 caracteres. Instrucción asociada: **no repetir esos ángulos**.

---

## 5. SISTEMA DE MARCA LID (capa de inteligencia interna)

Vive en `LID_BRAND` + catálogos. **No se muestra al usuario**: gobierna el prompt.

Contiene: posicionamiento (partner estratégico de crecimiento, no agencia de ejecución), enemigo conceptual (marketing sin estrategia), audiencias por decisor, personalidad, lenguaje permitido y prohibido, tesis editorial, motor de ángulos de 7 pasos, estructura de copy, CTA por etapa, reglas de veracidad, filtro de sustituibilidad y criterios de aceptación.

Reglas duras derivadas:
- **En X nunca se usan hashtags** para LID.
- Hashtags: solo si el subtema coincide con el tema de la pieza, máximo 3; si ninguno corresponde, arreglo vacío.
- Distribución de pilares 25/20/15/15/10/10/5, con seguimiento entre bloques.
- Prohibido inventar cifras, casos, estudios o cambios de algoritmo.
- Cada canal produce expresión nativa distinta, nunca copy replicado.

---

## 6. MAQUETADO Y SISTEMA VISUAL

### 6.1 Temas (4 paletas, 35 tokens cada una, paridad obligatoria)

| Espacio | Modo | Fondo | Acento | Botón de resalte |
|---|---|---|---|---|
| Cliente | oscuro | `#0A0C16` | azul `#5B7CFF` | naranja `#FF8F45` |
| Cliente | claro | `#F6F7FC` | azul `#3E63E8` | naranja `#F97316` |
| LID | oscuro | `#021410` | lima `#A3E635` | lima `#A3E635` |
| LID | claro | `#F2FAF5` | verde `#15803D` | lima `#96DB22` |

- Secundario morado (cliente) / esmeralda (LID); énfasis naranja / dorado.
- **Contraste verificado**: texto sobre botón entre 6.7:1 y 10.6:1. Siempre texto oscuro sobre relleno brillante, nunca blanco.
- Cambio de espacio o de tema = transición cromática global de 600 ms. El layout no se mueve.

### 6.2 Tipografía
**Poppins** para todo (300–700), cargada desde Google Fonts. Las etiquetas de dato usan Poppins con peso 600 y tracking abierto, más `font-variant-numeric: tabular-nums` para alinear cifras.

### 6.3 Componentes clave
- `GridTable` — tabla transpuesta, primera columna fija, separador "Extras GridIA", Status editable por celda.
- `LoadingBlock` — progreso real (`4/8 publicaciones`), mensajes rotativos, cuenta regresiva ante saturación.
- Chips de selección — relleno sólido del color de resalte cuando están activos.
- `tagbox` — etiquetas con Enter/coma, borrado con Backspace.

### 6.4 Accesibilidad
`prefers-reduced-motion` respetado; foco visible en todo control; contraste AA verificado en las 4 paletas.

---

## 7. INTEGRACIONES EXTERNAS

| Integración | Estado | Notas |
|---|---|---|
| API del modelo | Activa | Generación por bloques |
| Búsqueda web (hashtags) | Activa | Acotada a marketing, devuelve `{tag, tema, motivo}` |
| Servicio de Trends (proxy) | Desplegado, en ajuste | Apps Script propio de LID. Contrato: `GET ?geo&periodo` → `{terminos:[{termino, semilla, interes, variacion, tipo}], diagnostico:[]}` |
| Archivo base XLSX/CSV | Activa | Ingesta local en navegador |

**Restricción heredada:** el artefacto no podía llamar servicios externos por CORS. En Antigravity esta restricción desaparece — el scraping de Trends puede correr en el backend de la app y el proxy de Apps Script deja de ser necesario.

---

## 8. DEUDA TÉCNICA CONOCIDA

1. Monolito de 2,321 líneas sin módulos ni pruebas automatizadas.
2. Sin persistencia: al recargar se pierde todo.
3. Sin control de versiones de parrillas ni historial de cambios.
4. Servicio de Trends v2 pendiente de validar (v1 agotaba la cuota con una sola semilla y silenciaba errores).
5. Estado duplicado entre `form` y `lidForm` — intencional, pero merece un tipo compartido con variantes.
6. Sin manejo multiusuario ni roles.

---

## 9. LO QUE NO SE DEBE CAMBIAR

Al migrar, estos puntos son contrato con el negocio:

1. El orden y los nombres de las columnas de ambas plantillas.
2. La tabla transpuesta.
3. El aislamiento entre espacio cliente y espacio LID.
4. Las reglas duras del sistema de marca (hashtags en X, no inventar datos, filtro de sustituibilidad).
5. La generación por bloques con reparación de truncado y reintentos.
6. Los créditos calculados en la app, nunca por la IA.
7. La fidelidad exacta al archivo base al importarlo.
