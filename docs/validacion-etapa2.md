# Verificación de la etapa 2

Fecha: 11 de octubre de 2026. Proyecto Expo SDK 57 / Expo Router. La configuración local de API se leyó de `.env` sin imprimir valores.

## Backend comprobado

Repositorio `salonbrenns/SistemaBrenns`, rama `main`, HEAD revisado `6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61` (GitHub). La lectura del código confirma NextAuth v5 con `strategy: "jwt"`, `maxAge: 24 * 60 * 60`, provider Credentials (`correo`, `password`) y handlers GET/POST. `authorize` usa `POST /api/auth/credentials` para resolver usuario y el handler NextAuth es quien emite la sesión. No hay token Bearer móvil.

La ruta `/api/auth/credentials` no está envuelta en `withRasp`; `middleware.ts` la limita por intentos. El `PUT /api/usuario/password` también valida una sesión NextAuth y no usa `withRasp`. El login no se envió porque no había una cuenta de prueba autorizada disponible. No se enviaron formularios de registro, recuperación, perfil ni cambio de contraseña. Las rutas de registro, reset y actualización de perfil que sí usan `withRasp` conservan el bloqueo/exposición documentado en `revision-estructura.md`.

Consultas anónimas de solo lectura a la URL configurada:

| Ruta | Estado | Elementos | Contrato observado |
|---|---:|---:|---|
| `GET /api/cursos` | 200 | 4 | Envoltorio `{cursos: [...]}`; ID numérico, título, precio Decimal como texto, fechas ISO, imágenes en arreglo. |
| `GET /api/productos` | 200 | 1222 | Arreglo directo; nombre, imagen como arreglo, variantes con ID, tono/presentación, precio numérico e inventario, `precio_min`, `en_stock`. |
| `GET /api/servicios` | 200 | 11 | Envoltorio `{servicios: [...]}`; precio numérico, duración como texto, disponibilidad, categoría e imagen. |
| `GET /api/auth/csrf` | 200 | — | JSON con `csrfToken`; el servidor emite `__Host-authjs.csrf-token` y `__Secure-authjs.callback-url`. Valores de cookies/token no se guardan en este informe. |
| `GET /api/auth/session` | 200 | — | `null` sin cookie. |
| `GET /api/usuario/perfil` | 401 | — | Rechaza acceso anónimo. |

Una revisión de forma de todos los registros encontró cero errores en los campos básicos comprobados; los adapters conservan para curso/producto/servicio las estructuras y nombres usados por las respuestas públicas observadas. No se probó escritura ni se inició sesión.

## Exportación y dispositivo

`npx expo export --platform web --output-dir dist/stage2-web` y variantes con `--max-workers 1` y `--max-workers 0` iniciaron Metro y anunciaron renderizado estático, pero dejaron de emitir salida antes de generar/confirmar la exportación. Se interrumpieron; no se consideran exitosas. Salida terminal antes del bloqueo:

```text
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler
Static rendering is enabled. Learn more: https://docs.expo.dev/router/web/static-rendering/
```

No apareció una excepción de compilación antes de detenerlas. El diagnóstico `--no-ssg` devuelve `CommandError: --no-ssg can only be used with web.output: server`; el proyecto usa `web.output: static`, por lo que no es una solución equivalente. No se identificó todavía qué ruta o módulo deja bloqueado el render estático.

No hay comandos `adb` ni `emulator`, ni `ANDROID_HOME`/`ANDROID_SDK_ROOT`; no se ejecutó en Android. No hubo revisión visual de la app en dispositivo ni navegador.

## Cambios integrados y límites

- Apariencia Claro/Oscuro/Automático se guarda en AsyncStorage y alimenta el hook común del tema; Automático toma el esquema del dispositivo. `app.json` permite modo automático. El selector sigue usando las opciones existentes.
- Notificaciones conserva solo una preferencia local persistida. La UI indica que no solicita permiso de sistema ni crea suscripción remota; no hay contrato remoto ni paquete push en este proyecto.
- El flujo de sesión NextAuth se implementa en `src/modules/auth/`: CSRF + credentials callback, lectura/renovación de la cookie de sesión, almacenamiento con SecureStore, restauración con `/api/auth/session` y `/api/usuario/perfil`, logout CSRF, guardas de rutas y limpieza tras 401. Cambio de contraseña usa PUT confirmado y solo muestra éxito si el JSON incluye `ok: true`.
- El soporte nativo de cookies aún necesita verificación contra una cuenta y dispositivo reales. El POST de NextAuth, recepción de cookies en React Native, callback CSRF, expiración/renovación y revocación observada después de logout no se consideran probados. SecureStore es nativo; en web no habilita sesión.
- Métodos de pago, sesiones activas y eliminación de cuenta siguen deshabilitados/informativos hasta tener contratos. Español permanece definido. Configuración de sitio no guarda preferencias móviles.
- Perfil, agenda remota, carrito remoto, favoritos, inscripción/Mis cursos, compras y notificaciones push quedan para la siguiente etapa; dependen de sesión validada en dispositivo y/o integración de sus respectivos contratos.

## Verificaciones de código

Verificación final: `npx tsc --noEmit` código 0; `npm test` 41/41; `npx expo lint` código 0, cero errores y un aviso en `src/hooks/use-color-scheme.web.ts:11`; `git diff --check` código 0. Los avisos CRLF/LF de Git son de normalización Windows. No se generaron pruebas visuales.
