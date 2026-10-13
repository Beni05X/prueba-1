> Informe histórico de la integración anterior. La separación actual de servicios/adapters, ubicaciones y validaciones está en [revision-estructura.md](revision-estructura.md) y [estructura-modulos.md](estructura-modulos.md). Los nombres Http…Adapter de este informe corresponden a la implementación anterior.

# Implementación de Adapter — Salón Brenn’s

Auditoría e implementación del 7 de octubre de 2026. Se leyó `AGENTS.md`, se
revisaron los 14 módulos completos (incluidas las secciones de cuenta, edición,
carrito, compras y mis cursos), rutas, modelos, ViewModels, componentes,
configuración y Git antes de modificar. El estado inicial se conserva en
`migracion-adapter.json`: rama `feature/estructura-app`, cambios previos del
usuario y hashes del contenido. No se ejecutaron reset, checkout, commit, push
ni escrituras al backend.

## Estructura y conservación

Se migraron 58 archivos de `src/features/<modulo>/` a
`src/modules/<modulo>/`, conservando los nombres exactos de los 14 módulos.
Cada módulo tiene `views/`, `viewmodels/`, `models/` y `adapters/`.
`estructura-modulos.md` enumera el árbol final y la correspondencia completa
origen/destino. Las 11 rutas siguen en `src/app/`; sus exports apuntan a las
vistas. El alias `@/*` ya resolvía `src/*` y no necesitó cambios.

La migración comprobó los 58 contenidos, permitiendo únicamente el reemplazo
del prefijo de imports. La integración posterior cambia modelos, ViewModels y
las tres vistas que ahora consumen datos públicos. Los bloques de estilos,
colores, fuentes, componentes compartidos y navegación principal se conservan.
`catalogo` agrega datos y `productos` presenta productos; `cuenta` resuelve
secciones y `perfil` conserva su propia presentación/edición.

El carrito sigue en `ventas/views/carrito-view.tsx`,
`ventas/viewmodels/use-carrito-view-model.ts` y `ventas/models/venta.ts`,
con la ruta `src/app/carrito.tsx`. Los artículos y el resumen originales se
conservan. Eliminar, pagar, guardar perfil, autenticar e inscribirse estaban
deshabilitados antes de esta tarea y continúan así; no son integraciones remotas
terminadas.

## Archivos creados, migrados, modificados y retirados

Los 58 traslados, las 11 rutas actualizadas, los 11 archivos modulares con
cambios de integración y los 24 archivos nuevos dentro de módulos están
enumerados individualmente en `estructura-modulos.md`. Ese documento contiene
las hashes antes/después y distingue los cambios previos del usuario.

Archivos nuevos fuera de módulos:

```text
src/shared/adapters/adapter-error.ts
src/shared/adapters/validation.ts
src/shared/http/http-client.ts
src/shared/viewmodels/load-state.ts
src/shared/viewmodels/use-load-state.ts
src/utils/format-calendar-date.ts
scripts/register-typescript.cjs
scripts/run-tests.cjs
tests/data-validation.test.cjs
tests/http-client.test.cjs
tests/load-state.test.cjs
tests/module-viewmodels.test.cjs
tests/presentation-format.test.cjs
tests/public-adapters.test.cjs
docs/migracion-adapter.json
docs/estructura-modulos.md
docs/endpoints-api.md
docs/implementacion-adapter.md
```

Además de los imports y archivos modulares enumerados allí, se modificaron
`src/utils/format-price.ts` (formato decimal exacto y precio ausente),
`package.json` (script de pruebas, sin dependencias nuevas) y `README.md`
(organización, contratos y comandos actualizados). En el informe histórico
`docs/arquitectura-mvvm.md` sólo se actualizaron los enlaces al código migrado
y se añadió una nota de vigencia; se conservan sus resultados anteriores.
`docs/guia-estilos.md` se conserva sin cambios. `package-lock.json` no
cambió. El cliente HTTP se creó porque no existía uno; `src/config/api.ts`
se reutiliza sin modificar.

Se retiró únicamente la ubicación anterior `src/features/`, después de mover
y verificar todos sus archivos. Ninguno de los 58 destinos fue eliminado;
los ejemplos existentes se conservan como previews, sin usarse para ocultar
fallos de la API. No se cambiaron componentes compartidos, tema, fuentes,
layout ni archivos nativos. La comprobación final conservó los 25 archivos de
presentación protegidos (11 rutas normalizando solo imports), y 47 de los
58 archivos trasladados conservaron sus hashes después de la migración;
los otros 11 tienen cambios de integración documentados.

