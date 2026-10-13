# Corrección de los flujos de acceso

12 de octubre de 2026. Registro, recuperación, reenvío y acceso tienen formularios y servicios operativos en código. Se retiraron las restricciones provisionales que mostraban indisponibilidad. El funcionamiento con una cuenta real introducida en la app queda pendiente; las consultas anónimas a la API y las pruebas locales realizadas se detallan por separado.

## Causas exactas y condiciones corregidas

| Archivo | Condición anterior | Corrección |
| --- | --- | --- |
| `src/modules/auth/services/auth-service.ts` | `REGISTRATION_BLOCKED = true`; `registrar()` lanzaba `REGISTRATION_UNAVAILABLE` antes de cualquier petición | Eliminados flag, mensaje y retorno anticipado. Registro envía el contrato real y muestra la respuesta del servidor |
| `src/modules/auth/views/crear-cuenta-view.tsx` | Mostraba `REGISTRATION_UNAVAILABLE` y usaba `disabled={vm.registroBloqueado}` | Eliminados aviso y condición. El botón sólo se deshabilita durante una solicitud |
| `src/modules/auth/viewmodels/use-autenticacion-view-model.ts` | Exportaba `registroBloqueado`; cualquier formulario usaba `estado.error ?? auth.error` | Eliminado flag. El error global de sesión sólo se presenta en acceso; las acciones reportan su operación y sus propios errores |
| `src/modules/auth/views/autenticacion-seccion-view.tsx` | Recuperación mostraba un mensaje fijo de indisponibilidad y `PreviewAction` sin `onPress` | Sustituido por CustomButton conectado a `recuperarContrasena()`, con carga y validación de correo |
| `src/modules/auth/services/next-auth-session-service.ts` | POST directo a credentials seguido de POST al callback | Eliminado el preflight. Sólo se envía la contraseña al callback una vez por intento |

Los dos mensajes de indisponibilidad eran decisiones provisionales del cliente, no respuestas HTTP que demostraran que esos endpoints estaban fuera de servicio. Se habían añadido en la etapa anterior y se corrigieron aquí.

Se conservan restricciones por campos inválidos, consentimiento local de términos del formulario aprobado, solicitud en curso, token ausente para reset/verificación y falta de sesión para cambiar contraseña. El caso separado de eliminar cuenta conserva su acción pendiente porque no hay endpoint de eliminación confirmado; no condiciona ninguno de los flujos solicitados.

## Contratos y versión contrastados

