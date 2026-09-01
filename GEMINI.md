# REGLAS DEL WORKSPACE — GridIA / LID Marketing

Activación: **Always On**. Estas reglas gobiernan toda tarea en este workspace.
Contexto completo del sistema: @CONTEXTO_GridIA.md

---

## 0. MODELO Y MODO DE TRABAJO

- Modelo obligatorio: **Gemini 3.1 Pro**, `thinking_level: HIGH`. No degradar a medium o low aunque la tarea parezca simple.
- Idioma de trabajo: **español** en comentarios, commits, documentación y respuestas. Código en inglés (identificadores, funciones, tipos).
- Antes de escribir código, **lee el contexto**: `CONTEXTO_GridIA.md` es la fuente de verdad del comportamiento actual.
- Ante ambigüedad real, **pregunta**. No inventes requisitos ni "mejoras" no pedidas.

---

## 1. LÍMITES DE ALCANCE (lo más importante)

1. **Entrega exactamente lo pedido.** Nada más. Si detectas algo adicional que valdría la pena, propónlo por escrito y espera aprobación.
2. **Prohibido refactorizar de forma oportunista.** Si un cambio requiere tocar más de 3 archivos no mencionados en la tarea, detente y explica por qué antes de proceder.
3. **Prohibido borrar o reescribir funcionalidad existente** para "simplificar". La sección 9 de `CONTEXTO_GridIA.md` lista lo que es contrato con el negocio.
4. **Prohibido cambiar dependencias, framework, gestor de paquetes o configuración de build** sin autorización explícita.
5. Al terminar una tarea, **reporta qué archivos tocaste y por qué**. Si algo quedó a medias, dilo.

---

## 2. VERACIDAD Y VERIFICACIÓN

1. **Nunca declares que algo funciona sin haberlo ejecutado.** "Debería funcionar" no es una entrega.
2. Toda función con lógica no trivial (parseo, fechas, cálculo, normalización) necesita **prueba automatizada** antes de darse por terminada.
3. Si una prueba falla, **no la ajustes para que pase**. Arregla el código o reporta el problema real.
4. **No inventes APIs, métodos, firmas ni nombres de librería.** Si no estás seguro de que existe, verifícalo en la documentación o en el código.
5. Cuando el usuario reporte un error, **reprodúcelo primero**. Prohibido "arreglar" a ciegas.
6. Al terminar, ejecuta typecheck, linter y pruebas. Si algo falla, no entregues.

---

## 3. DOMINIO: REGLAS INVIOLABLES DEL PRODUCTO

Violar cualquiera de estas es un fallo grave, no una diferencia de criterio.

1. **Aislamiento de espacios de trabajo.** El estado del espacio *cliente* (`form`) y del espacio *LID* (`lidForm`) nunca se comparten, mezclan ni heredan. Un manual de voz de cliente jamás debe llegar a un prompt de LID, ni al revés.
2. **Columnas de plantilla congeladas.** El orden y los nombres de `TPL_PARAMS` y `LID_PARAMS` replican los XLSX reales de LID. No agregues, quites ni renombres columnas sin autorización.
3. **Tabla transpuesta.** Parámetros en filas, días en columnas. No convertir a tabla convencional.
4. **Los créditos los calcula la aplicación**, con `computeCredits()`. La IA nunca los calcula.
5. **Días asignados por la app** con `planDays()`. Si el modelo devuelve un día fuera de plan o repetido, se reasigna al primer hueco libre.
6. **Fidelidad al archivo base.** Al importar XLSX/CSV, los valores deben coincidir carácter por carácter con el origen. Fechas desde el valor real de celda, nunca desde el texto mostrado.
7. **Reglas de marca de LID** (viven en `LID_BRAND`): en X nunca hashtags; máximo 3 hashtags y solo si el subtema coincide con el tema de la pieza; prohibido inventar cifras, casos, estudios o cambios de algoritmo; cada canal produce expresión nativa, nunca copy replicado.
8. **La capa de marca es interna.** No se muestra al usuario ni se convierte en campos de formulario.

---

## 4. RESILIENCIA DE LAS LLAMADAS A IA

Cada regla aquí resolvió un fallo real. No las simplifiques.

1. **Generación por bloques**, nunca una sola llamada por parrilla. Cada bloque recibe días exactos, ideas previas, balance de formatos y cobertura pendiente.
2. **Reparación de JSON truncado** obligatoria: cortar en el último objeto completo y cerrar la estructura. No reemplazar por un `JSON.parse` simple.
3. **Reintentos con espera progresiva** ante 429/529: 12 → 25 → 40 segundos. Nunca esperas cortas: los límites son por minuto.
4. **Throttle mínimo de 3 segundos** entre llamadas.
5. **Resultado parcial antes que error total.** Si se rescatan 6 de 8 piezas, se entregan las 6 con aviso y se piden solo las faltantes.
6. **Errores traducidos al usuario en español, accionables.** Prohibido mostrar el error crudo o un código HTTP suelto.