## Estado por módulo

| Módulo | Fuente de datos actual | Adaptador | ViewModel consumidor | Estado |
| --- | --- | --- | --- | --- |
| agenda | `agenda-preview.ts`: citas locales | No aplica a la vista previa compatible | `useAgendaViewModel` | Local conservado; citas remotas pendientes |
| autenticacion | Formularios locales; envíos deshabilitados | Pendiente de contrato de sesión móvil | `useAutenticacionViewModel` | Pendiente: login, registro, recuperación, contraseña, logout, eliminación |
| catalogo | Cursos, servicios y productos públicos | `HttpCatalogoAdapter`, composición de tres puertos | `CatalogoViewModel` → `useCatalogoViewModel` | Lecturas integradas; búsqueda conserva comportamiento visual |
| configuracion | Preferencias y menús locales | No aplica actualmente | `useConfiguracionViewModel` | Local conservado; persistencia/métodos de pago/sesiones pendientes |
| cuenta | Parámetro de ruta y `PAGINAS_CUENTA` | No aplica a navegación local | `useCuentaViewModel` | Completado como navegación; separado de perfil |
| cursos | `GET /api/cursos`; detalle por ID del listado; preview sin ID | `HttpCursosAdapter` | `CursosViewModel` → `useCursosViewModel`; catálogo | Lectura integrada; mis cursos e inscripción pendientes |
| favoritos | Ejemplos locales ya tipados | No aplica a ejemplos actuales | `useFavoritosViewModel` | Remoto autenticado pendiente |
| informacion | Preguntas, textos legales, acerca y no-encontrado locales | No aplica actualmente | `useInformacionViewModel`, `useNoEncontradoViewModel` | Local conservado; soporte deshabilitado/textos legales provisionales |
| inicio | Categorías, destacados y próxima cita de ejemplo | No aplica a datos locales compatibles | `useInicioViewModel` | Vista previa conservada; inicio personalizado pendiente |
| notificaciones | Preferencia visual local | No aplica actualmente | `useNotificacionesViewModel` | Preferencia remota y notificaciones reales pendientes |
| perfil | Usuario de ejemplo y formulario de edición local | Pendiente de sesión y contrato autenticado | `usePerfilViewModel`, `useEditarPerfilViewModel` | Lectura/escritura autenticadas pendientes |
| productos | `GET /api/productos`, array directo; modelos entregados por catálogo | `HttpProductosAdapter` | `CatalogoViewModel` → `useProductosViewModel` | Lectura integrada; detalles/compra pendientes |
| servicios | `GET /api/servicios`, `GET /api/servicios/:id`; preview sin ID | `HttpServiciosAdapter` | `ServiciosViewModel` → `useServiciosViewModel`; catálogo | Lecturas integradas; reservar pendiente |
| ventas | Carrito de ejemplo; compras vacías locales | No aplica a datos locales compatibles | `useCarritoViewModel`, `useComprasViewModel` | Remoto, modificar carrito, checkout y compras pendientes |

La ausencia de adaptador en un módulo local está razonada en su
`adapters/README.md`; no se crearon clases que devolvieran ejemplos simulando una
API. Los contratos confirmados por código y el resultado de peticiones reales
se detallan, con sus límites, en `endpoints-api.md`.

## Correspondencias entre DTO y modelos

