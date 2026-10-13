# Integración de Perfil y acciones de cuenta — 13 de octubre de 2026

## Causa comprobada en el código

Perfil utilizaba perfilEjemplo desde perfil-state.ts. use-perfil-view-model.ts inicializaba ese objeto con estado listo y no consultaba la sesión ni GET /api/usuario/perfil. El formulario de edición sólo guardaba valores locales y accionGuardar tenía disabled: true. La interfaz nunca había conectado los datos autenticados de nombre/correo al modelo de Perfil.

Agenda importaba citasEjemplo de agenda-preview.ts; carrito utilizaba carritoEjemplo con un producto de 350 y un curso de 1200; favoritos utilizaba favoritosEjemplo. Mis cursos y compras iniciaban listas locales vacías sin llamar al servidor. Servicios e inscripción tenían AccionPendiente con disabled: true; producto sólo mostraba una explicación de sesión sin una acción de carrito. CatalogoView seguía mostrando que reservas, inscripciones y compras no estaban disponibles. Estas condiciones eran provisionales del cliente, no restricciones acreditadas del servidor.

La fuente tenía un único AuthSessionProvider en src/app/_layout.tsx, un único nextAuthSessionService y un único fetchHttpClient. No se encontró una segunda instancia de sesión consumida por esos módulos. La falta de Perfil se explica por el modelo local y la ausencia de integración, sin atribuirla a cookies omitidas ni a una respuesta de error autenticada no observada.

## Sesión, identidad y limpieza

Se conserva el login de NextAuth v5: un único callback, cookies del servidor, GET /api/auth/session y GET /api/usuario/perfil antes de publicar authenticated. No se añadió validación de contraseña contra credentials ni se inventó Bearer. El cliente compartido mantiene credentials: include y envía la cookie de sesión legible guardada en nativo cuando existe; si no es legible, usa el jar del transporte. En web cookieHeader() devuelve null y el navegador gestiona las cookies.

El proveedor comparte sessionRevision y una señal de actualización de datos. Los recursos personales se crean por usuario y revisión de sesión; al salir o cambiar de cuenta, su nueva instantánea empieza sin datos. Se cancelan cargas antiguas, se eliminan sus datos y mensajes, y se ignoran resultados tardíos. No hay caché de datos personales en AsyncStorage ni estado global con listas de negocio.

Se cancela la restauración inicial antes de un nuevo login/logout. SessionTransitions serializa las operaciones que cambian cookies para que un signout anterior no elimine una sesión recién creada. Un HTTP 401 de una revisión antigua tampoco puede invalidar la cuenta nueva. Los errores 403 no cierran sesión automáticamente.

El adapter transforma los campos REST nombre/correo/telefono/fecha_registro a Perfil y permite valores neutrales para los opcionales ausentes. perfilSession normaliza name/email/telefono de NextAuth. La sesión publicada incorpora nombre/teléfono de Perfil confirmado, y el saludo de Inicio consulta el Perfil actual. El correo de un Perfil debe corresponder al de la sesión; una discrepancia se rechaza sin mostrar los datos recibidos.

Las guardas de rutas protegidas, sesión, solicitud en curso, campos válidos, stock, inscripción activa y rol CLIENTE se conservan. Ninguna operación se considera confirmada por navegar o por habilitar un botón.

## Solicitudes y acciones conectadas

