const assert = require('node:assert/strict');
const { test } = require('node:test');
const { FetchHttpClient, HttpError } = require('@/services/api');
const { AdapterError } = require('@/shared/adapters/adapter-error');
const { SessionResource } = require('@/shared/viewmodels/session-resource');
const { localCalendarDay, calendarDayFromApi, selectableDay, monthDays, shiftMonth } = require('@/shared/viewmodels/calendar');
const { horariosResponse, diasBloqueadosResponse } = require('@/modules/agenda/adapters/agenda-adapter');
const { HttpAgendaService } = require('@/modules/agenda/services/agenda-service');
const { reservarConDisponibilidad } = require('@/modules/agenda/viewmodels/reserva-actions');
const { transferenciaResponse, importeReserva } = require('@/shared/adapters/transferencia-adapter');
const { bancoAprobado } = require('@/config/transferencia-aprobada');
const { HttpTransferenciaService } = require('@/shared/services/transferencia-service');
const { HttpInscripcionesService } = require('@/modules/cursos/services/inscripciones-service');
const { adaptCursoDto } = require('@/modules/cursos/adapters/cursos-adapter');
const { paginate } = require('@/shared/viewmodels/pagination');
const { filterProductos, sortProductos } = require('@/modules/productos/viewmodels/product-filters');
const { imageUri } = require('@/shared/viewmodels/media-state');
function fixture(handler) {
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    const request = { url: new URL(url), options, body: options.body ? JSON.parse(options.body) : null };
    requests.push(request);
    const value = await handler(request);
    return value instanceof Response ? value : new Response(JSON.stringify(value));
  });
  return { http, requests };
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }

