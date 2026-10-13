> Actualización del 12 de octubre de 2026: el bloqueo provisional de registro y el preflight de credentials descritos en esta etapa fueron retirados. Recuperación y los demás flujos ya se conectan a sus servicios reales. El estado actual y las comprobaciones están en [Corrección de flujos de acceso](correccion-flujos-acceso.md).

# Diseño y autenticación de Salón Brenn’s

Revisión del 12 de octubre de 2026. Se aplicaron correcciones sustentadas en la referencia de Brenn’s y se implementaron los formularios dentro del módulo auth existente. Inicio de sesión está implementado y probado con fixtures locales; su funcionamiento contra la API con una cuenta real sigue pendiente. Crear cuenta tiene formulario, validación, Adapter, Service y paso de verificación, pero su envío permanece bloqueado por un defecto confirmado del backend. No se presenta ese flujo como terminado ni probado contra la API.

## Referencia visual y alcance

Se revisaron `docs/guia-estilos.md`, los contratos y la implementación existente. El PDF aprobado está en `C:/Users/benil/Videos/2026 10cuatrimestre/movil/Actividad_3_Bina15.pdf`. Se inspeccionaron las páginas renderizadas y las imágenes de pantalla extraídas de ese mismo archivo en `C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/reference/`: páginas 4–5 para acceso/registro, 7 para Inicio/Catálogo, 8–10 para Servicio/Agenda/Curso, 12 para Carrito, 16–17 para Perfil/Configuración/Apariencia y 22 para confirmaciones. La imagen de Consultorio Nutricional no se utilizó como referencia visual.

Los colores planos se comprobaron leyendo los píxeles de las imágenes originales extraídas, además de inspeccionar las páginas. La referencia corresponde al modo Claro:

| Token | Valor aplicado | Uso |
| --- | --- | --- |
| `background` | `#FCFAFC` | Fondo de pantallas |
| `backgroundElement` | `#FFFFFF` | Campos, tarjetas, filas y barra inferior |
| `primary` | `#ED4087` | Botones, enlaces y opción activa |
| `primarySoft` | `#FFE8F2` | Categorías y superficies de énfasis |
| `text` | `#1F1419` | Texto principal |

Se conservaron Inter Regular/Bold, tamaños, radios, espaciados y mínimos táctiles de la guía compartida. Se corrigieron las superficies invertidas, el fondo fijo de Screen, los campos y botones secundarios que usaban blanco fijo en modo Oscuro, la separación entre marca y título y la cabecera compacta de Cuenta. Las imágenes de las tarjetas compactas de Inicio ocupan el ancho disponible. Teléfono y mostrar/ocultar contraseña son las ampliaciones funcionales solicitadas, integradas con los mismos controles.

La barra inferior sigue siendo única y conserva Inicio, Catálogo, Agenda, Carrito y Perfil: activa rosa e inactivas grises. Claro/Oscuro/Automático mantienen la gestión de preferencias existente; la barra de estado y el color-scheme web reflejan el tema seleccionado. No se cambiaron las fuentes públicas de datos, la configuración de URL ni los modelos de catálogo/servicios/cursos/productos.

## Componentes e integración

- `Screen`, `AppHeader` y `ThemedView`: todas las pantallas que ya los utilizan reciben las correcciones de superficies y cabeceras. Cuenta utiliza la cabecera compacta.
- `Button`/`CustomButton`: carga impide pulsaciones y utiliza colores del tema en estados normales, pulsados y deshabilitados. Continúa reenviando referencia y eventos.
- `TextField`/`CustomInput`: campos blancos en Claro, superficies oscuras en Oscuro, texto/foco/error según tema, referencia del input y acción accesible para mostrar/ocultar contraseña. Integrado en acceso, registro y cambio de contraseña; también beneficia los formularios existentes de perfil y cuenta.
- `CatalogCard`, `MediaPlaceholder` y `MenuRow`: superficies mediante tema; tarjeta compacta con imagen de ancho completo; filas del menú ya conservan `StyleSheet.flatten`.
- `StatusMessage`: mensajes legibles de error, información y confirmación en autenticación y en el estado de error de las lecturas públicas. LoadingState y EmptyState conservan sus tokens y comportamiento existentes.
- `AppFooter`: se reutiliza para la copia legal de acceso. No se necesitó modificar su archivo.
- `Touchable`: se conserva sin cambios. Reenvía `ref`, `onPress`, `onClick`, propiedades del enlace y accesibilidad al Pressable. Los hijos de `Link asChild` revisados tienen estilos estáticos o aplanados; las funciones de estilos de interacción permanecen dentro de los componentes reutilizables.

