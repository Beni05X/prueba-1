# Corrección del cliente CSRF — 12 de octubre de 2026

## Causa localizada y límites de la evidencia

El usuario confirmó que el error ocurre en **Android**. El mensaje se emitía en `NextAuthSessionService.csrf()`, archivo `src/modules/auth/services/next-auth-session-service.ts`, ante esta condición:

```ts
typeof token !== 'string' || !token || (!web && !cookie)
```

`cookie` sólo procedía de Set-Cookie legible o del par previamente guardado cuyo token coincidiera. Por eso la última cláusula rechazaba una respuesta válida cuando el transporte conservaba la cookie pero no la exponía a JavaScript. Es un defecto confirmado de la guarda; no demuestra que el servidor haya omitido una cookie. La condición anterior también abarcaba un token ausente o inválido. No se capturó la respuesta del Android del usuario para determinar cuál de esas ramas ocurrió en esa ejecución.

Otros defectos confirmados en el código: el primer GET CSRF enviaba `Cookie: ""`; `getSetCookie()` vacío impedía usar el encabezado combinado; la separación de cookies sólo reconocía nombres Auth.js/NextAuth; login y restore exigían una cookie de sesión legible/guardada. Esta última exigencia tampoco demuestra que el almacén nativo carezca de una sesión.

El parser anterior **ya reconocía** `__Host-authjs.csrf-token` y decodificaba `token|hash`. No se atribuye el fallo observado a un prefijo incorrecto ni a un hash inválido sin evidencia del dispositivo.

## Transporte realmente configurado

