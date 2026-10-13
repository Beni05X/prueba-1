# Revisión de estructura · 10 de octubre de 2026

La inspección inicial encontró Expo SDK 57, React Native 0.86.3, TypeScript estricto, npm y Expo Router (expo-router/entry). Había 14 módulos en src/modules, sin src/features. Se conservaron los cambios locales existentes: rutas, componentes, estilos, configuración y módulos sin commit. No se hizo reset, checkout, commit ni push.

El [árbol completo, tabla de archivos por capa y rutas](estructura-modulos.md) fue generado desde el resultado real. El [README](../README.md) y la [arquitectura](arquitectura-mvvm.md) describen cómo usarlo.

## Diagnóstico y correcciones

| Hallazgo inicial | Corrección |
| --- | --- |
| Adapters con HTTP y ViewModels consumiendo adapters | Operaciones extraídas a HttpCursosService, HttpServiciosService y HttpProductosService; adapters conservados como funciones puras; inyección de servicios en ViewModels |
| Catálogo etiquetaba como adapter la composición de servicios | ComposedCatalogoService compone los modelos adaptados; no se inventa un endpoint ni otro mapper |
| Carrito compartía ubicación y modelos con compras | Módulo carrito con vista, ViewModel, estado y entidades existentes; ventas conserva Mis compras |
| DTO externos, estado visual, menús y previews dentro de models | DTO a adapters; estado, enlaces y ejemplos a viewmodels; models queda sin dependencias visuales |
| Cliente HTTP en shared/http y tema en constants | Un cliente en src/services/api.ts y tema original en src/theme/index.ts; imports actualizados, sin wrappers duplicados |
| Validación de URL solo por prefijo | Se valida URL raíz HTTP(S), host y ausencia de rutas, credenciales, query y fragmento; no hay fallback ni cambio de valor en .env |
| Fixtures de catálogo/productos sin consumidores | Retirados tras comprobar referencias; también se retiró serviciosCatalogoEjemplo, usado únicamente por ese preview muerto. Se conservan los previews que sí muestran Cursos, Servicios y Agenda |
| Documentación anterior describía MVVM/Adapter con alcance distinto | README, inventario, arquitectura y límites actualizados; informe de Adapter anterior identificado como histórico |

No había una segunda implementación activa en features. La duplicación era principalmente de responsabilidades y datos de preview sin uso. No se crearon backend, servidores de aplicación, bases de datos, controladores, dependencias ni funcionalidades nuevas.

## Conservación y alcance real

Los 25 archivos de presentación incluidos en el manifiesto histórico previo coinciden con sus huellas después de normalizar únicamente los imports de tema y el nuevo destino de Carrito. Esta evidencia histórica complementa la inspección del código actual; no reemplaza una comparación visual en dispositivo.

La barra mantiene Inicio, Catálogo, Agenda, Carrito y Perfil. Se conservan las rutas, las 23 secciones de cuenta, la página no encontrada y el respaldo de sección desconocida. Los cambios de vistas se limitaron a referencias/imports; sus JSX, controles y bloques StyleSheet se conservaron. La paleta rosa, fuentes Inter, espaciados e iconos mantienen su implementación.

Configuración ya era un módulo con menús propios, apariencia, idioma, métodos de pago y seguridad; sigue independiente y enlazado desde Perfil. Productos conserva su especialización y contrato, consumido por Catálogo. Cuenta compone navegación sin duplicar Perfil.

No se editó .env; su URL actual pasa la nueva validación. No se muestra su contenido. Se conservaron package.json, package-lock.json, tsconfig.json, app.json, .gitignore, .env.example y los recursos de assets. No hay directorios nativos añadidos a mano. El inventario temporal inicial no quedó disponible entre entornos aislados de ejecución; no se atribuye a esta revisión una comparación SHA256 completa contra esa instantánea.

## Verificaciones

