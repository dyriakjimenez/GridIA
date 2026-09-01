# REGLAS DEL WORKSPACE — GridIA / LID Marketing

Activación: **Always On**. Estas reglas gobiernan toda tarea en este workspace.
Contexto completo del sistema: @../../CONTEXTO_GridIA.md

## 0. MODELO Y MODO DE TRABAJO
- Modelo obligatorio: **Gemini 3.1 Pro**, `thinking_level: HIGH`.
- Idioma de trabajo: **español** en comentarios, commits, documentación y respuestas. Código en inglés.
- Antes de escribir código, **lee el contexto**: `CONTEXTO_GridIA.md` es la fuente de verdad.
- Ante ambigüedad real, **pregunta**. No inventes requisitos ni "mejoras" no pedidas.

## 1. LÍMITES DE ALCANCE
1. **Entrega exactamente lo pedido.** Nada más.
2. **Prohibido refactorizar de forma oportunista.**
3. **Prohibido borrar o reescribir funcionalidad existente** para "simplificar".
4. **Prohibido cambiar dependencias, framework, gestor de paquetes o configuración de build** sin autorización explícita.
5. Al terminar una tarea, **reporta qué archivos tocaste y por qué**.

## 2. DOMINIO: REGLAS INVIOLABLES
1. Aislamiento de espacios de trabajo (Cliente vs LID).
2. Columnas de plantilla congeladas (TPL_PARAMS y LID_PARAMS).
3. Tabla transpuesta (Parámetros en filas, días en columnas).
4. Créditos calculados por la app con `computeCredits()`.
5. Días asignados por la app con `planDays()`.
6. Fidelidad al archivo base al importar XLSX/CSV.
7. Reglas de marca de LID respetadas.
8. La capa de marca es interna.

## 3. VERIFICACIÓN OBLIGATORIA
1. Nunca declares que algo funciona sin haberlo ejecutado.
2. Toda función con lógica no trivial necesita prueba automatizada.
3. Al terminar, ejecuta typecheck, linter y pruebas.

## 4. GIT
1. Commits pequeños y atómicos, en español, en imperativo.
2. El mensaje explica por qué, no solo qué.
3. Una tarea = una rama. Prohibido trabajar directo sobre `main`.
4. Prohibido push forzado o reescribir historia sin autorización.

## 5. SEGURIDAD DE EJECUCIÓN
1. Nunca ejecutes comandos destructivos sin confirmación.
2. Nunca modifiques archivos fuera del workspace.
3. Nunca instales software a nivel de sistema.
4. Ante una operación irreversible, detente y pregunta.
