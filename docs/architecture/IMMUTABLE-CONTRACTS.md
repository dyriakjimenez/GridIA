# Contratos Inmutables

Estas reglas son obligatorias y no pueden ser alteradas durante el refactor o migración.

1. **Aislamiento Cliente/LID**: 
   - El estado de `form` y `lidForm` no se comparte ni se hereda. 
   - Los espacios de trabajo son completamente independientes.
2. **Columnas de Plantillas**:
   - `TPL_PARAMS` y `LID_PARAMS` deben conservar su orden y nombres exactos.
3. **Tabla Transpuesta**:
   - La `GridTable` siempre renderiza los parámetros en filas y los días en columnas.
4. **planDays**:
   - La asignación de días la hace la app de forma determinista y uniforme. Si el LLM inventa un día, se reasigna.
5. **computeCredits**:
   - El cálculo de créditos es interno, determinista y nunca delegado a la IA.
6. **Reparación JSON**:
   - La lógica para rescatar JSON truncado cortando en el último objeto y cerrando la estructura debe mantenerse.
7. **Generación por Bloques**:
   - Máximo 5 publicaciones por bloque para LID, 8 para Cliente.
8. **Retries y Throttle**:
   - Backoff progresivo: 12s → 25s → 40s.
   - Máximo 4 intentos.
   - Throttle de 3 segundos entre llamadas.
9. **Auto-completado**:
   - Si faltan días tras un bloque, se piden exclusivamente los faltantes en llamadas pequeñas, hasta 2 veces.
10. **Fidelidad XLSX/CSV**:
    - La importación del histórico debe preservar saltos de línea `\r\n`, fechas reales (no formateadas), y texto exacto.
11. **Reglas LID_BRAND**:
    - En la red X nunca hay hashtags.
    - Máximo 3 hashtags por post, sólo si coincide el tema.
    - Prohibido inventar cifras, casos, estudios o cambios de algoritmo.
