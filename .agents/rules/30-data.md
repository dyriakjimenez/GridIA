Activation: Glob src/data/**

## REGLAS DE DATOS E INGESTA

1. Al agregar persistencia, define primero el esquema y la migración. Prohibido escribir estructuras ad hoc.
2. Los archivos base que suben los usuarios contienen contenido de clientes: no los envíes a servicios externos salvo que la tarea lo requiera explícitamente.
3. La lógica de importación resuelve fechas mixtas, nomenclaturas y encabezados difusos; no se debe reescribir sin pruebas.