| Datos externos | Modelo interno | Transformación / validación |
| --- | --- | --- |
| `cursos[].id` / `servicios[].id` / `productos[].id`: entero JSON | `id`: string | Entero positivo seguro → representación decimal; rechaza fracciones/IDs inválidos |
| Cursos `{ cursos: [...] }` | `readonly Curso[]` | Valida envoltorio/lista; `[]` válido; `null`, cuerpo vacío u otro wrapper inválidos |
| `cursos[].titulo`: texto | `Curso.nombre`: texto | Renombra el campo confirmado del backend |
| `precio_total`: Prisma Decimal como texto | `Curso.precio`: string decimal | Conserva todos los dígitos; no convierte a flotante ni redondea |
| `duracion_horas`: número nullable | `duracionHoras`: número/null | Renombra y valida; no interpreta texto como horas |
| `fecha_inicio`, `fecha_fin`: `@db.Date` nullable | `fechaInicio`, `fechaFin`: `YYYY-MM-DD`/null | Valida día real, incluido bisiesto; extrae calendario de ISO UTC a medianoche sin desplazar por zona horaria |
| `descripcion`, `nivel`: texto nullable | `descripcion`, `nivel`: texto/null | Preserva null; la vista omite información ausente |
| Instructor y modalidad: no existen en contrato de cursos | Opcionales, solo presentes en preview local | No se inventan ni copian datos del ejemplo a cursos reales |
| Servicios `{ servicios: [...] }` | `readonly Servicio[]` | Valida listado; detalle es objeto directo y no comparte wrapper |
| `precio_min` (lista), `precio` (detalle): Float numérico | `Servicio.precio`: string decimal | Conserva la representación recibida sin imponer dos decimales; expande exponentes; rechaza no finitos e importes numéricos inseguros |
| `duracion`: texto | `duracionTexto`: texto | Conserva la expresión del backend; no deduce minutos |
| Descripción e incluye: ausentes del contrato público de servicios | Campos opcionales | No se rellenan; siguen visibles en la preview local que sí los contiene |
| Productos: array directo | `readonly Producto[]` | Valida sin suponer `{ productos: [...] }` |
| `precio_min`: número/null | `Producto.precio`: string/null | Preserva null de producto sin variantes; UI muestra «Precio no disponible», nunca cero inventado |
| Tres puertos públicos independientes | `DatosCatalogo` `{ Servicios, Cursos, Productos }` | Composición concurrente de modelos; conserva independencia de los módulos |
| Errores HTTP, incluso HTML del proxy | `HttpError` con status/body/path | Conserva error de transporte; no lo convierte en lista vacía |
| Respuesta HTTP exitosa con JSON o DTO inválido | `AdapterError` con ruta/expectativa | Distinto de error HTTP; no filtra registros defectuosos ni usa fallback de ejemplo |

Los DTO se encuentran en `models/` de cada módulo externo. Los modelos internos
permiten dinero de los ejemplos locales como número y dinero adaptado como
texto exacto. El símbolo `$` se conserva del diseño existente; no se afirma una
moneda ISO no documentada. El cliente HTTP compartido no presupone tokens ni
cookies móviles: las consultas implementadas son públicas.

Los contratos del backend disponibles por código no bastan para habilitar los
formularios y funciones autenticadas existentes. Estas diferencias requieren
decisiones de integración y no se ocultan con DTO o credenciales simuladas:

| Integración pendiente | Backend confirmado por código | Diferencia con la app / motivo del pendiente |
| --- | --- | --- |
| Registro | `POST /api/auth/register`: `name`, `email`, `password`, `telefono`; 201 con `requiresVerification` | El formulario no solicita teléfono; falta flujo de verificación y sesión móvil |
| Login | Credentials: `id`, `name`, `email`, `role`, `telefono`; sesión NextAuth web | No entrega un token móvil; falta definir adquisición/persistencia de sesión y CSRF/cookies |
| Edición de perfil | Escritura permite `nombre` y `telefono` | El formulario ofrece `nombre` y `correo`; el contrato no permite editar correo así |
| Favoritos | Contratos separados para cursos, productos y servicios con comportamientos de sesión distintos | La lista local no identifica sesión ni su estado remoto; no interpretar ausencia de sesión como favoritos vacíos |
| Preguntas frecuentes | Endpoint público con `id`, `pregunta`, `respuesta` | La vista actual consume preguntas locales compatibles y no presenta respuestas; la integración remota no se habilitó |
| Configuración del sitio | Registro de pares string | No define idioma/apariencia/pagos/sesiones del usuario móvil |

## Ejemplo antes y después

Ejemplo representativo del contrato de cursos verificado en el código backend,
no un registro personal ni una respuesta de producción inventada:

```json
{
  "cursos": [{
    "id": 7,
    "titulo": "Curso de especialización",
    "descripcion": null,
    "precio_total": "1200.00",
    "duracion_horas": 20,
    "nivel": null,
    "fecha_inicio": "2026-09-30T00:00:00.000Z",
    "fecha_fin": null,
    "imagenes": null
  }]
}
```