## Flujos y contratos

Acceso valida correo y contraseña, controla carga y envíos duplicados, conserva errores reales y ofrece Crear cuenta/Recuperar contraseña. Primero consulta `/api/auth/credentials` para preservar los códigos y mensajes reales; cualquier rechazo termina allí, sin callback ni reintento. Solo las credenciales aceptadas continúan con CSRF y el callback de NextAuth. El callback usa el encabezado oficial `X-Auth-Return-Redirect: 1`, evitando depender de una redirección para capturar la sesión. Solo se publica el estado autenticado después de `/api/auth/session` y un perfil coincidente en `/api/usuario/perfil`.

Se conserva el proveedor único de sesión. Su restauración inicial ya no se repite con cada cambio de estado; una restauración antigua no sobrescribe un acceso más reciente. Se preserva la clave de SecureStore y se validan cookies antes de construir cabeceras. En web las cookies HttpOnly pertenecen al navegador. Los errores 401 de operaciones protegidas limpian el estado y solicitan un nuevo acceso. Logout envía CSRF al handler NextAuth, borra el almacenamiento local y comprueba si todavía existe una sesión del servidor; los fallos se muestran, sin afirmar un cierre remoto confirmado.

Las rutas protegidas envían `returnTo` a acceso. El destino conserva la consulta y se limita a rutas internas existentes; se rechazan destinos externos, rutas desconocidas y ciclos de autenticación. Crear cuenta, recuperación y sus enlaces de regreso conservan ese destino. Inicio utiliza el nombre de una sesión confirmada cuando existe; su tarjeta de agenda abre `/agenda`, de modo que el acceso puede regresar allí. No se inventa una próxima cita ni se cambia el servicio público de destacados.

Registro solicita nombre, correo, teléfono, contraseña y confirmación. La contraseña no se recorta ni restringe por caracteres; el mínimo confirmado del backend es 8. La confirmación y la aceptación local de términos no se envían. El Adapter construye exactamente `{ name, email, password, telefono }`, sin rol. Solo HTTP 201 con `message` y `requiresVerification` válidos confirma creación. El paso de verificación aparece únicamente tras esa respuesta; no crea una sesión. El Service conserva errores 400/409/429/500.

El reenvío confirmado usa `POST /api/auth/reenviar-verificacion` con `{ correo }` y exige `{ ok: true }`. Su mensaje indica que se recibirá un enlace si la cuenta lo requiere, porque el backend responde igual para correos inexistentes o verificados y envía el correo sin esperar su entrega. También se ofrece reenvío cuando el acceso devuelve `EMAIL_NOT_VERIFIED`.

Las rutas de Expo Router siguen delegando en Views. Models contiene dominio, Adapters transforma solicitudes/respuestas/cookies/errores, Services utiliza el cliente HTTP compartido y ViewModels contiene estado, validaciones y acciones.

## Bloqueo confirmado y corrección necesaria

Se volvieron a leer en GitHub las fuentes actuales de `main` el 12 de octubre:

- [Registro](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/register/route.ts): cuatro campos obligatorios, mínimo de contraseña 8, rol público CLIENTE, HTTP 201 y verificación requerida. Sigue envuelto en `withRasp`.
- [withRasp](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/lib/withRasp.ts): inspecciona el JSON completo, rechaza apóstrofos y `#` entre otros patrones, y registra `bodyText.slice(0, 200)` ante determinados rechazos. Puede incluir la contraseña.
- [Credentials](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/credentials/route.ts): distingue correo sin verificar, credenciales incorrectas, cuenta bloqueada/inactiva y errores del servidor.
- [NextAuth](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/lib/auth.ts), [perfil](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/usuario/perfil/route.ts) y [reenvío](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/reenviar-verificacion/route.ts): contratos leídos en fuente, sin probar una cuenta en el despliegue.
- [Cliente oficial de Auth.js](https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/react.tsx): encabezado del callback y signout verificado en fuente primaria.

