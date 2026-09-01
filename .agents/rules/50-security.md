Activation: Always On

## REGLAS DE SEGURIDAD

1. **Prohibido incluir credenciales, tokens o claves API en el código.** Van en variables de entorno, y el archivo de entorno nunca se versiona.
2. Nunca ejecutar comandos destructivos sin confirmación: `rm -rf`, `DROP`, `TRUNCATE`, borrado de ramas, limpieza de directorios.
3. El aislamiento es una regla inviolable. El estado del espacio cliente (`form`) y del espacio LID (`lidForm`) nunca se comparten, mezclan ni heredan.