Modelo interno que consume el ViewModel, con los campos de presentación que sí
están disponibles:

```json
[{
  "id": "7",
  "nombre": "Curso de especialización",
  "descripcion": null,
  "precio": "1200.00",
  "duracionHoras": 20,
  "nivel": null,
  "fechaInicio": "2026-09-30",
  "fechaFin": null
}]
```

La vista formatea `$1,200` y `30 septiembre 2026`. No aparece instructor o
modalidad inventados. Los fixtures completos usados por las pruebas reflejan
los DTO documentados; este ejemplo muestra el subconjunto consumido.

## Checklist «Implementar Adapter»

| Punto | Evidencia | Estado |
| --- | --- | --- |
| 1. Identificar backend | Auditoría de los 14 módulos y fuente backend en `endpoints-api.md`; clasificación pública/autenticada/local | Parcial: contratos móviles autenticados y destino de producción no confirmados |
| 2. Comparar modelos | Tabla anterior, DTO en `models/`, modelos con null y campos ausentes reales | Completado para las lecturas públicas; pendiente donde falta contrato de integración |
| 3. Definir Adapter | Puertos `CursosAdapter`, `ServiciosAdapter`, `ProductosAdapter`, `CatalogoAdapter`; implementaciones HTTP/composición | Completado donde hay necesidad y contrato verificado |
| 4. Transformar | Mappers explícitos, `validation.ts`, `AdapterError`, dinero/fechas sin pérdida y sin defaults inventados | Completado para contratos públicos |
| 5. Adaptar respuestas | Listas con wrapper, array directo, detalles y errores; ningún envío existente habilitado ni escritura simulada | Parcial: lecturas públicas integradas; escrituras autenticadas pendientes |
| 6. Integrar ViewModels | Vistas → hooks → ViewModels → puertos; carga/error/cancelación en ViewModels; productos recibe modelos internos | Completado para flujos públicos; previews y pendientes identificados |
| 7. Probar | `npm test`, `npm run lint`, `npm run typecheck`, ESLint adicional de scripts/tests; resultados reales al final | Completado: 36 pruebas aprobadas, tipos sin errores y lint sin errores; advertencia previa conservada |

## Verificaciones y límites

| Comprobación | Resultado real |
| --- | --- |
| `npm test` | Exit 0; 36/36 aprobadas, 0 fallos, 0 canceladas, 0 omitidas |
| `npm run typecheck` | Exit 0; sin errores de TypeScript |
| `npm run lint` | Exit 0; 0 errores, 1 advertencia previa en `src/hooks/use-color-scheme.web.ts:11` |
| `node node_modules/eslint/bin/eslint.js src tests scripts eslint.config.js --no-cache` | Exit 0; fuentes, pruebas y scripts sin errores, misma advertencia previa |
| `npx --no-install expo export --platform web` | Exit 0; 12 rutas estáticas y 2 bundles web exportados a `dist/`, incluida la ejecución final tras el ajuste de Float |
| `git diff --check` | Exit 0; sin errores de whitespace, con avisos de normalización LF/CRLF del repositorio |

Las ejecuciones intermedias detectaron imports aún ausentes mientras se
integraban los adaptadores y un `description` nullable incompatible con la
tarjeta. El tipo de presentación se corrigió y la comprobación de tipos final
pasó. Los imports antiguos de `features` ya no se usan.

Las pruebas unitarias usan transporte inyectado y verifican mappers y
ViewModels reales. No equivalen a una prueba en un dispositivo iOS/Android ni
confirman cookies/sesiones de usuarios, pagos o contratos de escritura.
La petición HTTP al despliegue no llegó a ejecutarse: quedó esperando
autorización de red y se canceló. Los contratos nuevos se verificaron por
código backend con revisión fija; el README conserva el antecedente de una
consulta de cursos realizada el 6 de octubre, que no constituye una nueva
validación de todos los endpoints. Sigue pendiente confirmar el entorno de
producción destinado a la app móvil.

No se añadieron dependencias; Expo SDK 57 y las versiones del proyecto se
conservan. Se consultaron antes de tocar las APIs de Expo/React Native:
[documentación SDK 57](https://docs.expo.dev/versions/v57.0.0/),
[índice oficial](https://docs.expo.dev/llms.txt) y
[Expo Router](https://docs.expo.dev/router/introduction/).