| Comando/comprobación | Resultado |
| --- | --- |
| npm run typecheck (línea base y final) | Aprobado, salida 0 |
| npm test (línea base) | 36 pruebas aprobadas |
| npm test (tras correcciones) | 39 pruebas aprobadas, 0 fallos |
| npm run lint y node node_modules/expo/bin/cli lint --no-cache | Aprobado, salida 0: 0 errores y 1 advertencia previa en use-color-scheme.web.ts:11 |
| Auditoría de imports mediante AST TypeScript | 120 archivos; 0 infracciones de capas; 15 módulos, 23 secciones de cuenta y cinco destinos inferiores |
| Validación de EXPO_PUBLIC_API_URL | Valor existente válido; sin imprimirlo ni modificarlo |
| Referencias retiradas en src y tests | Sin referencias ejecutables a Http…Adapter antiguos, shared/http, constants/theme ni features (las menciones históricas en documentación se conservan) |
| Exportación Android/iOS/web | EXPORT_STATUS |
| Navegación visual | UI_STATUS |
| git diff --check | Aprobado, salida 0; avisos informativos de conversión LF/CRLF, sin errores de espacios |

Las 39 pruebas verifican respuestas válidas/vacías/inválidas, null, fechas, decimales, IDs, HTTP 401/403/404/500, red, cancelación, respuestas fuera de orden, detalle de servicios, detalle de curso desde listado y composición del catálogo. Las nuevas pruebas comprueban configuración ausente/malformada y que un fallo HTTP de una fuente mantenga el catálogo en estado de error. Son fixtures de contratos; no son respuestas nuevas de producción.

Durante la migración se detectó y corrigió un import de errores renombrado indebidamente. Una ejecución de lint con caché conservó un diagnóstico de ruta antigua; la ejecución sin caché confirmó el estado final. El primer intento npm run start con flags no reenvió los argumentos correctamente en esta shell; se usó el CLI local directamente.

## Archivos movidos o reubicados

| Origen | Destino |
| --- | --- |
| `src/shared/http/http-client.ts` | `src/services/api.ts` |
| `src/constants/theme.ts` | `src/theme/index.ts` |
| `src/modules/ventas/views/carrito-view.tsx` | `src/modules/carrito/views/carrito-view.tsx` |
| `src/modules/ventas/viewmodels/use-carrito-view-model.ts` | `src/modules/carrito/viewmodels/use-carrito-view-model.ts` |
| `src/modules/catalogo/adapters/catalogo-adapter.ts` | `src/modules/catalogo/services/catalogo-service.ts` |
| `src/modules/cursos/models/curso-dto.ts` | `src/modules/cursos/adapters/curso-dto.ts` |
| `src/modules/productos/models/producto-dto.ts` | `src/modules/productos/adapters/producto-dto.ts` |
| `src/modules/servicios/models/servicio-dto.ts` | `src/modules/servicios/adapters/servicio-dto.ts` |
| `src/modules/agenda/models/agenda-preview.ts` | `src/modules/agenda/viewmodels/agenda-preview.ts` |
| `src/modules/cursos/models/cursos-preview.ts` | `src/modules/cursos/viewmodels/cursos-preview.ts` |
| `src/modules/servicios/models/servicios-preview.ts` | `src/modules/servicios/viewmodels/servicios-preview.ts` |
| `src/modules/cuenta/models/cuenta.ts` | `src/modules/cuenta/viewmodels/cuenta-state.ts` |
| `src/modules/inicio/models/inicio.ts` | `src/modules/inicio/viewmodels/inicio-state.ts` |
| `src/modules/cursos/models/mis-cursos.ts` | `src/modules/cursos/viewmodels/mis-cursos-state.ts` |

Además, venta.ts se dividió para trasladar ItemCarrito, ResumenCarrito y DatosCarrito al módulo carrito. Los estados y menús se extrajeron de los modelos a los nuevos archivos *-state.ts, conservando las entidades que todavía se consumen. La implementación HTTP se extrajo de los adapters a los servicios nuevos; no se conservó una copia del transporte anterior.

## Archivos nuevos

