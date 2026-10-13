# Calendario, transferencias, imágenes y productos — 2026-10-13

Implementación sobre el estado previo del proyecto. Se conserva Expo SDK 57, Expo Router, CustomButton, Touchable, estilos compartidos, sesión única y cliente HTTP con cookies. No se añadieron dependencias ni se modificó el backend.

## Cambios y decisiones

- Detalle de servicio: calendario mensual, días pasados/bloqueados deshabilitados, consulta de horarios por día/servicio y soporte de empleado opcional en servicio/ViewModel. El flujo existente no ofrece selector de empleado; no se inventó una lista.
- Adapter de disponibilidad conserva `sinAtencion`; únicamente se ofrecen horas `disponible: true`. Hay carga, error/reintento, sin atención y sin horarios. Cambios de día limpian la hora; cambios de servicio/empleado/sesión descartan la selección, también al regresar al servicio anterior. Las consultas canceladas y respuestas tardías no publican datos.
- Fechas seleccionadas viajan como `YYYY-MM-DD`. El calendario calcula meses/días sin convertir selecciones a instantes UTC ni aplicar `toISOString()`. Los días de la API conservan su parte de calendario.
- Reserva: resumen de servicio, fecha, hora, precio e importe a transferir. Se conserva la política de la web: anticipo configurable o pago completo. Si `anticipo_porcentaje` está ausente se usa el 50% ya definido en la web; no es un anticipo nuevo. Cálculo decimal exacto sin redondear precios Float a dos decimales.
- Sólo transferencia en reserva/inscripción. El POST de citas incluye `total`, que el backend sí consume; no incluye `tipo_pago`, que su ruta actual no consume. La inscripción no envía un body ficticio: el servidor fija TRANSFERENCIA/COMPLETO y calcula el importe.
- Confirmación de cita exige HTTP 201, success, ID y estado PENDIENTE. Envía una sola solicitud; un conflicto de hora limpia la selección, recarga disponibilidad/días y solicita elegir de nuevo, sin reintentar el POST. La inscripción conserva `inscripcionId`, `pagoId` y `monto`; respeta cuenta de cliente, inscripción activa y cupo real. Los errores del servidor conservan su operación/estado.
- Los resultados explican pago pendiente, nunca transferencia automática ni pago acreditado. Tras éxito confirmado, la revisión compartida de datos actualiza recursos; Agenda y Mis cursos vuelven a consultar sus listas reales al entrar.
- Componente compartido de transferencia: fuente aprobada centralizada; configuración bancaria completa de API tiene prioridad. No se mezclan cuentas de fuentes distintas. Una configuración API bancaria parcial es un error con reintento; no se completan sus campos con otra cuenta.
- Imagen compartida de tarjetas/detalles: ausencia, URL inválida o error de carga muestran sólo `Imagen` sobre superficie neutral. El nombre sigue fuera del espacio de imagen. La clave URI remonta su ViewModel, eliminando errores antiguos, incluso A → B → A. Cursos consumen `imagenes` JSON reales y cupo/inscritos.
- Productos: listado público completo, búsqueda/facetas/orden antes de paginar, exactamente 10 por página salvo la última; Anterior/Siguiente e indicador Página X de Y. Cambios de búsqueda/filtro/orden reinician página; reducción de resultados ajusta y conserva la página válida. No se agregan parámetros de paginación al GET. Los IDs y variantes quedan intactos.

## Datos bancarios aprobados

Se verificó la fuente [useSiteConfig.tsx](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/hooks/useSiteConfig.tsx). Sus valores eran respaldos, no prueba de vigencia. El usuario respondió expresamente **“Sí, usar esos datos de la web”** a la confirmación de titular, banco, cuenta, CLABE y celular en esta sesión el 2026-10-13. Se centralizaron en `src/config/transferencia-aprobada.ts`. No quedan datos bancarios pendientes de confirmación.

La consulta GET en producción confirmó que las cinco claves bancarias y `anticipo_porcentaje` siguen ausentes. Por ello la fuente usada hoy es la aprobada. Si se publica configuración completa, ésta tiene prioridad.

## Contratos contrastados con el backend actual

| Operación | Solicitud implementada |
| --- | --- |
| Días bloqueados | GET /api/dias-bloqueados; array fecha/id/motivo |
| Horarios | GET /api/horarios?fecha=YYYY-MM-DD&servicioId=ID; empleadoId sólo si existe selección real |
| Reserva | POST /api/citas: servicio_id, fecha, hora, metodo_pago: TRANSFERENCIA, total; empleado_id opcional |
| Agenda | GET /api/citas con sesión compartida |
| Configuración para transferencia | GET /api/config-sitio |
| Inscripción | POST /api/cursos/{id}/inscribir; sin body, cookies de sesión |
| Mis cursos | GET /api/mis-cursos |
| Cursos públicos | GET /api/cursos; precio_total, imagenes, cupo_maximo e inscritos |
| Productos públicos | GET /api/productos; paginación local, sin parámetros nuevos |

