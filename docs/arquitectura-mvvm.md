# Arquitectura actual · 10 de octubre de 2026

La organización parte del código local existente, incluidos cambios sin commit. No se reconstruyó la aplicación ni se copió funcionalidad de otro dominio. [Inventario completo](estructura-modulos.md) · [Correcciones y evidencia](revision-estructura.md).

## Capas

| Capa | Responsabilidad real |
| --- | --- |
| src/app | Rutas, parámetros y layout de Expo Router; las rutas exportan vistas de módulos |
| views | JSX, estilos y eventos de interfaz; sin HTTP ni adaptación de DTO |
| viewmodels | Estado, carga, errores, acciones locales, navegación de pantalla y formato para mostrar |
| models | Tipos de dominio consumidos; sin dependencias de React, navegación, servicios ni estado visual |
| adapters | DTO externos, validación y conversión pura de respuestas a modelos |
| services por módulo | Operaciones públicas verificadas, invocación del cliente HTTP y de adapters; entregan modelos |
| src/services/api.ts | Transporte compartido GET, JSON, errores HTTP y AbortSignal |
| src/config/api.ts | Única lectura estática y validación de EXPO_PUBLIC_API_URL |
| shared | Validadores, errores de adaptación y estado genérico reutilizado |

Los hooks de catálogo, cursos y servicios crean ViewModels de carga con servicios inyectables. LoadState conserva errores HTTP, de adaptación y de modelo inexistente por separado; descarta respuestas anteriores y canceladas. Los hooks locales manejan entradas/selecciones sin servicios artificiales. Los ejemplos explícitos están en viewmodels y nunca son fallback de peticiones fallidas.

ComposedCatalogoService combina tres servicios de dominio con Promise.all. No necesita adapter propio: recibe modelos que ya fueron adaptados. Si falla una fuente, la carga del catálogo falla; no devuelve un resultado parcial aparentemente exitoso.

Los DTO de productos validan también categorías, marcas y variantes. La proyección actual solo consume id, nombre, descripción y precio; no se añade selector de variantes ni pantalla de detalle inexistente. No se inventa moneda, stock, usuario, cantidades o datos faltantes.

## Límites entre módulos

Carrito contiene sus artículos, resumen y vista previa. Ventas conserva compras. Productos conserva su adapter/servicio y las tarjetas que catálogo consume. Configuración conserva preferencias y seguridad como módulo independiente; Perfil enlaza a él. Cuenta mantiene las 23 secciones de su ruta dinámica, delegando las vistas a sus módulos.

Inicio y Cuenta son composiciones locales de pantalla/navegación; sus modelos visuales están en viewmodels. models/README.md explica por qué no se añade una entidad ficticia. En otros módulos sin API, los README de adapters y services documentan la integración pendiente.

## Contratos y autenticación

Se mantienen las lecturas públicas existentes y los contratos documentados en [endpoints-api.md](endpoints-api.md). El backend auditado usa NextAuth web; falta una sesión móvil probada y reconciliar formularios antes de habilitar operaciones protegidas. No se envían Bearer inventados ni credenciales personales. No se transforma la configuración administrativa del sitio en preferencias móviles.

La separación de responsabilidades está implementada para el código existente. La autenticación, agenda remota, inscripción, carrito persistente, pagos y otras operaciones protegidas siguen pendientes y no se califican como completas.

Se consultaron [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [el índice oficial](https://docs.expo.dev/llms.txt), [Expo Router](https://docs.expo.dev/router/basics/core-concepts/) y [variables de entorno](https://docs.expo.dev/guides/environment-variables/) antes de modificar referencias de su infraestructura.