Los contratos se contrastaron con las rutas actuales del [backend](https://github.com/salonbrenns/SistemaBrenns). La URL sigue viniendo exclusivamente de EXPO_PUBLIC_API_URL.

| Función | Solicitud | Confirmación y actualización |
| --- | --- | --- |
| Perfil | GET /api/usuario/perfil | Valida nombre/correo, teléfono y fecha opcionales; coteja correo con sesión; carga/error/reintento/actualizar |
| Edición | PUT /api/usuario/perfil JSON nombre,telefono | Exige ok y user válido; vuelve a GET y actualiza otras pantallas. Correo informativo, no editable |
| Consultar carrito | GET /api/carrito | Array real con variante_id,cantidad,precio_venta,stock,producto; sin ejemplos ni descuentos inventados |
| Agregar variante | POST /api/carrito JSON variante_id,cantidad | ID numérico de la variante seleccionada; exige ok e item válido con cantidad positiva; vuelve a consultar |
| Cantidad | PATCH /api/carrito JSON id,cantidad | Exige ok y count positivo, o eliminado:true al llegar a cero; vuelve a consultar |
| Eliminar/vaciar | DELETE /api/carrito?id=X o sin id | Exige ok; vuelve a consultar |
| Pedido | POST /api/pedidos JSON metodo_pago,nombre_cliente,correo_cliente,telefono_cliente | Botón explícito Confirmar pedido con perfil/stock y método válidos; exige ok, pedido_id y total; muestra el total confirmado y recarga carrito/historial |
| Agenda | GET /api/citas | Datos reales con servicio/empleado, fecha/hora/estado/notas; próximas/historial y detalle desplegable |
| Horarios | GET /api/horarios?servicioId=X&fecha=AAAA-MM-DD | Valida sinAtencion y horarios; permite seleccionar sólo horas disponibles devueltas |
| Reserva | POST /api/citas JSON servicio_id,fecha,hora,metodo_pago:TRANSFERENCIA | Exige 201, success y cita.id; muestra confirmación y vuelve a consultar horarios/agenda. No declara pago realizado |
| Cancelar cita | PATCH /api/citas JSON id | Mantiene regla de más de 24 horas y estados vigentes; exige ok; recarga agenda |
| Mis cursos | GET /api/mis-cursos | Normaliza inscripción, curso nullable, pagos y asistencia reales |
| Inscripción | POST /api/cursos/:id/inscribir sin body | Contrato fija transferencia/completo; exige success e IDs/monto; muestra pago pendiente y recarga Mis cursos |
| Favoritos de productos | GET /api/favoritos; POST JSON producto_id; DELETE ?id=favoritoId | Normaliza producto y precio nullable; valida accion/ok; vuelve a consultar |
| Favoritos de servicios | GET /api/favoritos-servicios; POST JSON servicio_id; DELETE ?id=favoritoId | Normaliza servicio; valida accion/ok; vuelve a consultar |
| Favoritos de cursos | GET /api/favoritos-cursos; POST JSON cursoId | Wrapper distinto; el POST alterna agregado/quitado; refleja lo confirmado y vuelve a consultar |
| Compras/historial | GET /api/pedidos | Estado, fecha, líneas, cantidades, subtotal, envío, total y método reales |
| Notificaciones | GET /api/usuario/recordatorios | Citas próximas y pedidos en tránsito; enlaces a agenda/compras; vacío real |
| Ayuda | GET /api/faq | Preguntas y respuestas publicadas; búsqueda, carga, error y reintento |
| Contacto | GET /api/config-sitio, campo red_whatsapp | Sólo abre un enlace HTTPS de WhatsApp recibido y validado al pulsar; no envía mensajes automáticamente |
| Información legal | Páginas públicas /terminos, /aviso-privacidad, /politicas | Abre información oficial de la base configurada; no publica políticas inventadas |
| Apariencia | Proveedor existente de preferencias del dispositivo | Conserva Claro/Oscuro/Automático y persistencia local; no confunde preferencias con configuración ADMIN del sitio |
| Contraseña/logout | PUT /api/usuario/password; POST NextAuth signout | Conserva servicios existentes y sesión compartida; no hace una operación ficticia |

Fuente de cada ruta: directorio src/app/api correspondiente en el backend. Horarios se verificó específicamente en [horarios/route.ts](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/horarios/route.ts), inscripción en [cursos/[id]/inscribir](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/cursos/%5Bid%5D/inscribir/route.ts), Perfil en [usuario/perfil](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/usuario/perfil/route.ts), carrito en [carrito](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/carrito/route.ts), pedidos en [pedidos](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/pedidos/route.ts) y recordatorios en [usuario/recordatorios](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/usuario/recordatorios/route.ts).

Los errores indican motivo y endpoint/HTTP cuando existe. Se distinguen sesión, permisos, validación/conflicto, servidor, respuesta incompatible y conexión. Listas vacías confirmadas se muestran vacías; 204, payload incorrecto o una escritura sin confirmación generan error, sin rellenar ejemplos. Sólo se conservan datos previos reales de la misma sesión mientras se actualizan.

## Contenido de ejemplo retirado

- perfilEjemplo (Usuario/usuario@email.com), campos de edición locales desconectados.
- citasEjemplo y su archivo de producción agenda-preview.ts.
- carritoEjemplo, IDs/títulos/precios de producto y curso ficticios, total 1550 y descuento fijo.
- favoritosEjemplo y tarjetas locales.
- Mensajes de Mis cursos/compras que no procedían de una consulta.
- PreviewAction, PreviewNote, sus accesos y leyendas de catálogo/detalles.
- Preferencia visual de notificaciones que aparentaba avisos; se sustituyó por recordatorios reales.
- Preguntas y políticas legales provisionales; FAQ real y enlaces oficiales.
- Correos de ejemplo en placeholders, sustituidos por indicaciones neutrales.
- Etiqueta accesible de ejemplo en CatalogCard.

No se añadieron fotografías ni estadísticas de Perfil porque su contrato no contiene esos campos. El avatar conserva su presentación neutral. Asistencia/pagos de Mis cursos sí proceden de campos confirmados de su endpoint. Versión de Acerca procede de app.json. Se mantienen fixtures exclusivamente en tests.

## Operaciones sin contrato confirmado y límites concretos

| Operación | Evidencia/límite | Presentación aplicada |
| --- | --- | --- |
| Eliminar mi propia cuenta | No se confirmó endpoint de autoservicio. La búsqueda encontró DELETE administrativo de usuarios que incluso impide eliminar la propia cuenta | Retira confirmación/éxito ficticios; indica solicitar eliminación al salón y ofrece contacto si está publicado |
| Listar/revocar otras sesiones | No se confirmó contrato de sesiones por dispositivo | Muestra sólo vigencia de la sesión real de esta app y acción de logout existente |
| Guardar/eliminar métodos de pago personales | No se confirmó contrato de tarjetas/métodos guardados | Mantiene ruta; lleva a elegir método al confirmar pedido |
| Push/permisos/suscripción y marcar avisos leídos | Recordatorios no es un contrato de push ni de preferencias remotas | No muestra un interruptor que prometa una suscripción; lista recordatorios reales |
| Cobrar tarjeta/transferencia | POST pedidos sólo crea un pedido y registra el método; inscripción crea un pago PENDIENTE | No declara pago ejecutado ni pagado; muestra estado confirmado por la API |
| Información legal dentro de la app | No se copió texto local sin respaldo | Lleva a páginas públicas confirmadas del sitio |

El subtotal se calcula con cantidades y precios recibidos usando centavos exactos. La regla de envío está confirmada en POST /api/pedidos: 100 para subtotal menor de 1500, gratis desde 1500. Si esa regla cambia en el backend, hay que sincronizarla; no existe cotización independiente confirmada en esta revisión. El total de un pedido creado siempre viene de la respuesta del servidor.

PUT Perfil utiliza withRasp. Una entrada legítima que el middleware rechace conserva el HTTP/motivo; no se alteran los datos para eludirlo y no se bloquean otras operaciones. No se modificó el backend.

El endpoint recordatorios devuelve listas vacías incluso si falla internamente o el id es inválido. El cliente no puede distinguir ese fallo oculto de un vacío válido; es una limitación externa documentada, sin inventar avisos.

## Verificaciones realizadas

| Verificación | Resultado |
| --- | --- |
| TypeScript | npx.cmd tsc --noEmit: exit 0 |
| Lint | npx.cmd expo lint: exit 0, sin errores; advertencia previa en src/hooks/use-color-scheme.web.ts:11 |
| Suite | npm.cmd test: 100 pruebas aprobadas, 0 fallidas |
| Android | npx.cmd expo export --platform android --output-dir .expo/account-android-check: exit 0; 1411 módulos y bytecode Hermes generado |
| Pruebas nuevas | 17 casos de contratos, cookies compartidas, datos no vacíos/vacíos, rechazo de respuestas incompatibles, errores específicos, escritura confirmada, limpieza/cambio de cuenta, respuestas tardías y orden logout/login |
| Consultas reales | GET anónimos, sin credenciales, de la API configurada; resultados abajo |
| Dispositivo/cuenta | Pendiente por indicación expresa del usuario: no hay Android/emulador conectado |
| Compras/pagos reales automáticos | No ejecutados; POST pedido/inscripción y demás escrituras sólo se probaron con fixtures |

Comando de consulta real:
node --env-file=.env --require ./scripts/register-typescript.cjs scripts/check-account-contracts.cjs

La red restringida respondió EACCES; se repitió con permisos de red y terminó exit 0. Se imprimieron sólo rutas, HTTP, Content-Type y presencia de usuario, sin valores de cookies ni datos del usuario.

| GET sin cookies | HTTP observado |
| --- | --- |
| /api/auth/session | 200, application/json, hasUser:false |
| /api/usuario/perfil | 401, application/json |
| /api/carrito | 401 |
| /api/citas | 401 |
| /api/mis-cursos | 401 |
| /api/favoritos | 401 |
| /api/favoritos-servicios | 401 |
| /api/favoritos-cursos | 200 (la ruta admite respuesta anónima) |
| /api/pedidos | 401 |
| /api/usuario/recordatorios | 401 |

Las respuestas 401 anónimas son una restricción legítima; no demuestran un fallo de la sesión del usuario ni la inexistencia del endpoint. Las pruebas de cookies y cambio de cuenta de la suite utilizan un transporte controlado, no una cuenta real. El usuario informó que ya puede iniciar sesión, pero en esta tarea no se introdujeron sus credenciales ni se observó la pantalla autenticada.

La compilación Android termina con el React Compiler y Hermes, pero no acredita renderizado, cookies móviles ni acciones ejecutadas en un dispositivo.

Pendiente en Android real: login autorizado introducido en la app → GET sesión y Perfil con esa sesión → mostrar cuatro campos reales → agregar una variante real al carrito y consultarlo → logout → entrar con otra cuenta y comprobar que no hay datos previos. Las pruebas no deben crear pedidos ni pagos reales de forma automática. La validación visual del diseño también permanece pendiente de dispositivo.

## Archivos corregidos

Se modificaron/agregaron los siguientes archivos de aplicación, pruebas y diagnóstico; se conservan los cambios ajenos existentes en el workspace:

- [README.md](../README.md)
- [src/modules/cursos/viewmodels/mis-cursos-state.ts](../src/modules/cursos/viewmodels/mis-cursos-state.ts)

- [scripts/check-account-contracts.cjs](../scripts/check-account-contracts.cjs)
- [src/components/feedback/resource-status.tsx](../src/components/feedback/resource-status.tsx)
- [src/components/ui/style-guide.tsx](../src/components/ui/style-guide.tsx)
- [src/modules/agenda/adapters/agenda-adapter.ts](../src/modules/agenda/adapters/agenda-adapter.ts)
- [src/modules/agenda/models/cita.ts](../src/modules/agenda/models/cita.ts)
- [src/modules/agenda/services/agenda-service.ts](../src/modules/agenda/services/agenda-service.ts)
- [src/modules/agenda/viewmodels/use-agenda-view-model.ts](../src/modules/agenda/viewmodels/use-agenda-view-model.ts)
- [src/modules/agenda/viewmodels/use-reserva-view-model.ts](../src/modules/agenda/viewmodels/use-reserva-view-model.ts)
- [src/modules/agenda/views/agenda-view.tsx](../src/modules/agenda/views/agenda-view.tsx)
- [src/modules/agenda/views/reserva-form.tsx](../src/modules/agenda/views/reserva-form.tsx)
- [src/modules/auth/models/auth-navigation.ts](../src/modules/auth/models/auth-navigation.ts)
- [src/modules/auth/services/next-auth-session-service.ts](../src/modules/auth/services/next-auth-session-service.ts)
- [src/modules/auth/viewmodels/auth-session-provider.tsx](../src/modules/auth/viewmodels/auth-session-provider.tsx)
- [src/modules/auth/viewmodels/session-transitions.ts](../src/modules/auth/viewmodels/session-transitions.ts)
- [src/modules/auth/views/autenticacion-seccion-view.tsx](../src/modules/auth/views/autenticacion-seccion-view.tsx)
- [src/modules/auth/views/autenticacion-view.tsx](../src/modules/auth/views/autenticacion-view.tsx)
- [src/modules/auth/views/crear-cuenta-view.tsx](../src/modules/auth/views/crear-cuenta-view.tsx)
- [src/modules/carrito/adapters/carrito-adapter.ts](../src/modules/carrito/adapters/carrito-adapter.ts)
- [src/modules/carrito/models/carrito.ts](../src/modules/carrito/models/carrito.ts)
- [src/modules/carrito/services/carrito-service.ts](../src/modules/carrito/services/carrito-service.ts)
- [src/modules/carrito/viewmodels/carrito-state.ts](../src/modules/carrito/viewmodels/carrito-state.ts)
- [src/modules/carrito/viewmodels/use-carrito-view-model.ts](../src/modules/carrito/viewmodels/use-carrito-view-model.ts)
- [src/modules/carrito/views/carrito-view.tsx](../src/modules/carrito/views/carrito-view.tsx)
- [src/modules/catalogo/views/catalogo-view.tsx](../src/modules/catalogo/views/catalogo-view.tsx)
- [src/modules/configuracion/viewmodels/configuracion-state.ts](../src/modules/configuracion/viewmodels/configuracion-state.ts)
- [src/modules/configuracion/viewmodels/use-configuracion-view-model.ts](../src/modules/configuracion/viewmodels/use-configuracion-view-model.ts)
- [src/modules/configuracion/views/configuracion-seccion-view.tsx](../src/modules/configuracion/views/configuracion-seccion-view.tsx)
- [src/modules/configuracion/views/configuracion-view.tsx](../src/modules/configuracion/views/configuracion-view.tsx)
- [src/modules/cuenta/viewmodels/cuenta-state.ts](../src/modules/cuenta/viewmodels/cuenta-state.ts)
- [src/modules/cuenta/views/cuenta-view.tsx](../src/modules/cuenta/views/cuenta-view.tsx)
- [src/modules/cursos/adapters/inscripciones-adapter.ts](../src/modules/cursos/adapters/inscripciones-adapter.ts)
- [src/modules/cursos/models/inscripcion.ts](../src/modules/cursos/models/inscripcion.ts)
- [src/modules/cursos/services/inscripciones-service.ts](../src/modules/cursos/services/inscripciones-service.ts)
- [src/modules/cursos/viewmodels/use-cursos-view-model.ts](../src/modules/cursos/viewmodels/use-cursos-view-model.ts)
- [src/modules/cursos/viewmodels/use-inscripcion-view-model.ts](../src/modules/cursos/viewmodels/use-inscripcion-view-model.ts)
- [src/modules/cursos/viewmodels/use-mis-cursos-view-model.ts](../src/modules/cursos/viewmodels/use-mis-cursos-view-model.ts)
- [src/modules/cursos/views/cursos-view.tsx](../src/modules/cursos/views/cursos-view.tsx)
- [src/modules/cursos/views/inscripcion-form.tsx](../src/modules/cursos/views/inscripcion-form.tsx)
- [src/modules/cursos/views/mis-cursos-view.tsx](../src/modules/cursos/views/mis-cursos-view.tsx)
- [src/modules/favoritos/adapters/favoritos-adapter.ts](../src/modules/favoritos/adapters/favoritos-adapter.ts)
- [src/modules/favoritos/models/favorito.ts](../src/modules/favoritos/models/favorito.ts)
- [src/modules/favoritos/services/favoritos-service.ts](../src/modules/favoritos/services/favoritos-service.ts)
- [src/modules/favoritos/viewmodels/favoritos-state.ts](../src/modules/favoritos/viewmodels/favoritos-state.ts)
- [src/modules/favoritos/viewmodels/use-favorite-action.ts](../src/modules/favoritos/viewmodels/use-favorite-action.ts)
- [src/modules/favoritos/viewmodels/use-favoritos-view-model.ts](../src/modules/favoritos/viewmodels/use-favoritos-view-model.ts)
- [src/modules/favoritos/views/favoritos-view.tsx](../src/modules/favoritos/views/favoritos-view.tsx)
- [src/modules/informacion/adapters/informacion-adapter.ts](../src/modules/informacion/adapters/informacion-adapter.ts)
- [src/modules/informacion/services/informacion-service.ts](../src/modules/informacion/services/informacion-service.ts)
- [src/modules/informacion/viewmodels/informacion-state.ts](../src/modules/informacion/viewmodels/informacion-state.ts)
- [src/modules/informacion/viewmodels/use-informacion-view-model.ts](../src/modules/informacion/viewmodels/use-informacion-view-model.ts)
- [src/modules/informacion/views/informacion-view.tsx](../src/modules/informacion/views/informacion-view.tsx)
- [src/modules/inicio/viewmodels/use-inicio-view-model.ts](../src/modules/inicio/viewmodels/use-inicio-view-model.ts)
- [src/modules/inicio/views/inicio-view.tsx](../src/modules/inicio/views/inicio-view.tsx)
- [src/modules/notificaciones/adapters/notificaciones-adapter.ts](../src/modules/notificaciones/adapters/notificaciones-adapter.ts)
- [src/modules/notificaciones/models/notificacion.ts](../src/modules/notificaciones/models/notificacion.ts)
- [src/modules/notificaciones/services/notificaciones-service.ts](../src/modules/notificaciones/services/notificaciones-service.ts)
- [src/modules/notificaciones/viewmodels/notificaciones-state.ts](../src/modules/notificaciones/viewmodels/notificaciones-state.ts)
- [src/modules/notificaciones/viewmodels/use-notificaciones-view-model.ts](../src/modules/notificaciones/viewmodels/use-notificaciones-view-model.ts)
- [src/modules/notificaciones/views/notificaciones-view.tsx](../src/modules/notificaciones/views/notificaciones-view.tsx)
- [src/modules/perfil/adapters/perfil-adapter.ts](../src/modules/perfil/adapters/perfil-adapter.ts)
- [src/modules/perfil/models/perfil.ts](../src/modules/perfil/models/perfil.ts)
- [src/modules/perfil/services/perfil-service.ts](../src/modules/perfil/services/perfil-service.ts)
- [src/modules/perfil/viewmodels/perfil-state.ts](../src/modules/perfil/viewmodels/perfil-state.ts)
- [src/modules/perfil/viewmodels/use-editar-perfil-view-model.ts](../src/modules/perfil/viewmodels/use-editar-perfil-view-model.ts)
- [src/modules/perfil/viewmodels/use-perfil-view-model.ts](../src/modules/perfil/viewmodels/use-perfil-view-model.ts)
- [src/modules/perfil/views/editar-perfil-view.tsx](../src/modules/perfil/views/editar-perfil-view.tsx)
- [src/modules/perfil/views/perfil-view.tsx](../src/modules/perfil/views/perfil-view.tsx)
- [src/modules/productos/viewmodels/use-carrito-producto-view-model.ts](../src/modules/productos/viewmodels/use-carrito-producto-view-model.ts)
- [src/modules/productos/views/producto-detail-view.tsx](../src/modules/productos/views/producto-detail-view.tsx)
- [src/modules/servicios/viewmodels/use-servicios-view-model.ts](../src/modules/servicios/viewmodels/use-servicios-view-model.ts)
- [src/modules/servicios/views/servicios-view.tsx](../src/modules/servicios/views/servicios-view.tsx)
- [src/modules/ventas/adapters/ventas-adapter.ts](../src/modules/ventas/adapters/ventas-adapter.ts)
- [src/modules/ventas/models/venta.ts](../src/modules/ventas/models/venta.ts)
- [src/modules/ventas/services/ventas-service.ts](../src/modules/ventas/services/ventas-service.ts)
- [src/modules/ventas/viewmodels/use-compras-view-model.ts](../src/modules/ventas/viewmodels/use-compras-view-model.ts)
- [src/modules/ventas/views/compras-view.tsx](../src/modules/ventas/views/compras-view.tsx)
- [src/services/api.ts](../src/services/api.ts)
- [src/shared/adapters/account-validation.ts](../src/shared/adapters/account-validation.ts)
- [src/shared/adapters/input-error.ts](../src/shared/adapters/input-error.ts)
- [src/shared/adapters/session-data-error.ts](../src/shared/adapters/session-data-error.ts)
- [src/shared/models/view-state.ts](../src/shared/models/view-state.ts)
- [src/shared/viewmodels/session-resource.ts](../src/shared/viewmodels/session-resource.ts)
- [src/shared/viewmodels/use-current-time.ts](../src/shared/viewmodels/use-current-time.ts)
- [src/shared/viewmodels/use-session-resource.ts](../src/shared/viewmodels/use-session-resource.ts)
- [src/utils/format-price.ts](../src/utils/format-price.ts)
- [tests/account-flows.test.cjs](../tests/account-flows.test.cjs)

Eliminado: src/modules/agenda/viewmodels/agenda-preview.ts.

Documentación: este informe y la nota de actualización en docs/endpoints-api.md.
