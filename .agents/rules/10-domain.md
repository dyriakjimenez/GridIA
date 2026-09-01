Activation: Glob src/domain/**

## REGLAS DE DOMINIO

1. `domain/` no importa de `ui/`, `ai/` ni `data/`. Es lógica pura y testeable.
2. Los catálogos de datos (países, plataformas, pilares, herramientas de video) van en `domain/`, nunca dentro de un componente.
3. Sin números ni cadenas mágicas. Todo valor de dominio va a una constante nombrada.
