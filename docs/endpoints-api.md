> Actualización del 13 de octubre de 2026: Perfil, carrito, agenda/horarios, inscripción/Mis cursos, favoritos, pedidos y recordatorios están integrados con la sesión compartida. Las descripciones de previews y operaciones pendientes que siguen abajo son históricas; el estado actual, contratos, archivos y resultados están en [Integración de cuenta](integracion-cuenta-2026-10-13.md).
>
> Actualización estructural del 10 de octubre de 2026: se conservan los contratos auditados abajo. Las operaciones HTTP ahora viven en services y los adapters solo transforman DTO. La auditoría de fuente del 7 de octubre no se presenta como una comprobación nueva del despliegue.

# Contratos externos auditados

Auditoría del 7 de octubre de 2026. Este archivo no existía al iniciar: la
referencia que contenía el README estaba rota. La aplicación no tenía servicios
ni cliente HTTP: sus 14 módulos usaban datos locales, estados de formularios o
parámetros de Expo Router. Se conserva `src/config/api.ts` y se incorpora un
transporte compartido separado de los adaptadores.

## Evidencia y límites

Fuente consultada: repositorio público
[salonbrenns/SistemaBrenns](https://github.com/salonbrenns/SistemaBrenns/tree/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61),
commit `6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61` obtenido del árbol `main`.
Se leyeron las rutas y el esquema Prisma enlazados abajo. No hay OpenAPI ni
documentación de endpoints en ese árbol. Los contratos públicos implementados
están verificados contra **código fuente**, no contra una respuesta reciente del
despliegue.

Los metadatos de ese repositorio declaran
[brenns-sistema.vercel.app](https://brenns-sistema.vercel.app) como homepage.
Eso no demuestra que sea el entorno de producción elegido para la aplicación
móvil ni que despliegue exactamente el commit auditado. Se mantiene la URL
pública configurable mediante `EXPO_PUBLIC_API_URL`; no se añadió una URL fija
a vistas ni adaptadores.

Las consultas públicas con la herramienta web no fueron accesibles. Una
consulta `curl GET /api/cursos` en el entorno restringido falló por resolución
DNS; la repetición con autorización quedó sin ejecutar y fue interrumpida.
**No hay respuesta HTTP viva confirmada en esta auditoría.** El README anterior
mencionaba un HTTP 200 del 6 de octubre; se trata de evidencia previa que no se
repitió aquí. No se realizaron escrituras remotas, login ni peticiones con
credenciales personales.

## Lecturas públicas implementadas

| Operación | Respuesta confirmada en fuente | Errores | Adaptación / límite |
| --- | --- | --- | --- |
| `GET /api/cursos` | `{ cursos: Curso[] }`; activos, orden `created_at` descendente, máximo 100 | 500 `{ error: string }` | `HttpCursosService.listar`; obtener por ID busca en este listado, porque no existe `GET /api/cursos/:id` público |
| `GET /api/productos` | Array directo de productos activos con variantes activas | 500 `{ error: string }` | `HttpProductosService.listar`; no se supuso wrapper ni detalle HTTP |
| `GET /api/servicios` | `{ servicios: ServicioDto[] }`, activos, nombre ascendente | 500 `{ error: string }` | `HttpServiciosService.listar` |
| `GET /api/servicios/:id` | Objeto directo `{ id, nombre, precio, duracion, imagen }` | 404 o 500 `{ error: string }` | `HttpServiciosService.obtener`; valida ID de solicitud y correspondencia de respuesta |

Fuentes:
[cursos/route.ts](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/cursos/route.ts),
[productos/route.ts](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/productos/route.ts),
[dataProductos.ts](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/lib/dataProductos.ts),
[servicios/route.ts](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/servicios/route.ts),
[servicios/[id]/route.ts](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/servicios/%5Bid%5D/route.ts).

### Campos y diferencias

El [esquema Prisma](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/prisma/schema.prisma)
confirma los tipos y null de los campos persistidos.

| DTO externo | Modelo interno | Regla |
| --- | --- | --- |
| `id: Int` de los tres módulos | `id: string` | Entero positivo seguro; representación decimal, sin IDs ficticios |
| Curso `titulo: string` | `Curso.nombre` | Cambio de nombre explícito |
| Curso `descripcion: string|null`, `nivel: string|null` | Mismos campos | Null se conserva; ausencia de propiedad requerida es inválida |
| Curso `precio_total: Decimal(10,2)` serializado como string | `Curso.precio: string` | Conserva texto decimal; el mapper rechaza number, NaN y texto no decimal |
| Curso `duracion_horas: Int|null` | `duracionHoras: number|null` | Entero seguro o null; no acepta fracciones |
| Curso `fecha_inicio`, `fecha_fin: DateTime? @db.Date` | `fechaInicio`, `fechaFin: YYYY-MM-DD|null` | Fecha calendario válida; ISO a medianoche UTC sin desplazamiento por zona local |
| Curso no contiene instructor/modalidad | Campos internos opcionales | No se añaden datos del preview a un registro real |
| Servicio lista `precio_min: number`; detalle `precio: number` | `Servicio.precio: string` | Conserva la representación numérica recibida del Float sin imponer una escala de centavos |
| Servicio `duracion: string` | `duracionTexto: string` | Conserva texto; no interpreta una unidad que el endpoint no establece |
| Servicio lista `imagen: string|null`, `disponible: boolean`, `categoria: string` | Proyección del modelo consumido | Se validan aunque la vista actual no los muestra |
| Servicio no devuelve descripción ni incluye | Internos opcionales | Se omiten; no se rellenan con textos locales |
| Producto `descripcion: string|null` | `Producto.descripcion` | Se conserva null |
| Producto `marca`, `categoria: { nombre: string }|null` | Proyección del modelo consumido | Se valida objeto anidado y nombre |
| Producto `imagen` y variante `imagen`: Prisma Json|null | Proyección del modelo consumido | JSON válido; no se impone sin evidencia un formato de array de URL |
| Producto `variantes[]`: `id`, `tono`, `presentacion`, `precio_venta`, `stock`, `imagen` | Proyección del modelo consumido | Valida ID, texto nullable, dinero numérico, stock entero seguro y JSON |
| Producto `precio_min: number|null` | `Producto.precio: string|null` | Null se conserva cuando no hay variantes; null con variantes es inválido |
| Producto `en_stock: boolean` | Proyección del modelo consumido | Valida tipo; no convierte textos ni números a booleanos |

`CursoDto` documenta la **proyección consumida** del registro crudo. El endpoint
también entrega `codigo`, `cupo_maximo`, `inscritos`, `activo`, `created_at` e
`imagenes` según Prisma; no se introducen en el modelo interno porque no se
consumen ni se validan como parte de esa proyección. Los DTO de productos y
servicios describen las respuestas seleccionadas por sus rutas.

En productos el backend calcula `Math.min` sobre variantes. Sin variantes da
`Infinity`, que al serializar JSON se convierte en null. El adaptador conserva
esa falta de precio; nunca la sustituye por cero. Los endpoints que convierten
Decimal a number pueden perder precisión antes de llegar al cliente: aquí se
rechazan representaciones no seguras y no se puede recuperar precisión que el
backend ya haya perdido. Servicios usa `Float` en Prisma: conserva la
representación recibida, incluidos más de dos decimales, sin imponerle la
escala `Decimal(10,2)` que sí tienen productos.

Las listas vacías son válidas. Cuerpo HTTP vacío, null en lugar de lista, wrapper
incorrecto o registro defectuoso producen `AdapterError` con la ruta del dato;
no se filtra silenciosamente ningún registro. `HttpError` conserva status,
cuerpo y ruta incluso si el proxy entrega HTML. Los adaptadores no atrapan ni
reclasifican errores HTTP como errores de transformación.

## Autenticación y operaciones pendientes

El backend usa [NextAuth](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/lib/auth.ts)
con estrategia JWT para sesión web; sus endpoints protegidos llaman `auth()`.
No se encontró un contrato de emisión/renovación de token Bearer para móviles.
Esto no puede suplirse enviando un ID de usuario o inventando Authorization.

| Módulo | Fuente actual en móvil | Contratos backend leídos / diferencias | Estado de Adapter |
| --- | --- | --- | --- |
| agenda | Citas locales de preview | `/api/citas`: GET array con servicio/empleado anidados y fecha ISO; POST requiere servicio_id,fecha,hora, contempla contacto/empleado/pago; PATCH `{id}` cancela; auth, 400/401/403/404/409/500 | No aplica al preview; integración autenticada pendiente |
| autenticacion | Formularios locales, envíos deshabilitados | Credentials POST `{correo,password}` devuelve usuario, sin token/sesión; registro exige name,email,password,telefono; móvil carece de telefono; recuperación usa correo; cambio password requiere sesión | Pendiente sesión móvil y reconciliación de formularios; no login simulado |
| catalogo | Agregación de fuentes públicas | Usa las tres lecturas anteriores, no existe endpoint propio del catálogo móvil | Composición `ComposedCatalogoService` integrada |
| configuracion | Menús/apariencia local | `/api/config-sitio` GET devuelve Record<string,string>; PATCH solo ADMIN; es configuración del sitio, no un contrato de preferencias móviles | No aplica a datos locales; persistencia móvil pendiente |
| cuenta | Parámetro de ruta, tabla de secciones | Navegación local; no requiere endpoint | No aplica |
| cursos | Listado público/detalle derivado + mis-cursos local | `/api/mis-cursos` GET autenticado `{cursos:[inscripción,curso,pagos,asistencias]}`; inscripción `/api/cursos/:id/inscribir` POST cliente autenticado | Público integrado; mis cursos/inscripción pendientes |
| favoritos | Listas locales | `/api/favoritos` y `/api/favoritos-servicios` arrays, GET sin auth 401; `/api/favoritos-cursos` wrapper `{favoritos,cursos}`, GET sin auth 200 vacío; escrituras requieren sesión y DTO distintos | No aplica al preview; adaptación autenticada pendiente |
| informacion | Preguntas/textos/acerca locales | `/api/faq` GET público array `{id,pregunta,respuesta}`, 500 error; la vista actual solo presenta preguntas locales y textos legales provisionales | No aplica al contenido local compatible; FAQ remoto no integrado |
| inicio | Categorías/destacados/cita locales | Datos públicos podrían componerse; próxima cita personalizada necesita sesión; no se identificó endpoint del dashboard móvil | No aplica al preview; inicio personalizado pendiente |
| notificaciones | Preferencia visual local | `/api/usuario/recordatorios` GET autenticado `{citasProximas,pedidosEnTransito}`; no es un contrato de preferencia/push; backend devuelve listas vacías si falla internamente | No aplica a preferencia local; notificaciones reales pendientes |
| perfil | Ejemplo y edición local | `/api/usuario/perfil` GET nombre,correo,telefono,fecha_registro; PUT acepta nombre/telefono, no modifica correo; auth, errores 400/401/404/500 | Pendiente sesión y reconciliar edición de correo |
| productos | Modelos del listado público entregados por catálogo | Array y variantes documentados arriba; no ruta pública de detalle encontrada | Listado integrado |
| servicios | Listado/detalle públicos, preview sin ID | Lista y detalle con contratos distintos documentados arriba | Lecturas integradas; reserva autenticada pendiente |
| carrito / ventas | Carrito local en su módulo y compras vacías en ventas | `/api/carrito` GET array de items; POST variante_id/cantidad; PATCH id/cantidad; DELETE ?id opcional; `/api/pedidos` GET historial/POST checkout; todos con auth | Preview conservado; carrito remoto/compra/pagos pendientes |

Los casos locales no justifican clases Adapter que simplemente devuelvan
ejemplos compatibles. Los contratos pendientes son evidencia para una futura
integración; sus endpoints no se invocan en esta implementación.

### Solicitudes y respuestas de escritura confirmadas en fuente

| Endpoint | Solicitud | Respuesta y errores relevantes |
| --- | --- | --- |
| `POST /api/auth/credentials` | `{correo,password}` | `{id:string,name,email,role,telefono}`; 400 MISSING_FIELDS, 401 USER_NOT_FOUND/WRONG_PASSWORD/ACCOUNT_LOCKED, 403 ACCOUNT_LOCKED/ACCOUNT_INACTIVE/EMAIL_NOT_VERIFIED, 500 SERVER_ERROR |
| `POST /api/auth/register` | `{name,email,password,telefono}` obligatorios | 201 `{message,requiresVerification:true}`; 400,409,429,500; no inicia sesión |
| `POST /api/auth/recuperar-contrasena` | `{correo}` | `{ok:true}` incluso correo inexistente; 400/429; no se enviaron correos |
| `PUT /api/usuario/password` | `{passwordActual,passwordNueva}` | `{ok:true}`; sesión requerida; 400/401/404/500 |
| `PUT /api/usuario/perfil` | `{nombre,telefono?}` | `{ok:true,user:{nombre,correo,telefono}}`; correo es informativo |
| `POST /api/cursos/:id/inscribir` | ID en ruta, sesión CLIENTE; la ruta ignora body y fija pago completo por transferencia | `{success,inscripcionId,pagoId,monto,tipoPago,metodoPago}`; 400/401/403/404/409/500 |
| `POST /api/carrito` | `{variante_id,cantidad?}` | `{ok:true,item}`; cantidad limitada por stock; 400/401/404 |
| `PATCH /api/carrito` | `{id,cantidad}` | `{ok:true,eliminado:true}` si <=0; si no `{ok:true,item:{count}}`; 400/401 |
| `DELETE /api/carrito` | `?id=X` para item, sin id vacía todo | `{ok:true}`; 401 |
| Favoritos POST | `{producto_id}`, `{servicio_id}` o `{cursoId}` según ruta | Toggle; productos/servicios `{ok,accion}`; cursos `{accion,cursoId}`; 400/401 |
| `POST /api/pedidos` | `{metodo_pago,nombre_cliente,correo_cliente,telefono_cliente?}` | `{ok,pedido_id,total,metodo_pago}`; sesión, carrito existente; 400/401/409/500; afecta stock y vacía carrito |

Fuentes adicionales leídas:
[credentials](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/auth/credentials/route.ts),
[register](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/auth/register/route.ts),
[recuperar-contrasena](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/auth/recuperar-contrasena/route.ts),
[password](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/usuario/password/route.ts),
[perfil](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/usuario/perfil/route.ts),
[citas](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/citas/route.ts),
[mis-cursos](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/mis-cursos/route.ts),
[inscribir](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/cursos/%5Bid%5D/inscribir/route.ts),
[favoritos](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/favoritos/route.ts),
[favoritos-cursos](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/favoritos-cursos/route.ts),
[favoritos-servicios](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/favoritos-servicios/route.ts),
[carrito](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/carrito/route.ts),
[pedidos](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/pedidos/route.ts),
[FAQ](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/faq/route.ts),
[config-sitio](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/config-sitio/route.ts),
[recordatorios](https://github.com/salonbrenns/SistemaBrenns/blob/6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61/src/app/api/usuario/recordatorios/route.ts).

Logout usa handlers NextAuth; no se inventó una ruta móvil. No se encontró ruta
de eliminación de cuenta ni de sesiones activas del usuario en el árbol auditado.
Las políticas finales y la moneda ISO no están confirmadas por los contratos
públicos. Para completar operaciones protegidas hacen falta un contrato de
sesión móvil probado, formularios compatibles y pruebas contra el entorno
destinado, sin convertir endpoints web en una API Bearer ficticia.

## Estado de implementación móvil · 11 de octubre de 2026

La fuente contractual registrada arriba es el repositorio backend `main` en el commit
`6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61`. Está confirmada por lectura de código,
no por prueba HTTP actual del despliegue.

| Pantalla | Lecturas usadas en la etapa 1 | Situación de datos/errores |
|---|---|---|
| Inicio | `GET /api/servicios` | Muestra hasta dos servicios reales; carga, vacío, error y reintento. Cita personal requiere sesión y no se inventa. |
| Catálogo | `GET /api/servicios`, `GET /api/cursos`, `GET /api/productos` | Composición en servicios de módulo y modelos adaptados; estados de carga/vacío/error/reintento. Búsqueda y filtros por categoría/nivel/existencia usan solo campos confirmados. |
| Servicio detalle | `GET /api/servicios/:id` | Adaptador conserva imagen de respuesta cuando es URL de texto; carga/error/vacío/reintento. Reserva requiere sesión. |
| Curso detalle | búsqueda por ID dentro de `GET /api/cursos` | No existe ruta pública de detalle; puede no encontrarse si el ID no está en los primeros 100. Inscripción requiere sesión. |
| Producto detalle | búsqueda por ID dentro de `GET /api/productos` | No existe ruta pública de detalle. La vista conserva variantes e IDs reales, permite seleccionar, presenta precio/stock e imagen cuando llega URL; carrito queda pendiente de sesión. |

La URL pública se lee de `EXPO_PUBLIC_API_URL` mediante `src/config/api.ts`; no se repite en pantallas/servicios. `.env.example` apunta a `https://brenns-sistema.vercel.app`; no contiene credenciales. El único cliente sigue siendo `src/services/api.ts`.

### Verificaciones de auth necesarias antes de consumir operaciones protegidas

En el código de backend, `POST /api/auth/credentials` valida usuario/contraseña y devuelve información de usuario. El flujo web llama después `signIn` de NextAuth; la app móvil no ha ejecutado ese intercambio. Todavía hay que verificar en código y entorno asignado: qué handler crea la cookie de NextAuth, si el cliente recibe la cookie, solicitud y valor CSRF, `credentials: include` y almacén de cookies nativo, persistencia/reapertura, expiración a 24 h registrada para la estrategia JWT, renovación, `signOut` y estado posterior comprobado contra un endpoint protegido. No existe Bearer móvil confirmado. No se envió login ni se simuló una sesión.

Con `withRasp`, el middleware inspecciona todo el JSON, rechaza algunos caracteres válidos y registra hasta 200 caracteres del body. La auditoría lo encontró en registro, reset y PUT perfil. Es un defecto y exposición de datos del backend; no se modifica en esta app ni se deben restringir localmente contraseñas legítimas para compensarlo. Después del arreglo externo hay que repetir verificación de email, reset, perfil y credenciales con datos de prueba.

Configuración móvil no se conectará a `GET/PATCH /api/config-sitio`: son ajustes administrativos del sitio, con PATCH ADMIN. Las opciones locales a conservar son Notificaciones, Apariencia (Claro/Oscuro/Automático), Idioma Español, Métodos de pago, Cambiar contraseña, Sesiones activas y Eliminar cuenta. Persistencia para apariencia/idioma sería local; notificaciones requiere distinguir permiso del sistema y push; contraseña requiere sesión; no hay contrato de cliente confirmado para pagos guardados, sesiones activas/revocación, eliminación de cuenta ni preferencia remota de notificaciones.

Verificación posterior en vivo de consultas públicas, CSRF anónimo, estado de sesión y perfil protegido, además de estado de autenticación móvil y preferencias, está en [validacion-etapa2.md](validacion-etapa2.md). El backend se revisó en `main` a `6540c6e7c4e7b0d08ee2c68ab4a195c22812cc61`.