---

## 5. ESTILO DE CÓDIGO

1. TypeScript estricto. `any` prohibido salvo justificación escrita en comentario.
2. Nombres descriptivos y completos. Prohibidas abreviaturas de una letra fuera de índices de bucle.
3. Funciones pequeñas y de una sola responsabilidad. Si pasa de ~50 líneas, sepárala.
4. **Sin números ni cadenas mágicas.** Todo valor de dominio va a una constante nombrada.
5. Comentarios que explican **por qué**, no qué. El qué se lee en el código.
6. Manejo de errores explícito. Prohibido `catch` vacío o que se trague el error en silencio — este fallo ya ocurrió y costó una sesión de depuración.
7. Sin dependencias nuevas sin autorización. Si crees que una hace falta, justifica por qué no basta la biblioteca estándar.
8. Prohibido dejar código muerto, `console.log` de depuración, o funciones sin usar.

---

## 6. ORGANIZACIÓN DEL CÓDIGO

Estructura objetivo (ver sección 2.2 del contexto):

```
src/domain/   reglas de negocio puras, sin dependencias de UI ni de red
src/ai/       construcción de prompts, cliente del modelo, parseo
src/data/     ingesta de archivos, exportadores, servicios externos
src/ui/       componentes, temas, vistas
src/app/      composición y arranque
```

1. `domain/` no importa de `ui/`, `ai/` ni `data/`. Es lógica pura y testeable.
2. Un archivo, una responsabilidad. Prohibido recrear el monolito.
3. Los catálogos de datos (países, plataformas, pilares, herramientas de video) van en `domain/`, nunca dentro de un componente.

---

## 7. UI Y ACCESIBILIDAD

1. **Tipografía Poppins** en toda la interfaz. Cifras en tablas con `tabular-nums`.
2. **Cuatro paletas** (cliente/LID × claro/oscuro) con **paridad exacta de tokens**. Si agregas un token a una, agrégalo a las cuatro.
3. **Contraste mínimo AA (4.5:1)** en texto. Sobre relleno de color se usa texto oscuro, nunca blanco: ya se verificó que el blanco falla sobre naranja y lima.
4. Colores solo por variables CSS. Prohibido escribir un hex directamente en un componente.
5. Toda animación respeta `prefers-reduced-motion`.
6. Todo control accionable tiene foco visible y etiqueta accesible.
7. El cambio de tema o de espacio no debe mover el layout: solo transición cromática.

---

## 8. DATOS Y PRIVACIDAD

1. **Prohibido incluir credenciales, tokens o claves API en el código.** Van en variables de entorno, y el archivo de entorno nunca se versiona.
2. Los archivos base que suben los usuarios contienen contenido de clientes: no los envíes a servicios externos salvo que la tarea lo requiera explícitamente.
3. Al agregar persistencia, define primero el esquema y la migración. Prohibido escribir estructuras ad hoc.

---

## 9. GIT

1. Commits pequeños y atómicos, en español, en imperativo: `agrega`, `corrige`, `refactoriza`.
2. El mensaje explica **por qué**, no solo qué.
3. Una tarea = una rama. Prohibido trabajar directo sobre `main`.
4. Prohibido `git push --force`, reescribir historia o descartar cambios sin confirmar con el usuario.
5. Prohibido `git add .` a ciegas: agrega archivos explícitamente.

---

## 10. SEGURIDAD DE EJECUCIÓN

1. **Nunca ejecutes comandos destructivos sin confirmación**: `rm -rf`, `DROP`, `TRUNCATE`, borrado de ramas, limpieza de directorios.
2. Nunca modifiques archivos fuera del workspace.
3. Nunca instales software a nivel de sistema.
4. Ante una operación irreversible, **detente y pregunta**, aunque el modo de autonomía permita continuar.

---

## 11. CÓMO REPORTAR

Al terminar cualquier tarea, entrega en este orden:

1. **Qué se hizo**, en una o dos frases.
2. **Archivos tocados**, con el motivo de cada uno.
3. **Cómo se verificó**: comandos ejecutados y su resultado real.
4. **Qué quedó pendiente o dudoso**, si aplica.
5. **Riesgos introducidos**, si los hay.

Si algo salió mal, dilo primero y sin adornos. Un reporte que oculta un fallo es peor que el fallo.