- `docs/revision-estructura.md`
- `src/modules/agenda/services/README.md`
- `src/modules/agenda/viewmodels/agenda-state.ts`
- `src/modules/autenticacion/services/README.md`
- `src/modules/autenticacion/viewmodels/autenticacion-state.ts`
- `src/modules/carrito/adapters/README.md`
- `src/modules/carrito/models/carrito.ts`
- `src/modules/carrito/services/README.md`
- `src/modules/carrito/viewmodels/carrito-state.ts`
- `src/modules/catalogo/viewmodels/catalogo-state.ts`
- `src/modules/configuracion/services/README.md`
- `src/modules/configuracion/viewmodels/configuracion-state.ts`
- `src/modules/cuenta/models/README.md`
- `src/modules/cuenta/services/README.md`
- `src/modules/cursos/services/cursos-service.ts`
- `src/modules/cursos/viewmodels/cursos-state.ts`
- `src/modules/favoritos/services/README.md`
- `src/modules/favoritos/viewmodels/favoritos-state.ts`
- `src/modules/informacion/services/README.md`
- `src/modules/informacion/viewmodels/informacion-state.ts`
- `src/modules/inicio/models/README.md`
- `src/modules/inicio/services/README.md`
- `src/modules/notificaciones/services/README.md`
- `src/modules/notificaciones/viewmodels/notificaciones-state.ts`
- `src/modules/perfil/services/README.md`
- `src/modules/perfil/viewmodels/perfil-state.ts`
- `src/modules/productos/services/productos-service.ts`
- `src/modules/productos/viewmodels/productos-state.ts`
- `src/modules/servicios/services/servicios-service.ts`
- `src/modules/servicios/viewmodels/servicios-state.ts`
- `src/modules/ventas/services/README.md`
- `src/modules/ventas/viewmodels/ventas-state.ts`
- `tests/api-config.test.cjs`

## Archivos modificados en su ubicación

- `README.md`
- `docs/arquitectura-mvvm.md`
- `docs/endpoints-api.md`
- `docs/estructura-modulos.md`
- `docs/guia-estilos.md`
- `docs/implementacion-adapter.md`
- `src/app/_layout.tsx`
- `src/app/carrito.tsx`
- `src/components/navigation/bottom-navigation.tsx`
- `src/components/themed-text.tsx`
- `src/components/themed-view.tsx`
- `src/components/ui/account-section-styles.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/icon.tsx`
- `src/components/ui/screen.tsx`
- `src/components/ui/style-guide.tsx`
- `src/components/ui/text-field.tsx`
- `src/components/ui/touchable.tsx`
- `src/config/api.ts`
- `src/hooks/use-theme.ts`
- `src/modules/agenda/adapters/README.md`
- `src/modules/agenda/models/cita.ts`
- `src/modules/agenda/viewmodels/use-agenda-view-model.ts`
- `src/modules/agenda/views/agenda-view.tsx`
- `src/modules/autenticacion/adapters/README.md`
- `src/modules/autenticacion/models/autenticacion.ts`
- `src/modules/autenticacion/viewmodels/use-autenticacion-view-model.ts`
- `src/modules/autenticacion/views/autenticacion-view.tsx`
- `src/modules/catalogo/adapters/README.md`
- `src/modules/catalogo/models/catalogo.ts`
- `src/modules/catalogo/viewmodels/catalogo-view-model.ts`
- `src/modules/catalogo/viewmodels/use-catalogo-view-model.ts`
- `src/modules/catalogo/views/catalogo-view.tsx`
- `src/modules/configuracion/adapters/README.md`
- `src/modules/configuracion/models/configuracion.ts`
- `src/modules/configuracion/viewmodels/use-configuracion-view-model.ts`
- `src/modules/configuracion/views/configuracion-seccion-view.tsx`
- `src/modules/configuracion/views/configuracion-view.tsx`
- `src/modules/cuenta/adapters/README.md`
- `src/modules/cuenta/viewmodels/use-cuenta-view-model.ts`
- `src/modules/cuenta/views/cuenta-view.tsx`
- `src/modules/cursos/adapters/README.md`
- `src/modules/cursos/adapters/cursos-adapter.ts`
- `src/modules/cursos/models/curso.ts`
- `src/modules/cursos/viewmodels/cursos-view-model.ts`
- `src/modules/cursos/viewmodels/use-cursos-view-model.ts`
- `src/modules/cursos/viewmodels/use-mis-cursos-view-model.ts`
- `src/modules/cursos/views/cursos-view.tsx`
- `src/modules/favoritos/adapters/README.md`
- `src/modules/favoritos/models/favorito.ts`
- `src/modules/favoritos/viewmodels/use-favoritos-view-model.ts`
- `src/modules/informacion/adapters/README.md`
- `src/modules/informacion/models/informacion.ts`
- `src/modules/informacion/viewmodels/use-informacion-view-model.ts`
- `src/modules/informacion/viewmodels/use-no-encontrado-view-model.ts`
- `src/modules/inicio/adapters/README.md`
- `src/modules/inicio/viewmodels/use-inicio-view-model.ts`
- `src/modules/inicio/views/inicio-view.tsx`
- `src/modules/notificaciones/adapters/README.md`
- `src/modules/notificaciones/models/notificacion.ts`
- `src/modules/notificaciones/viewmodels/use-notificaciones-view-model.ts`
- `src/modules/perfil/adapters/README.md`
- `src/modules/perfil/models/perfil.ts`
- `src/modules/perfil/viewmodels/use-editar-perfil-view-model.ts`
- `src/modules/perfil/viewmodels/use-perfil-view-model.ts`
- `src/modules/perfil/views/perfil-view.tsx`
- `src/modules/productos/adapters/README.md`
- `src/modules/productos/adapters/productos-adapter.ts`
- `src/modules/productos/models/producto.ts`
- `src/modules/productos/viewmodels/use-productos-view-model.ts`
- `src/modules/servicios/adapters/README.md`
- `src/modules/servicios/adapters/servicios-adapter.ts`
- `src/modules/servicios/models/servicio.ts`
- `src/modules/servicios/viewmodels/servicios-view-model.ts`
- `src/modules/servicios/viewmodels/use-servicios-view-model.ts`
- `src/modules/servicios/views/servicios-view.tsx`
- `src/modules/ventas/adapters/README.md`
- `src/modules/ventas/models/venta.ts`
- `src/modules/ventas/viewmodels/use-compras-view-model.ts`
- `src/shared/viewmodels/load-state.ts`
- `tests/http-client.test.cjs`
- `tests/load-state.test.cjs`
- `tests/module-viewmodels.test.cjs`
- `tests/public-adapters.test.cjs`