`REGISTRATION_BLOCKED` en `auth-service.ts` bloquea el botón y también el envío desde el Service. La app presenta indisponibilidad temporal, sin mostrar detalles internos del backend. Las pruebas confirman que el bloqueo impide cualquier petición; no se enviaron formularios sensibles ni correos de prueba al backend real.

La corrección pertenece al backend: eliminar el registro del body sensible, usar únicamente metadatos seguros, sustituir las heurísticas globales que rechazan nombres/contraseñas legítimos por validación por campo y protección basada en consultas parametrizadas, y comprobar entradas con apóstrofos y `#` sin exponerlas en logs. Después se debe confirmar el despliegue corregido, revisar también las rutas sensibles que comparten el wrapper y retirar el bloqueo de registro en esta app. No se modificó ese repositorio. Recuperación conserva el acceso a su pantalla y el envío deshabilitado; no se declara implementada una recuperación contra la API.

## Comprobaciones reales

| Comprobación | Resultado |
| --- | --- |
| `npx.cmd --no-install tsc --noEmit` | Código 0 en la versión final |
| `npx.cmd --no-install expo lint` | Código 0; 0 errores y 1 advertencia previa en `src/hooks/use-color-scheme.web.ts:11`, `react-hooks/set-state-in-effect` |
| `npm.cmd run test` | 59 pruebas, 59 aprobadas, 0 fallidas; incluye las 41 existentes y 18 nuevas de autenticación |
| Pruebas auth después de separar el Adapter de errores | 18 aprobadas, 0 fallidas |
| Metro | Activo en `http://localhost:8082`; `/status` devuelve `packager-status:running` |
| Compilación y renderizado del servidor web | `/autenticacion`, `/cuenta/crear-cuenta` e `/` respondieron HTTP 200. El HTML contiene los encabezados, campos y controles esperados. Esta comprobación no ejecuta interacción del navegador |
| Inspección de referencia | Páginas e imágenes del PDF inspeccionadas; colores planos medidos; comparación estática con componentes y tokens |
| Revisión visual de la app actual | Pendiente: inventario de navegador vacío y `Browser is not available: iab` al intentar abrir la app |
| Cuenta real/API | Pendiente: no se introdujeron credenciales ni se enviaron registro/reenvío/recuperación a la API real |
| Dispositivo, teclado y navegación interactiva | Pendientes |

Las pruebas de autenticación usan transporte y almacenamiento inyectados con fixtures locales. Cubren contrato de registro y bloqueo sin red, validación, duplicados, errores HTTP, reenvío, destinos de regreso, errores de credenciales sin reintento, CSRF/callback, cookies por fragmentos, sesión/perfil, restauración, web y cierre. No sustituyen la prueba contra NextAuth, SecureStore y el almacén de cookies de un dispositivo real. Las pruebas públicas existentes continúan comprobando contratos y modelos de API sin introducir datos de ejemplo en las Views.

## Archivos de esta tarea

Se conservan los cambios funcionales previos. Este inventario describe únicamente las modificaciones realizadas para esta solicitud:

| Archivo | Motivo |
| --- | --- |
| `src/theme/index.ts` | Valores medidos de fondo, superficies, texto y rosa suave |
| `src/theme/theme-preference-provider.tsx` | Tema efectivo, barra de estado/color-scheme y recuperación de preferencias |
| `src/app/_layout.tsx` | Guardas y retorno a ruta protegida; estado de tema |
| `src/components/themed-view.tsx` | Superficies de control coherentes con el tema |
| `src/components/ui/screen.tsx` | Fondo dinámico y cabecera compacta |
| `src/components/ui/button.tsx` | Superficies temáticas y carga deshabilitada |
| `src/components/ui/text-field.tsx` | Contraseñas visibles/ocultas, tema, foco, errores y refs |
| `src/components/ui/style-guide.tsx` | Imagen de ancho completo en tarjeta compacta; flatten conservado |
| `src/components/navigation/bottom-navigation.tsx` | Superficie de barra conforme a la referencia |
| `src/components/layout/app-header.tsx` | Jerarquía de marca/título y cabecera compacta |
| `src/components/feedback/status-message.tsx` | Mensajes compartidos de error/información/confirmación |
| `src/components/feedback/async-states.tsx` | Integración del mensaje compartido en errores de API |
| `src/services/api.ts` | Transporte compartido GET/POST/PUT, estado/cabeceras de respuesta y manejo de 401 |
| `src/modules/auth/models/autenticacion.ts` | Teléfono y tipos de sesión/registro/validación |
| `src/modules/auth/models/auth-error.ts` | Error de dominio con código |
| `src/modules/auth/models/auth-navigation.ts` | Destinos internos válidos de regreso |
| `src/modules/auth/adapters/auth-adapter.ts` | Contratos de registro, sesión y perfil |
| `src/modules/auth/adapters/auth-error-adapter.ts` | Transformación de errores de transporte al dominio |
| `src/modules/auth/adapters/next-auth-cookies.ts` | CSRF, fragmentos y validación de cookies |
| `src/modules/auth/services/auth-service.ts` | Registro bloqueado y reenvío confirmado |
| `src/modules/auth/services/session-cookie-storage.ts` | Puerto de almacenamiento, misma clave segura existente |
| `src/modules/auth/services/next-auth-session-service.ts` | Flujo real NextAuth a través del transporte compartido |
| `src/modules/auth/viewmodels/auth-session-provider.tsx` | Proveedor único, restauración y estados confirmados |
| `src/modules/auth/viewmodels/autenticacion-state.ts` | Estado inicial con teléfono |
| `src/modules/auth/viewmodels/auth-validation.ts` | Validación y protección contra envíos duplicados |
| `src/modules/auth/viewmodels/use-autenticacion-view-model.ts` | Acciones/estado de acceso, registro, verificación y retorno |
| `src/modules/auth/views/autenticacion-view.tsx` | Formulario de acceso operativo y enlaces |
| `src/modules/auth/views/autenticacion-seccion-view.tsx` | Integración de registro y controles de cuenta existentes |
| `src/modules/auth/views/crear-cuenta-view.tsx` | Formulario completo y estado de verificación |
| `src/modules/auth/views/verificacion-correo.tsx` | Paso compartido de verificación y reenvío |
| `src/modules/cuenta/views/cuenta-view.tsx` | Integración con ruta existente, cabecera y regreso |
| `src/modules/inicio/viewmodels/use-inicio-view-model.ts` | Saludo de sesión confirmada conservando datos públicos |
| `src/modules/inicio/views/inicio-view.tsx` | Saludo/agenda y flatten conservado |
| `tests/auth-contracts.test.cjs` | Contratos, validación, bloqueo, duplicados y retorno |
| `tests/auth-session.test.cjs` | Sesión real del código, errores, cookies y restauración con fixtures |
| `docs/diseno-auth-octubre-2026.md` | Inventario, evidencia, resultados y pendientes |

## Verificación pendiente en la app

1. Abrir con Expo SDK 57 en un dispositivo o navegador conectado. Para un dispositivo en la red local, iniciar Expo con `npx.cmd expo start` desde el proyecto; el servidor de esta revisión está limitado a localhost para web.
2. Seleccionar Claro y comparar con el PDF. Revisar también Oscuro y Automático, textos, controles deshabilitados y la única opción rosa de la barra.
3. Recorrer Inicio/Catálogo/Perfil y las tarjetas, comprobar que no aparece el error de Slot, y usar los campos con teclado y mostrar/ocultar contraseña.
4. Introducir las credenciales de prueba directamente en la app. Comprobar los códigos de rechazo sin repetir automáticamente, acceso válido, retorno desde Agenda/Carrito/Cuenta, reapertura, expiración, perfil y logout. En web confirmar CORS/cookies del despliegue; en Android/iOS comprobar recepción y renovación de cookies y SecureStore.
5. Tras la corrección del backend y retirada del bloqueo, comprobar registro 201, errores reales, verificación/reenvío y acceso posterior. Nunca presentar la respuesta credentials ni la respuesta de registro como una sesión autenticada.