`FetchHttpClient` utiliza el fetch global, con `credentials: 'include'`. No se encontró un reemplazo propio en src ni `EXPO_PUBLIC_USE_RN_FETCH` en la configuración local. Expo instalado es 57.0.24: [SDK 57 instala expo/fetch como fetch global en Android/iOS](https://docs.expo.dev/versions/v57.0.0/sdk/expo/#expofetch-api). Se verificó en las fuentes instaladas:

- `node_modules/expo/src/winter/runtime.native.ts`: reemplazo global salvo el flag de compatibilidad RN.
- `node_modules/expo/android/src/main/java/expo/modules/fetch/ExpoFetchModule.kt`: JavaNetCookieJar y ForwardingCookieHandler.
- `node_modules/expo/android/src/main/java/expo/modules/fetch/NativeRequest.kt`: mantiene el jar cuando credentials es include.
- `node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/network/ForwardingCookieHandler.kt`: guarda y consulta las cookies con CookieManager nativo.
- `node_modules/expo/android/src/main/java/expo/modules/fetch/NativeResponse.kt`: entrega una lista de pares de encabezados; FetchResponse crea Headers, que puede combinar valores repetidos.
- En iOS, Expo configura HTTPCookieStorage.shared y el manejo automático de cookies con include.

Esto confirma las capacidades del transporte instalado; aún no confirma que el jar del Android del usuario haya conservado/enviado esta pareja. No se cambió de transporte, no se instaló un gestor de cookies ni se modificó el backend.

## Cambios aplicados

| Archivo | Cambio |
| --- | --- |
| `src/modules/auth/services/next-auth-session-service.ts` | Elimina rechazo por CSRF no legible y Cookie vacío; comprueba token presente y coincidencia sólo cuando hay pareja legible; permite sesión automática sin cookie guardada; confirma usuario, correo ingresado y perfil; separa web/nativo antes de leer cookies; diagnóstico seguro y prueba anónima optativa |
| `src/modules/auth/adapters/next-auth-cookies.ts` | Prioriza __Host-authjs.csrf-token; reserva __Secure-authjs.session-token para sesión y __Secure-authjs.callback-url para callback; admite arrays/encabezados combinados y fallback de getSetCookie vacío; respeta Expires y comas entre comillas; descarta cookies eliminadas; decodifica el valor serializado para comparar sólo token, conserva token\|hash original |
| `src/modules/auth/services/session-cookie-storage.ts` | Añade plataforma real al diagnóstico; conserva almacenamiento separado de CSRF y sesión |
| `src/services/api.ts` | Devuelve tipo de respuesta y marca del fetch utilizado como metadatos; mantiene credentials: include y transporte existente |
| `tests/auth-cookies.test.cjs` | Nombres v5, cookie serializada, comparación, Expires, arrays, headers combinados, cookies ajenas y cookies eliminadas |
| `tests/auth-session.test.cjs` | Cookies automáticas no visibles, errores CSRF reales del servidor, pareja visible incompatible, callback cookie, web sin lectura de Set-Cookie, sesión/perfil obligatorios y diagnóstico sin valores sensibles |
| `scripts/check-csrf.cjs` | Prueba real anónima del parser/servicio bajo Node, sin credenciales ni persistencia; no acredita un dispositivo |
| `docs/correccion-flujos-acceso.md`, `docs/correccion-csrf.md` | Corrige la descripción anterior de la exigencia de cookies legibles y registra evidencia/pending |

El valor completo de la cookie emitida se conserva y se envía como nombre=valor, sin atributos. La comprobación local sólo decodifica el valor y compara la parte anterior a `|`; no verifica, reconstruye ni inventa el hash. Si una cookie visible no coincide se conserva CSRF_MISMATCH. Si la cookie es invisible, el backend sigue verificando CSRF; un error del callback se interpreta y no se declara login.

Flujo conservado: GET providers → GET CSRF → un único POST callback/credentials con application/x-www-form-urlencoded, X-Auth-Return-Redirect: 1 y correo/password/csrfToken/callbackUrl → GET session → GET perfil. No hay prevalidación contra credentials. Un HTTP 200 o una URL por sí solos no autentican. La cookie CSRF nunca se usa como cookie de sesión.

En web no se lee Set-Cookie ni se establece Cookie desde este servicio. Se usa credentials: include, dejando cookies, CORS y SameSite al navegador. No hay una bandera web que bloquee Android. La ejecución real del navegador y sus restricciones CORS/SameSite permanecen sin validar; no se atribuye a ellas el error Android.

## Diagnóstico seguro dentro de la app

`nextAuthSessionService.csrfDiagnostics()` devuelve sólo plataforma, implementación fetch, HTTP, tipo de respuesta, Content-Type, presencia del token, nombres de cookies visibles, resultado booleano de comparación y camino de transporte. Native-automatic describe la delegación al jar, no prueba por sí solo que éste haya funcionado. No devuelve tokens, valores de cookies, contraseñas, correo ni cuerpos; no hay logs nuevos de esos datos.

`await nextAuthSessionService.verifyCsrfTransport()` debe ejecutarse **dentro del runtime móvil**, desde una llamada de diagnóstico al servicio con sesión anónima. Primero consulta sesión y se niega a enviar signout si existe una sesión o cookie local de sesión. Obtiene CSRF y envía signout anónimo URL encoded, interpretando errores NextAuth. No se ejecuta automáticamente al abrir la app ni modifica la interfaz. Su resultado sólo contiene los metadatos anteriores y el estado de signout.

## Resultados reales

Comando de escritorio:

```powershell
node --env-file=.env --require ./scripts/register-typescript.cjs scripts/check-csrf.cjs
```

La ejecución de red restringida falló antes de obtener CSRF. Se repitió con autorización de red y produjo:

| Comprobación | Resultado observado |
| --- | --- |
| Runtime | Node, no Android/iOS; fetch global de Node; camino de cookies nativo legible del servicio inyectado |
| Sesión previa | Anónima, comprobada antes de signout |
| GET CSRF | HTTP 200, tipo basic, Content-Type application/json, csrfToken presente |
| Nombres visibles | __Host-authjs.csrf-token, __Secure-authjs.callback-url |
| Comparación | Token de cookie decodificada coincide con JSON |
| POST signout anónimo | HTTP 200, respuesta NextAuth interpretada sin error; pareja real enviada por el servicio |
| TypeScript | npx.cmd tsc --noEmit: exit 0 |
| Lint | npx.cmd expo lint: exit 0, sin errores; advertencia previa en src/hooks/use-color-scheme.web.ts:11 |
| Pruebas | npm.cmd test: 83 aprobadas, 0 fallidas; fixtures no equivalen a login real |
| Bundle Android | npx.cmd expo export --platform android --output-dir .expo/csrf-android-check: exit 0; 1384 módulos y bytecode Hermes generado |

El GET/POST anterior valida el parser y la pareja enviada manualmente contra producción. **No demuestra que el fetch móvil o su almacén automático hayan realizado el intercambio.** No había dispositivo en Metro (`/json/list` devuelve []), ni dispositivos registrados en .expo/devices.json; no se encontró adb en PATH ni SDK local en su ubicación habitual.

La primera exportación Android fue rechazada al ejecutar hermesc.exe por los permisos del sandbox. Se repitió con permisos de ejecución y terminó correctamente. Un bundle compilado tampoco acredita renderizado, transporte móvil ni navegación en un dispositivo.

Pendiente: ejecutar verifyCsrfTransport en Android real y registrar sus metadatos; probar login con una cuenta autorizada introducida directamente en la app, obteniendo sesión y perfil. No se enviaron credenciales ni se creó una cuenta, y no se declara login comprobado. Se mantienen interfaz, componentes y rutas existentes.