## Archivos retirados sin reemplazo ejecutable

- `src/modules/catalogo/models/catalogo-preview.ts`
- `src/modules/productos/models/productos-preview.ts`

Solo contenían datos de ejemplo de catálogo sin consumidores activos. El contenido útil del antiguo transporte, adapter de composición, DTO, estados, vistas y ViewModels se trasladó antes de retirar sus ubicaciones anteriores. La carpeta shared/http quedó vacía y se retiró sin borrado recursivo.

## Pendiente o no verificado

- Sesión móvil: el contrato disponible documenta NextAuth web; falta probar un mecanismo móvil compatible. No se inventan Bearer ni sesiones.
- Login/registro/recuperación/cambio y cierre de sesión, perfil remoto, citas/disponibilidad/reserva, inscripción/mis cursos, favoritos, carrito persistente, compras/pago y notificaciones reales siguen con el alcance previo. Registro necesita reconciliar teléfono y perfil no puede asumir edición de correo.
- Carrito no tenía cantidades editables; sus totales son del ejemplo existente. No hay checkout implementado. Configuración no persiste preferencias ni modifica la configuración administrativa del backend.
- FAQ remoto, soporte y textos legales definitivos siguen pendientes; los textos locales se conservaron.
- La proyección de Producto valida categorías y variantes del DTO, pero no incorpora detalle o selector de variantes inexistentes.
- No se hicieron escrituras remotas, login con credenciales ni modificaciones al backend. La auditoría histórica de contratos se conserva con su fecha y no se presenta como verificación viva del despliegue.
- Android/iOS en dispositivo o emulador y regresión visual completa requieren revisión manual. MVVM/Adapter está separado para el código existente; las funcionalidades remotas pendientes no se declaran completas.

## Etapa 1 · corrección estructural y datos públicos

Actualización de implementación del 11 de octubre de 2026. Se migró el único módulo de autenticación a `src/modules/auth`; las rutas `/autenticacion` y `/cuenta/*` se conservaron. No hay una segunda implementación de sesión. `AppHeader` se integró en `Screen`, `AppFooter` en la pantalla de acceso, y los componentes compartidos existentes siguen concentrados en `src/components/`; se añadieron estados de carga/error/vacío con reintento y filtros por texto, categoría/stock de producto, categoría de servicio y nivel de curso. La navegación inferior sigue montada una sola vez en el layout y el detalle de producto marca Catálogo como activo.

El inicio obtiene servicios desde `GET /api/servicios`, con error, carga, vacío y reintento. Quitó la cita/destacados de ejemplo; la agenda personal indica que requiere acceso. Catálogo continúa componiendo `GET /api/servicios`, `GET /api/cursos` y `GET /api/productos`; el adapter de producto ya preserva relación de marca/categoría, JSON de imagen, existencia y cada variante (ID, tono, presentación, precio, stock e imagen). Las tarjetas Ver abren su detalle. Producto se resuelve buscando su ID en el listado público porque la fuente revisada no tiene detalle individual; el selector guarda el ID real y muestra precio/stock. Agregar al carrito sigue sin acción, por falta de sesión móvil verificada.

