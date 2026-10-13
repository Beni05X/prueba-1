# Adapters de cursos

Las funciones de `cursos-adapter.ts` validan y convierten respuestas desconocidas a modelos internos. Los DTO externos se documentan en esta carpeta. No hay HTTP ni estado de pantalla aquí; `../services/cursos-service.ts` ejecuta las lecturas públicas con el cliente compartido y devuelve su resultado adaptado.

Se conservan null, precisión decimal, fechas e identificadores según [el contrato documentado](../../../../docs/endpoints-api.md). Los datos inválidos generan AdapterError; no se sustituyen por ejemplos ni listas vacías.