Se volvieron a leer las fuentes actuales de `salonbrenns/SistemaBrenns`: handlers de NextAuth, configuración de Credentials, registro, recuperación, reset, verificación, reenvío, email y withRasp. [package-lock.json](https://github.com/salonbrenns/SistemaBrenns/blob/main/package-lock.json) fija NextAuth `5.0.0-beta.30` y `@auth/core 0.41.0`. La versión ejecutada por el despliegue no se deduce de las respuestas HTTP.

Se contrastó el callback con el [cliente oficial de esa versión](https://github.com/nextauthjs/next-auth/blob/next-auth%405.0.0-beta.30/packages/next-auth/src/react.tsx) y el [manejo oficial de CSRF](https://github.com/nextauthjs/next-auth/blob/next-auth%405.0.0-beta.30/packages/core/src/lib/actions/callback/oauth/csrf-token.ts). La base continúa procediendo de `EXPO_PUBLIC_API_URL` mediante `getApiUrl()` y el transporte compartido.

| Operación | Solicitud implementada | Confirmación |
| --- | --- | --- |
| Proveedores | GET `/api/auth/providers`, sin body | Proveedor `credentials` de tipo `credentials` |
| CSRF | GET `/api/auth/csrf`, sin body | Token y cookie firmada correspondiente en nativo; cookies gestionadas por el navegador en web |
| Login | POST `/api/auth/callback/credentials`, URL encoded: `correo,password,csrfToken,callbackUrl`; `Content-Type: application/x-www-form-urlencoded`, `X-Auth-Return-Redirect: 1` | Interpreta `error`/`code` del JSON y URL; exige sesión con usuario vigente, correo ingresado y perfil coincidente; admite cookies del almacén nativo aunque JavaScript no pueda leerlas |
| Sesión | GET `/api/auth/session`, cookie de sesión | Usuario con id/correo y expiración válida; consulta `/api/usuario/perfil` antes de autenticar |
| Logout | POST `/api/auth/signout`, URL encoded: `csrfToken,callbackUrl`; cookie de sesión y cookie CSRF; mismo encabezado de retorno | Interpreta errores NextAuth, limpia sesión local y comprueba que la sesión del servidor no siga activa |
| Registro | POST `/api/auth/register`, JSON `{name,email,password,telefono}` | HTTP 201 y `message/requiresVerification` válidos; nunca inicia sesión automáticamente |
| Recuperación | POST `/api/auth/recuperar-contrasena`, JSON `{correo}` | `{ok:true}`; mensaje genérico que no revela si existe la cuenta ni asegura entrega del correo |
| Reset | POST `/api/auth/reset-contrasena`, JSON `{token,password}` | `{ok:true}` antes de confirmar cambio; validación local de coincidencia y mínimo 8 |
| Verificación | GET `/api/auth/verificar-email?token=...`, token codificado | `{ok:true}`; no se presenta éxito ante token inválido/expirado o respuesta inesperada |
| Reenvío | POST `/api/auth/reenviar-verificacion`, JSON `{correo}` | `{ok:true}`; mensaje genérico porque el backend responde igual para cuentas inexistentes o verificadas |
| Cambio de contraseña | PUT `/api/usuario/password`, JSON `{passwordActual,passwordNueva}`, sesión | `{ok:true}`; rechazo real sin sesión o autorización |

Nombre/correo se transforman a name/email. Confirmación y consentimiento se validan localmente y no se envían. No se envía rol ni se modifican caracteres de contraseñas para satisfacer withRasp. El callback es la única solicitud del cliente que lleva la contraseña de acceso; la llamada interna a credentials pertenece al proveedor del backend.

## Cookies, sesión y errores

Se reutilizó el servicio y proveedor de sesión únicos. En nativo, una cookie CSRF legible se guarda con su token en una clave separada de SecureStore. No se incluye en `cookieHeader()` ni sirve como prueba de sesión. Esto permite reutilizar el par cuando GET CSRF devuelve el mismo token sin un nuevo Set-Cookie. La [corrección posterior de CSRF](correccion-csrf.md) elimina la exigencia de cookies legibles y el header Cookie vacío: también se permite el almacén automático de Expo/React Native con credentials: include. El intercambio en Android/iOS sigue pendiente de dispositivo.

Las cookies de sesión, incluidos fragmentos, conservan su clave existente y se actualizan al renovar la sesión. Perfil utiliza la cookie renovada. No se invoca window, document ni APIs de cookies del navegador dentro del módulo auth; la distinción web/nativo usa Platform y el transporte compartido. La restauración inicial conserva el tratamiento de una sesión expirada como anónima; una nueva tentativa de acceso preserva el endpoint y estado de un perfil rechazado.

`AuthError` conserva operación, código, estado y ruta. La interfaz muestra el motivo recibido con operación y HTTP cuando corresponda. Las consultas se eliminan de las rutas de diagnóstico para no mostrar el token. El cliente compartido también limpia la sesión ante un 401 protegido con respuesta HTML y elimina consultas de errores de JSON. No hay logs de cuerpos, contraseñas, cookies o tokens en auth.

El [authorize actual](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/lib/auth.ts) lanza Error genérico cuando falla credentials. Si NextAuth sólo devuelve `CallbackRouteError`, la app conserva esa condición y no inventa si fue contraseña incorrecta, cuenta bloqueada o correo sin verificar. Cuando llega un código específico se interpreta. El reenvío está disponible desde acceso incluso cuando el callback no expone `EMAIL_NOT_VERIFIED`. Para mensajes más específicos, el backend debe exponer códigos seguros a través de CredentialsSignin, sin revelar credenciales. No se consulta credentials otra vez para adivinar el motivo.

## Pantallas y rutas

Acceso, registro y recuperación utilizan CustomInput/CustomButton (los componentes compartidos existentes), encabezados y mensajes compartidos. Se conservan paleta, tipografía, tokens, navegación de regreso y StyleSheet.flatten en los hijos de Link asChild.

Se añadieron rutas públicas que delegan en Views de auth:

- `/reset-contrasena?token=...`, coincidente con la ruta usada por el email del backend.
- `/verificar-email?token=...`, coincidente con el enlace de verificación.
- Sus variantes en `/cuenta/restablecer-contrasena` y `/cuenta/verificar-email` se integran con la ruta dinámica existente.

Las pantallas reciben el token del enlace, no lo imprimen y sólo confirman la operación mediante su respuesta real. Reset y verificación se ejecutan mediante acción explícita. La barra inferior se oculta en esas pantallas públicas de autenticación, manteniendo la única barra existente en el resto. Los enlaces HTTPS actuales siguen perteneciendo al sitio; la apertura automática en Android/iOS requiere verificar la asociación de dominio/deep links y no se ha afirmado como comprobada.

## withRasp: restricción precisa del servidor

La fuente actual confirma `withRasp` en [registro](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/register/route.ts) y [reset](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/reset-contrasena/route.ts). No aparece en [credentials](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/credentials/route.ts) ni [recuperación](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/auth/recuperar-contrasena/route.ts).

[withRasp](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/lib/withRasp.ts) puede rechazar apóstrofos/# y otros patrones con HTTP 403, y registrar los primeros 200 caracteres del body. La app conserva y muestra la respuesta de esa operación; un rechazo de registro/reset no deshabilita acceso, recuperación ni reenvío. Las pruebas locales comprueban un 403 de registro seguido de recuperación/reenvío exitosos en la misma instancia del Service, preservando la contraseña original.

La corrección externa pendiente es quitar el body sensible de los logs, validar por campo sin rechazar contraseñas/nombres legítimos mediante patrones globales y mantener consultas parametrizadas. No se elude el middleware, no se cambia el backend y no se enviaron contraseñas para comprobar ese defecto. La existencia del riesgo en fuente no se presenta como un rechazo de registro observado en vivo.

## Resultados reales

| Comprobación | Resultado |
| --- | --- |
| TypeScript, versión final | `npx.cmd --no-install tsc --noEmit`, código 0 |
| Lint, versión final | `npx.cmd --no-install expo lint`, código 0; 0 errores, 1 advertencia previa en `src/hooks/use-color-scheme.web.ts:11` |
| Pruebas locales | `npm.cmd run test`: 71/71 aprobadas, 0 fallidas |
| API configurada: GET providers | HTTP 200, credentials presente |
| API configurada: GET CSRF | HTTP 200, token y Set-Cookie presentes; valores no impresos |
| API configurada: GET session sin cookies | HTTP 200, sin usuario |
| API configurada: GET perfil sin cookies | HTTP 401, acceso anónimo rechazado |
| Metro | Activo en localhost:8082 |
| Renderizado del servidor web | Acceso, registro, recuperación, reset y verificación respondieron HTTP 200 |
| Navegador/dispositivo | Inventario conectado vacío; revisión visual/interactiva pendiente |
| Login/registro con cuenta real | Pendientes: no se introdujo una cuenta autorizada directamente en una superficie disponible |
| Entrega de correo, reset real, verificación real, logout y persistencia nativa | Pendientes |

Las cuatro consultas HTTP reales fueron de lectura y no enviaron credenciales. El primer intento de red restringida dio EACCES y se repitió con autorización; las respuestas anteriores corresponden a esa ejecución real. Las pruebas de POST y sesión completa utilizan transporte/almacenamiento inyectados con fixtures locales; no prueban un login real ni crean cuentas. Incluyen callback único, errores 200/URL, sesión/perfil, CSRF independiente, reutilización después de recrear el Service, renovación, logout, contratos, errores por operación, 401 HTML y aislamiento de registro/recuperación.

## Archivos modificados en esta corrección

| Archivo | Cambio |
| --- | --- |
| `src/modules/auth/services/auth-service.ts` | Retirada del bloqueo; registro, recuperación, reset, verificación y reenvío reales |
| `src/modules/auth/services/next-auth-session-service.ts` | Callback único, providers, CSRF reutilizable, pruebas de sesión/perfil y diagnóstico |
| `src/modules/auth/services/session-cookie-storage.ts` | Par CSRF separado en SecureStore |
| `src/modules/auth/adapters/next-auth-cookies.ts` | Validación del par CSRF y separación de cookies |
| `src/modules/auth/adapters/next-auth-callback.ts` | Nuevo Adapter de proveedores y errores NextAuth |
| `src/modules/auth/adapters/auth-error-adapter.ts` | Operación, HTTP, ruta y ocultación de consultas |
| `src/modules/auth/models/auth-error.ts` | Metadatos de diagnóstico del dominio |
| `src/modules/auth/viewmodels/auth-validation.ts` | Correo independiente y validación de nueva contraseña |
| `src/modules/auth/viewmodels/use-autenticacion-view-model.ts` | Acciones reales, mensajes por operación, carga y retirada del flag |
| `src/modules/auth/viewmodels/auth-session-provider.tsx` | Formato del aviso de sesión; proveedor único conservado |
| `src/modules/auth/viewmodels/autenticacion-state.ts` | Secciones de reset y verificación |
| `src/modules/auth/views/autenticacion-view.tsx` | Reenvío disponible y controles compartidos |
| `src/modules/auth/views/crear-cuenta-view.tsx` | Formulario habilitado, sin aviso provisional |
| `src/modules/auth/views/autenticacion-seccion-view.tsx` | Recuperación conectada; reset/verificación integrados |
| `src/modules/auth/views/verificacion-correo.tsx` | Alias CustomButton compartido |
| `src/modules/auth/views/restablecer-contrasena-view.tsx` | Nueva View pública de reset |
| `src/modules/auth/views/verificar-email-view.tsx` | Nueva View pública de verificación |
| `src/app/reset-contrasena.tsx` | Ruta que delega en View |
| `src/app/verificar-email.tsx` | Ruta que delega en View |
| `src/modules/cuenta/viewmodels/cuenta-state.ts` | Destinos de la ruta dinámica |
| `src/constants/navigation.ts` | Visibilidad de barra en rutas públicas de auth |
| `src/services/api.ts` | 401 protegido antes del parseo y errores de JSON sin consulta |
| `tests/auth-contracts.test.cjs` | Solicitudes reales del código, aislamiento y errores |
| `tests/auth-session.test.cjs` | Callback único, CSRF persistente, perfil, cookies y logout |
| `tests/http-client.test.cjs` | Invalidación ante un 401 HTML |
| `docs/correccion-flujos-acceso.md` | Este informe |
| `docs/diseno-auth-octubre-2026.md` | Aviso de que el bloqueo/preflight anterior fue sustituido |

La siguiente comprobación es abrir la app en un dispositivo conectado, introducir allí una cuenta de prueba autorizada y comprobar los errores reales y el acceso completo sin repetir credenciales automáticamente. Registro/reset deben revisarse con la corrección de logs del backend presente; la app ya permite sus solicitudes y comunica cualquier rechazo real de forma independiente.