Fuentes: [días bloqueados](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/dias-bloqueados/route.ts), [horarios](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/horarios/route.ts), [citas](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/citas/route.ts), [política de reservas web](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/(cliente)/agendar/page.tsx), [inscripción](https://github.com/salonbrenns/SistemaBrenns/blob/main/src/app/api/cursos/%5Bid%5D/inscribir/route.ts), [schema Curso](https://github.com/salonbrenns/SistemaBrenns/blob/main/prisma/schema.prisma).

## Verificación real

- Consultas anónimas GET ejecutadas desde Node, URL de `EXPO_PUBLIC_API_URL`: configuración 200 JSON, días bloqueados 200 JSON compatible, horarios 401 JSON (requiere sesión), productos 200 JSON y cursos 200 JSON. Productos: 22 imágenes HTTP absolutas y 1200 ausentes; cursos: 4 imágenes HTTP absolutas. No se imprimieron datos de sesión ni cuerpos sensibles.
- Comprobaciones finales: `npm.cmd test` **119 aprobadas, 0 fallidas**; `npx.cmd tsc --noEmit` **salida 0**; `npx.cmd expo lint` **salida 0, 0 errores, 1 advertencia previa** en `src/hooks/use-color-scheme.web.ts:11` (`react-hooks/set-state-in-effect`). `git diff --check` salida 0. Logs finales en `.expo/reservas-tests.log`, `.expo/reservas-typecheck.log` y `.expo/reservas-lint.log`.
- App iniciada con `npx.cmd expo start --offline --port 8083`: Metro espera en http://localhost:8083. No equivale a renderización en dispositivo. La primera exportación Android procesó 1426 módulos, pero el entorno aislado denegó ejecución de `hermesc.exe`. La repetición autorizada de `npx.cmd expo export --platform android --output-dir .expo/reservas-android-check` terminó con **salida 0**, 1426 módulos y bundle Hermes de 3.1 MB; generó `metadata.json` y `_expo/static/js/android/entry-abe2f81406db7a33e1edd5a280d107b1.hbc`.
- Las pruebas de mutación usan exclusivamente fixtures y dominios `example.invalid`. Incluyen conflicto, ausencia de éxito falso, IDs e importe, método transferencia, solicitudes duplicadas, limpieza y respuestas tardías, bancos sin mezcla, imágenes con error/reset y paginación/orden/filtros.
- Las pruebas de JSX/ViewModels usan un harness de estado JavaScript y módulos nativos sustituidos. Verifican decisiones y eventos del componente; no equivalen a una prueba del renderizador nativo ni de una sesión real.
- Dispositivo Android: pendiente según la instrucción del usuario; no hay dispositivo/emulador disponible. No se declaró comprobada la creación real de citas ni inscripciones. No se realizaron transferencias, pagos, reservas o inscripciones en producción.
- Pendiente manual: entrar con cuenta autorizada directamente en Android, seleccionar día/hora, revisar datos e importe; comprobar cookies/sesión de horarios y listas, renderización de calendario/imágenes/paginación. Sólo crear una cita/inscripción de prueba con autorización específica para esa operación; nunca ejecutar pagos como prueba automática.

## Archivos modificados o creados en esta tarea

- `src/config/transferencia-aprobada.ts`
- `src/shared/models/transferencia.ts`
- `src/shared/adapters/transferencia-adapter.ts`
- `src/shared/services/transferencia-service.ts`
- `src/shared/viewmodels/use-transferencia-view-model.ts`
- `src/shared/viewmodels/calendar.ts`
- `src/shared/viewmodels/use-calendar-view-model.ts`
- `src/shared/viewmodels/media-state.ts`
- `src/shared/viewmodels/use-media-view-model.ts`
- `src/shared/viewmodels/pagination.ts`
- `src/shared/viewmodels/use-pagination-view-model.ts`
- `src/shared/viewmodels/session-resource.ts`
- `src/shared/viewmodels/use-session-resource.ts`
- `src/components/ui/calendar.tsx`
- `src/components/ui/horarios-selector.tsx`
- `src/components/ui/datos-transferencia.tsx`
- `src/components/ui/pagination-controls.tsx`
- `src/components/ui/style-guide.tsx`
- `src/modules/agenda/models/cita.ts`
- `src/modules/agenda/adapters/agenda-adapter.ts`
- `src/modules/agenda/services/agenda-service.ts`
- `src/modules/agenda/viewmodels/reserva-actions.ts`
- `src/modules/agenda/viewmodels/use-reserva-view-model.ts`
- `src/modules/agenda/views/reserva-form.tsx`
- `src/modules/servicios/views/servicios-view.tsx`
- `src/modules/cursos/models/curso.ts`
- `src/modules/cursos/models/inscripcion.ts`
- `src/modules/cursos/adapters/cursos-adapter.ts`
- `src/modules/cursos/adapters/inscripciones-adapter.ts`
- `src/modules/cursos/viewmodels/use-inscripcion-view-model.ts`
- `src/modules/cursos/views/inscripcion-form.tsx`
- `src/modules/cursos/views/cursos-view.tsx`
- `src/modules/productos/viewmodels/product-filters.ts`
- `src/modules/productos/viewmodels/use-productos-view-model.ts`
- `src/modules/productos/views/productos-list-view.tsx`
- `src/modules/catalogo/viewmodels/use-catalogo-view-model.ts`
- `src/modules/catalogo/views/catalogo-view.tsx`
- `scripts/check-booking-contracts.cjs`
- `tests/account-flows.test.cjs`
- `tests/public-adapters.test.cjs`
- `tests/booking-catalog.test.cjs`
- `tests/ui-viewmodels.test.cjs`
- `docs/reservas-transferencias-2026-10-13.md`
- `README.md`