test('calendar days retain their written day, local midnight and month/year transitions', () => {
  assert.equal(localCalendarDay(new Date(2026, 9, 13, 0, 1)), '2026-10-13');
  assert.equal(calendarDayFromApi('2026-10-13T00:00:00.000Z'), '2026-10-13');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(monthDays('2028-02').filter(Boolean).length, 29);
  assert.equal(monthDays('2027-02').filter(Boolean).length, 28);
  assert.throws(() => calendarDayFromApi('2027-02-29'));
});
test('calendar rejects past/blocked/invalid days and accepts today or an unblocked future day', () => {
  const blocked = diasBloqueadosResponse([{ id: 7, fecha: '2026-10-14T00:00:00.000Z', motivo: 'Cerrado' }]);
  assert.deepEqual(blocked, ['2026-10-14']);
  assert.equal(selectableDay('2026-10-12', '2026-10-13', blocked), false);
  assert.equal(selectableDay('2026-10-14', '2026-10-13', blocked), false);
  assert.equal(selectableDay('2026-10-13', '2026-10-13', blocked), true);
  assert.equal(selectableDay('2026-10-15', '2026-10-13', blocked), true);
  assert.equal(selectableDay('2026-02-31', '2026-01-01', []), false);
});
test('availability retains sinAtencion and actual slots; malformed responses never become empty availability', () => {
  assert.deepEqual(horariosResponse({ sinAtencion: true, horarios: [] }), { sinAtencion: true, horarios: [] });
  const availability = horariosResponse({ sinAtencion: false, horarios: [{ id: 1, hora: '10:00', disponible: false }, { id: 2, hora: '11:30', disponible: true }] });
  assert.deepEqual(availability.horarios.filter(slot => slot.disponible).map(slot => slot.hora), ['11:30']);
  assert.throws(() => horariosResponse({ horarios: [] }), AdapterError);
  assert.throws(() => horariosResponse({ sinAtencion: false, horarios: [{ id: 1, hora: '10:00', disponible: 'true' }] }), AdapterError);
});
test('service/employee IDs and selected calendar day reach availability and transfer-only reservation contracts', async () => {
  const f = fixture(r => r.options.method === 'POST'
    ? new Response(JSON.stringify({ success: true, cita: { id: 9, estado: 'PENDIENTE' } }), { status: 201 })
    : r.url.pathname === '/api/dias-bloqueados' ? [] : { sinAtencion: false, horarios: [] });
  const service = new HttpAgendaService(f.http);
  await service.diasBloqueados(); await service.horarios('4', '2027-01-20', undefined, '8');
  assert.deepEqual(Object.fromEntries(f.requests[1].url.searchParams), { servicioId: '4', fecha: '2027-01-20', empleadoId: '8' });
  const result = await service.reservar('4', '2027-01-20', '11:30', '200.125', '8');
  assert.deepEqual(result, { id: '9', estado: 'PENDIENTE' });
  assert.deepEqual(f.requests[2].body, { servicio_id: 4, fecha: '2027-01-20', hora: '11:30', total: 200.125, metodo_pago: 'TRANSFERENCIA', empleado_id: 8 });
});
test('a 200, missing creation ID or unexpected paid state cannot confirm a transfer reservation', async () => {
  for (const [status, cita] of [[200, { id: 1, estado: 'PENDIENTE' }], [201, { estado: 'PENDIENTE' }], [201, { id: 1, estado: 'CONFIRMADA' }]]) {
    const f = fixture(() => new Response(JSON.stringify({ success: true, cita }), { status }));
    await assert.rejects(new HttpAgendaService(f.http).reservar('4', '2027-01-20', '11:30', '200'));
  }
});
test('an occupied hour clears selection, refreshes once and requests a new choice without replaying the POST', async () => {
  let selected = '11:30', reads = 0, writes = 0, confirmed = 0;
  const vm = new SessionResource(async () => { reads++; return { sinAtencion: false, horarios: [] }; }, true);
  await vm.cargar();
  const ok = await vm.ejecutar(() => reservarConDisponibilidad(async () => { writes++; throw new HttpError(409, { error: 'Esa hora ya esta ocupada' }, '/api/citas'); },
    vm.cargar, () => { selected = null; }), 'Registrada', () => confirmed++);
  assert.equal(ok, false); assert.equal(selected, null); assert.equal(reads, 2); assert.equal(writes, 1); assert.equal(confirmed, 0);
  assert.match(vm.getSnapshot().error, /Selecciona otra fecha u hora/); assert.equal(vm.getSnapshot().mensaje, null);
});
test('permission, session and other validation failures are not misclassified as an occupied hour', async () => {
  let refreshes = 0;
  for (const [status, reason] of [[401, 'No autorizado'], [403, 'Sin permiso'], [400, 'Límite de citas'], [409, 'Otro conflicto']]) {
    const error = new HttpError(status, { error: reason }, '/api/citas');
    await assert.rejects(reservarConDisponibilidad(async () => { throw error; }, async () => refreshes++, () => { throw new Error('Unexpected clear'); }), e => e === error);
  }
  assert.equal(refreshes, 0);
});
test('availability ignores a late response from the previous date/service/employee request', async () => {
  const old = deferred(), next = deferred(); let calls = 0;
  const vm = new SessionResource(() => ++calls === 1 ? old.promise : next.promise, true);
  const first = vm.cargar(), second = vm.cargar();
  next.resolve({ sinAtencion: false, horarios: [{ id: '2', hora: '12:00', disponible: true }] }); await second;
  old.resolve({ sinAtencion: true, horarios: [] }); await first;
  assert.equal(vm.getSnapshot().datos.horarios[0].hora, '12:00');
});
test('bank data uses the explicitly approved source only when API keys are absent, and never mixes accounts', async () => {
  const approved = transferenciaResponse({});
  assert.deepEqual(approved.banco, bancoAprobado); assert.equal(approved.fuente, 'aprobada'); assert.equal(approved.anticipoPorcentaje, 50);
  const api = transferenciaResponse({ banco_titular: 'Titular confirmado por API', banco_banco: 'Banco publicado', banco_clabe: '111111111111111111', anticipo_porcentaje: '25' });
  assert.equal(api.fuente, 'api'); assert.equal(api.banco.cuenta, null); assert.equal(api.banco.celular, null); assert.equal(api.anticipoPorcentaje, 25);
  assert.throws(() => transferenciaResponse({ banco_banco: 'Configuración incompleta' }), AdapterError);
  assert.throws(() => transferenciaResponse({ anticipo_porcentaje: '200' }), AdapterError);
  const f = fixture(() => ({})); await new HttpTransferenciaService(f.http).obtener();
  assert.equal(f.requests[0].url.pathname, '/api/config-sitio');
});
test('appointment full/deposit amounts preserve the audited percentage and exact Float price without invented rounding', () => {
  assert.equal(importeReserva('300.00', 'COMPLETO', 50), '300.00');
  assert.equal(importeReserva('300.00', 'ANTICIPO', 50), '150');
  assert.equal(importeReserva('200.125', 'ANTICIPO', 50), '100.0625');
  assert.equal(importeReserva('400', 'ANTICIPO', 12.5), '50');
  assert.throws(() => importeReserva('-1', 'COMPLETO', 50), AdapterError);
});
test('enrollment retains the server IDs and full amount, suppresses duplicate submission and refreshes only after confirmation', async () => {
  const pending = deferred(), f = fixture(() => pending.promise);
  const service = new HttpInscripcionesService(f.http);
  let reads = 0, receipt = null;
  const vm = new SessionResource(async () => { reads++; return []; }, true);
  await vm.cargar();
  const first = vm.ejecutar(() => service.inscribir('5'), 'Pago pendiente', value => { receipt = value; });
  assert.equal(await vm.ejecutar(() => service.inscribir('5'), 'Duplicate'), false);
  pending.resolve({ success: true, inscripcionId: 6, pagoId: 7, monto: 250, metodoPago: 'TRANSFERENCIA', tipoPago: 'COMPLETO' });
  assert.equal(await first, true); assert.deepEqual(receipt, { inscripcionId: '6', pagoId: '7', monto: '250' });
  assert.equal(reads, 2); assert.equal(f.requests.length, 1); assert.equal(f.requests[0].options.body, undefined);
});
test('enrollment duplicate/capacity/session errors preserve the server error and do not produce receipts', async () => {
  for (const [status, error] of [[409, 'Ya estás inscrito'], [409, 'El cupo del curso está completo'], [401, 'No autorizado']]) {
    const f = fixture(() => new Response(JSON.stringify({ error }), { status }));
    await assert.rejects(new HttpInscripcionesService(f.http).inscribir('5'), e => e instanceof HttpError && e.status === status && e.body.error === error);
  }
});
test('course adapter consumes real JSON images and capacity, leaving absent values neutral', () => {
  const dto = { id: 5, titulo: 'Publicado', descripcion: null, precio_total: '250.00', duracion_horas: null, nivel: null, fecha_inicio: null, fecha_fin: null,
    imagenes: ['https://example.invalid/real.jpg'], cupo_maximo: 10, inscritos: 10 };
  const course = adaptCursoDto(dto);
  assert.equal(course.imagen, dto.imagenes[0]); assert.equal(course.inscritos, course.cupoMaximo);
  assert.equal(adaptCursoDto({ ...dto, imagenes: null }).imagen, null);
  assert.throws(() => adaptCursoDto({ ...dto, inscritos: -1 }), AdapterError);
});
test('pagination slices ten real records with correct limits, last page, empty state and count clamps', () => {
  const items = Array.from({ length: 23 }, (_, i) => ({ id: String(i + 1), variantes: [{ id: String(100 + i) }] }));
  assert.equal(paginate(items, 1).items.length, 10); assert.equal(paginate(items, 2).items.length, 10);
  const last = paginate(items, 3);
  assert.equal(last.items.length, 3); assert.equal(last.items[0], items[20]); assert.equal(last.nextDisabled, true);
  assert.equal(paginate(items, 1).previousDisabled, true);
  assert.equal(paginate(items.slice(0, 12), 9).page, 2);
  assert.deepEqual(paginate([], 9), { page: 1, pages: 1, previousDisabled: true, nextDisabled: true, items: [] });
});
test('search, facets and sorting happen before pagination without changing product/variant IDs', () => {
  const all = Array.from({ length: 35 }, (_, i) => ({ id: String(i + 1), nombre: 'Producto ' + i, categoria: i < 25 ? 'Cabello' : 'Piel', marca: null, descripcion: null,
    precio: String(i + 1), enStock: true, variantes: [{ id: String(100 + i), tono: 'Real', presentacion: null }] }));
  const result = sortProductos(filterProductos(all, 'Real', 'Categoría: Cabello'), 'Precio mayor');
  assert.equal(result.length, 25);
  assert.deepEqual(paginate(result, 1).items.map(item => item.id), ['25','24','23','22','21','20','19','18','17','16']);
  assert.equal(paginate(result, 3).items.length, 5); assert.equal(result[0].variantes[0].id, '124');
  assert.equal(all[0].id, '1');
});
test('image source accepts real HTTP images and rejects absence, unsafe and malformed URLs without examples', () => {
  for (const value of [undefined, null, '', 'bad url', 'javascript:alert(1)', 'file:///photo.jpg', {}]) assert.equal(imageUri(value), undefined);
  assert.equal(imageUri(['https://example.invalid/real.jpg']), 'https://example.invalid/real.jpg');
});