Se actualizaron `.env.example` y la configuración sigue leyendo una sola vez `EXPO_PUBLIC_API_URL`; `.env` no se modificó ni se imprimió. Los contratos de API siguen confirmados en código fuente de `main` commit `6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61`; ninguna respuesta viva de servidor se afirma como prueba.

### Próxima etapa: auth, perfil y módulos protegidos

Antes de usar la respuesta de `POST /api/auth/credentials` como sesión móvil, hay que verificar el flujo NextAuth real desde Expo: llamada de creación de sesión (el sitio usa `signIn` después de validar credentials), cookies enviadas y aceptadas por Android/iOS/web, token CSRF, persistencia tras cerrar/reabrir la app, expiración y refresco, logout y revocación de cookies. La respuesta credentials solo es información de usuario. Si NextAuth depende de cookies web/CSRF incompatibles con el cliente nativo, solicitar al backend el contrato de sesión móvil (emisión, validación en rutas protegidas, expiración, renovación y logout); no almacenar el JSON de usuario como sesión.

Bloqueo externo separado: el código fuente auditado de backend muestra que `withRasp` bloquea caracteres de entrada como apóstrofo y `#` y puede registrar parte del body. Incide en registro, reset de contraseña y actualización de perfil. No se cambió el backend y la app no debe endurecer contraseñas ni nombres para ocultarlo; corresponde resolverlo en el repositorio de backend y luego validar allí.

Pendientes móviles concretos:

- Auth: registro hoy requiere reconciliar teléfono obligatorio del backend y formulario móvil; verificación por email y reenvío de enlace; recuperación y reset; cambio de contraseña protegido; sesión/logout/restauración/expiración. La verificación/reenvío/reset usan enlaces web, falta especificación de deep link móvil.
- Perfil: `GET`/`PUT /api/usuario/perfil` protegidos; revisar campos porque correo no se actualiza en ese PUT. La pantalla local no está conectada a sesión ni servicio.
- Configuración: mantener Notificaciones, Apariencia (Claro/Oscuro/Automático), Idioma (Español), Métodos de pago, Cambiar contraseña, Sesiones activas y Eliminar cuenta. Apariencia solo selecciona un radio en memoria y el tema no cambia/persiste; idioma no tiene acción; métodos de pago solo presenta texto y botón deshabilitado. Cambiar contraseña requiere sesión. No se halló contrato para preferencias personales, idioma, sesiones por dispositivo/revocación, instrumentos de pago guardados o baja de cuenta. `/api/config-sitio` es administrativo y no aplica a preferencias móviles.
- Agenda: preview local; listar, crear y cancelar citas requiere sesión; contrato actual no resuelve disponibilidad/horarios libres.
- Carrito: preview local; lista, alta por `variante_id`, actualización de cantidad y borrado usan sesión; no conectar hasta validar sesión. El selector de producto conserva el ID necesario, pero no simula compra.
- Ventas: historial y checkout/pago no están integrados; `/api/pedidos` requiere sesión y carrito.
- Mis cursos: listado de inscripciones e inscripción requieren sesión; la pantalla conserva estado explícito pendiente.
- Favoritos: lecturas/escrituras diferenciadas por productos, servicios y cursos, las rutas protegidas necesitan sesión.
- Notificaciones: la pantalla local es preferencia visual. Recordatorios del backend requieren sesión y no equivalen a permiso del sistema, registro push o preferencias personales.

FAQ remoto, soporte y textos legales finales siguen pendientes. Imágenes de respuesta JSON solo se dibujan cuando el valor recibido es una URL HTTP(S) directa; el JSON completo se conserva aunque el servidor use otra forma.

Validación de la etapa 1: `npm run typecheck` aprobó; `npm test` aprobó con 40/40; lint tuvo cero errores y un aviso previo en `src/hooks/use-color-scheme.web.ts:11`. La comprobación posterior de etapa 2, incluyendo API en vivo, 41 pruebas y estado de exportación, está en [validacion-etapa2.md](validacion-etapa2.md).
