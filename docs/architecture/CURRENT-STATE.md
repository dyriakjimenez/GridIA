# Estado Actual (Baseline)

## Infraestructura y Dependencias
- **Package Manager**: NPM (asumido por `package.json`, aunque no está disponible en la máquina actual).
- **Framework**: React 18 con Vite.
- **Lenguaje**: TypeScript y JSX (mezclado, el archivo principal es `.jsx`).
- **Dependencias principales**: `react`, `react-dom`, `xlsx`.
- **Configuración TS**: `tsconfig.json`, `tsconfig.node.json`.
- **Build**: `vite build` y `tsc -b`.
- **Linter**: NO CONFIGURADO en `package.json`.
- **Pruebas (Tests)**: NO CONFIGURADO en `package.json`.
- **Variables de Entorno**: No se encontraron archivos `.env` en el repositorio.

## Módulos y Estructura
El proyecto es actualmente un monolito:
- Archivo principal: `GridIA_Regional.jsx` (~151 KB).
- Estilos: `src/index.css`.
- Entrada: `index.html`.

## Funciones Críticas Identificadas (según contexto)
- `buildPrompt()`: Genera el prompt para el LLM.
- `callWithRetry()`: Reintentos y backoff.
- `callClaudeGrid()`: Llamada a la API de IA (Claude actualmente).
- `parseGridJSON()`: Reparación de JSON truncado.
- `planDays()`: Asignación de fechas y días.
- `computeCredits()`: Cálculo determinista de créditos.
- `parseBaseFile()`: Ingesta de XLSX/CSV y normalización.
- `baseDigest()`: Compresión de base histórica.

## Flujo de Generación
1. El usuario configura la parrilla en el `ClienteWorkspace` o `LidWorkspace`.
2. Se cargan los archivos base históricos y se normalizan (`parseBaseFile`, `baseDigest`).
3. Se invoca `buildPrompt()` para el bloque actual (5 u 8 posts).
4. `callClaudeGrid()` envía el prompt con `callWithRetry()`.
5. La respuesta se procesa con `parseGridJSON()` y `repairTruncatedJSON()`.
6. Si faltan días, se ejecuta un pase de auto-completado.
7. Los resultados se añaden a la tabla y se actualiza el progreso en `LoadingBlock`.

## Deuda Técnica y Riesgos
- **Sin tests**: Cualquier refactor corre el riesgo de romper lógica crítica de negocio.
- **Falta de Git/NPM/UV en el entorno**: El entorno de desarrollo actual carece de herramientas base para compilar o versionar.
- **Acoplamiento UI/Lógica**: Todo reside en un archivo gigantesco JSX, lo que dificulta extraer el dominio de forma segura sin romper React hooks o el estado.
- **Estado Efímero**: Todo vive en memoria; no hay persistencia.
- **Variables de Entorno Indocumentadas**: Falta claridad sobre qué variables necesita la API de IA.
