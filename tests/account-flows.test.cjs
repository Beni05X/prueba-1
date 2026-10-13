const assert = require('node:assert/strict');
const { test } = require('node:test');
const { FetchHttpClient, HttpError, setAuthRequestHooks } = require('@/services/api');
const { HttpPerfilService } = require('@/modules/perfil/services/perfil-service');
const { perfilResponse, perfilSession, perfilRequest } = require('@/modules/perfil/adapters/perfil-adapter');
const { HttpCarritoService } = require('@/modules/carrito/services/carrito-service');
const { carritoResponse } = require('@/modules/carrito/adapters/carrito-adapter');
const { HttpAgendaService } = require('@/modules/agenda/services/agenda-service');
const { HttpInscripcionesService } = require('@/modules/cursos/services/inscripciones-service');
const { HttpFavoritosService } = require('@/modules/favoritos/services/favoritos-service');
const { HttpVentasService } = require('@/modules/ventas/services/ventas-service');
const { HttpNotificacionesService } = require('@/modules/notificaciones/services/notificaciones-service');
const { SessionResource, operationError } = require('@/shared/viewmodels/session-resource');
const { SessionTransitions } = require('@/modules/auth/viewmodels/session-transitions');
const { AdapterError } = require('@/shared/adapters/adapter-error');
const { loginDestination } = require('@/modules/auth/models/auth-navigation');

const profile = { nombre: 'Cuenta de prueba', correo: 'account@example.invalid', telefono: null, fecha_registro: '2026-01-01T12:00:00.000Z' };
const cartItem = { id: 11, variante_id: 22, cantidad: 2, tono: null, presentacion: '250 ml', precio_venta: 350, stock: 4, producto: { id: 33, nombre: 'Producto publicado' } };
function fixture(handler) {
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    const path = new URL(url).pathname;
    const request = { path, query: new URL(url).search, options, body: options.body ? JSON.parse(options.body) : null };
    requests.push(request);
    const response = await handler(request);
    return response instanceof Response ? response : new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
  });
  return { http, requests };
}
function deferred() { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; }

test('profile and session use explicit name adapters, with neutral optional fields', () => {
  assert.deepEqual(perfilResponse(profile), { nombre: profile.nombre, correo: profile.correo, telefono: null, fechaRegistro: profile.fecha_registro });
  assert.deepEqual(perfilResponse({ nombre: 'Real', correo: profile.correo }), { nombre: 'Real', correo: profile.correo, telefono: null, fechaRegistro: null });
  assert.deepEqual(perfilSession({ user: { id: '1', name: 'Real', email: profile.correo }, expires: '2030-01-01T00:00:00Z' }), { nombre: 'Real', correo: profile.correo, telefono: null });
  assert.throws(() => perfilResponse({ name: 'Different contract', email: profile.correo }), AdapterError);
  assert.deepEqual(perfilRequest(' Nombre ', ' 123 '), { nombre: 'Nombre', telefono: '123' });
  assert.throws(() => perfilResponse(profile, 'another@example.invalid'), (error) => operationError(error).kind === 'sesion');
});

test('protected profile, cart and appointment requests share the HTTP cookie hooks', async () => {
  let expired = 0;
  setAuthRequestHooks({ sessionKey: () => 'account-A', cookieHeader: async () => '__Secure-authjs.session-token=test-only-A', clear: async () => {}, onExpired: () => expired++ });
  try {
    const f = fixture((r) => {
      assert.equal(r.options.credentials, 'include');
      assert.equal(r.options.headers.Cookie, '__Secure-authjs.session-token=test-only-A');
      if (r.path === '/api/usuario/perfil' && r.options.method === 'GET') return profile;
      if (r.path === '/api/usuario/perfil') { assert.deepEqual(r.body, { nombre: 'Nuevo nombre', telefono: null }); return { ok: true, user: { nombre: 'Nuevo nombre', correo: profile.correo, telefono: null } }; }
      if (r.path === '/api/carrito') return [cartItem];
      if (r.path === '/api/citas') return [];
      throw new Error('Unexpected request');
    });
    const perfil = new HttpPerfilService(f.http);
    assert.equal((await perfil.obtener()).correo, profile.correo);
    await perfil.guardar('Nuevo nombre', '');
    assert.equal((await new HttpCarritoService(f.http).obtener()).items[0].varianteId, '22');
    assert.deepEqual(await new HttpAgendaService(f.http).listar(), []);
    assert.equal(expired, 0);
  } finally { setAuthRequestHooks(null); }
});

test('cart operations send numeric real variant/item IDs and confirm writes', async () => {
  const f = fixture((r) => {
    if (r.options.method === 'POST') return { ok: true, item: { id: 11, cantidad: 2 } };
    if (r.options.method === 'PATCH') return r.body.cantidad ? { ok: true, item: { count: 1 } } : { ok: true, eliminado: true };
    return { ok: true };
  });
  const service = new HttpCarritoService(f.http);
  await service.agregar('22', 2); await service.cantidad('11', 3); await service.cantidad('11', 0); await service.eliminar('11'); await service.eliminar();
  assert.deepEqual(f.requests.map((r) => [r.options.method, r.body, r.query]), [
    ['POST', { variante_id: 22, cantidad: 2 }, ''], ['PATCH', { id: 11, cantidad: 3 }, ''], ['PATCH', { id: 11, cantidad: 0 }, ''], ['DELETE', null, '?id=11'], ['DELETE', null, ''],
  ]);
  const invalid = new HttpCarritoService(fixture(() => ({ ok: true, item: { count: 0 } })).http);
  await assert.rejects(invalid.cantidad('11', 2));
  await assert.rejects(service.agregar('invented-id'));
});

test('cart totals use actual quantity/prices and audited shipping rules, never a discount example', () => {
  assert.deepEqual(carritoResponse([]).resumen, { subtotal: '0.00', envio: '0.00', total: '0.00' });
  assert.deepEqual(carritoResponse([cartItem]).resumen, { subtotal: '700.00', envio: '100.00', total: '800.00' });
  assert.equal(carritoResponse([{ ...cartItem, cantidad: 5 }]).resumen.envio, '0.00');
  assert.equal(carritoResponse([{ ...cartItem, cantidad: 3, precio_venta: 0.1 }]).resumen.subtotal, '0.30');
  assert.throws(() => carritoResponse({ items: [] }), AdapterError);
});

test('appointment availability, reservation and cancellation respect exact contracts', async () => {
  const f = fixture((r) => {
    if (r.path === '/api/horarios') return { sinAtencion: false, horarios: [{ id: 5, hora: '12:00', disponible: true }] };
    if (r.options.method === 'POST') return new Response(JSON.stringify({ success: true, cita: { id: 19, estado: 'PENDIENTE' } }), { status: 201 });
    return { ok: true };
  });
  const service = new HttpAgendaService(f.http);
  assert.equal((await service.horarios('4', '2027-01-20')).horarios[0].hora, '12:00');
  assert.deepEqual(await service.reservar('4', '2027-01-20', '12:00', '200.00'), { id: '19', estado: 'PENDIENTE' });
  await service.cancelar('19');
  assert.equal(new URLSearchParams(f.requests[0].query).get('servicioId'), '4');
  assert.deepEqual(f.requests[1].body, { servicio_id: 4, fecha: '2027-01-20', hora: '12:00', metodo_pago: 'TRANSFERENCIA', total: 200 });
  assert.deepEqual(f.requests[2].body, { id: 19 });
  await assert.rejects(service.horarios('4', '2027-02-31'));
  assert.equal(f.requests.length, 3);
});

test('enrollment confirms IDs and pending transfer contract, and empty Mis cursos is real', async () => {
  const f = fixture((r) => r.options.method === 'GET' ? { cursos: [] } : { success: true, inscripcionId: 7, pagoId: 9, monto: 250, tipoPago: 'COMPLETO', metodoPago: 'TRANSFERENCIA' });
  const service = new HttpInscripcionesService(f.http);
  assert.deepEqual(await service.listar(), []);
  assert.deepEqual(await service.inscribir('15'), { inscripcionId: '7', pagoId: '9', monto: '250' });
  assert.equal(f.requests[1].path, '/api/cursos/15/inscribir');
  assert.equal(f.requests[1].options.body, undefined);
  const denied = new HttpInscripcionesService(fixture(() => new Response('{"error":"Solo clientes"}', { status: 403 })).http);
  await assert.rejects(denied.inscribir('15'), (error) => operationError(error).kind === 'permiso');
});

test('favorites use three distinct DTOs and server-confirmed toggles/removal', async () => {
  const f = fixture((r) => {
    if (r.options.method === 'GET') return r.path === '/api/favoritos-cursos' ? { favoritos: [], cursos: [] } : [];
    if (r.options.method === 'DELETE') return { ok: true };
    return r.path === '/api/favoritos-cursos' ? { accion: 'quitado', cursoId: 3 } : { ok: true, accion: 'agregado' };
  });
  const service = new HttpFavoritosService(f.http);
  for (const categoria of ['Productos', 'Servicios', 'Cursos']) assert.deepEqual(await service.listar(categoria), []);
  await service.toggle('Productos', '1'); await service.toggle('Servicios', '2'); await service.toggle('Cursos', '3');
  assert.deepEqual(f.requests.slice(3).map((r) => r.body), [{ producto_id: 1 }, { servicio_id: 2 }, { cursoId: 3 }]);
  await service.quitar({ id: '1', favoritoId: '8', categoria: 'Productos' });
  assert.equal(f.requests.at(-1).query, '?id=8');
});

test('checkout is tested only with a fixture and uses profile fields; actual purchase history/reminders accept empty lists', async () => {
  const f = fixture((r) => {
    if (r.path === '/api/usuario/recordatorios') return { citasProximas: [], pedidosEnTransito: [] };
    if (r.options.method === 'GET') return [];
    return { ok: true, pedido_id: 13, total: 800, metodo_pago: 'transferencia' };
  });
  const ventas = new HttpVentasService(f.http);
  assert.deepEqual(await ventas.listar(), []);
  const pedido = await ventas.crear('transferencia', perfilResponse(profile));
  assert.equal(pedido.total, '800');
  assert.deepEqual(f.requests[1].body, { metodo_pago: 'transferencia', nombre_cliente: profile.nombre, correo_cliente: profile.correo, telefono_cliente: null });
  assert.deepEqual(await new HttpNotificacionesService(f.http).listar(), []);
  await assert.rejects(ventas.crear('inventado', perfilResponse(profile)));
});

test('errors distinguish session, permission, input conflict and server failure without fake success', async () => {
  for (const [status, kind] of [[401, 'sesion'], [403, 'permiso'], [409, 'validacion'], [500, 'servidor']]) {
    const error = new HttpError(status, { error: 'Motivo específico' }, '/api/carrito');
    assert.equal(operationError(error).kind, kind);
    assert.ok(operationError(error).message.includes('/api/carrito; HTTP ' + status));
    const vm = new SessionResource(async () => [], true);
    await vm.cargar();
    assert.equal(await vm.ejecutar(async () => { throw error; }, 'Success'), false);
    assert.equal(vm.getSnapshot().mensaje, null);
    assert.equal(vm.getSnapshot().tipoError, kind);
  }
});

test('resource cancels old account data, ignores late results and loads the next account independently', async () => {
  const pending = deferred();
  const old = new SessionResource(() => pending.promise, true, 'A:1');
  const first = old.cargar(); old.cancel();
  const current = new SessionResource(async () => ({ nombre: 'B' }), true, 'B:2');
  await current.cargar(); pending.resolve({ nombre: 'A' }); await first;
  assert.equal(old.getSnapshot().datos, null);
  assert.equal(current.getSnapshot().datos.nombre, 'B');
  current.cancel(); assert.equal(current.getSnapshot().datos, null);
});

test('resource suppresses duplicate mutations and refreshes only after server confirmation', async () => {
  let reads = 0, writes = 0;
  const pending = deferred();
  const vm = new SessionResource(async () => ({ cantidad: reads++ }), true);
  await vm.cargar();
  const write = vm.ejecutar(async () => { writes++; await pending.promise; }, 'Confirmado');
  assert.equal(await vm.ejecutar(async () => { writes++; }, 'Duplicado'), false);
  pending.resolve(); assert.equal(await write, true);
  assert.equal(writes, 1); assert.equal(reads, 2); assert.equal(vm.getSnapshot().mensaje, 'Confirmado');
});

test('an old 401 must not invalidate a newly established account', async () => {
  let key = 'A', clears = 0, expired = 0;
  const response = deferred();
  setAuthRequestHooks({ sessionKey: () => key, cookieHeader: async () => 'authjs.session-token=test-only', clear: async () => { clears++; }, onExpired: () => { expired++; } });
  try {
    const client = new FetchHttpClient(() => 'https://example.invalid', async () => response.promise);
    const request = client.get('/api/carrito');
    await Promise.resolve(); await Promise.resolve(); key = 'B';
    response.resolve(new Response('{"error":"Expired A"}', { status: 401 }));
    await assert.rejects(request, HttpError);
    assert.equal(clears, 0); assert.equal(expired, 0);
  } finally { setAuthRequestHooks(null); }
});

test('signout completes before the next login changes cookies, even after a rejected transition', async () => {
  const queue = new SessionTransitions(); const gate = deferred(); const order = [];
  const signout = queue.run(async () => { order.push('logout-start'); await gate.promise; order.push('logout-end'); throw new Error('Fixture outage'); });
  const rejection = assert.rejects(signout);
  const login = queue.run(async () => { order.push('login'); });
  await Promise.resolve(); assert.deepEqual(order, ['logout-start']);
  gate.resolve(); await rejection; await login;
  assert.deepEqual(order, ['logout-start', 'logout-end', 'login']);
});

test('login returns to real product/course/service details while rejecting external paths', () => {
  for (const path of ['/productos/12', '/cursos?id=4', '/servicios?id=2']) assert.equal(loginDestination(path), path);
  for (const path of ['/productos/fake', '/productos/12/extra', 'https://evil.invalid', '//evil.invalid']) assert.equal(loginDestination(path), '/perfil');
});

test('nonempty private lists normalize the actual nested course, purchase, appointment and reminder contracts', async () => {
  const f = fixture((r) => {
    if (r.path === '/api/citas') return [{ id: 4, fecha: '2027-01-20T12:00:00Z', hora: '12:00', estado: 'PENDIENTE', servicio: { nombre: 'Servicio publicado', duracion: '1h' }, empleado: null, notas: null }];
    if (r.path === '/api/mis-cursos') return { cursos: [{ inscripcionId: 7, estado: 'ACTIVO', fecha_inscripcion: '2026-01-01T12:00:00Z', diasAsistidos: 2, totalPagado: 100, curso: { id: 2, titulo: 'Curso publicado', precio_total: 250 }, pagos: [{ id: 9, monto: 100, estado: 'PAGADO' }] }] };
    if (r.path === '/api/pedidos') return [{ id: 13, estado: 'ENVIADO', fecha_pedido: '2026-01-01T12:00:00Z', subtotal: 700, costo_envio: 100, total: 800, metodo_pago: 'transferencia', detalles: [{ id: 11, nombre_producto: 'Producto publicado', descripcion_variante: null, cantidad: 2, subtotal: 700 }] }];
    if (r.path === '/api/usuario/recordatorios') return { citasProximas: [{ id: 4, servicio: 'Servicio publicado', fecha: '2027-01-20T12:00:00Z', hora: '12:00', estado: 'PENDIENTE' }], pedidosEnTransito: [{ id: 13, estado: 'ENVIADO', productos: 'Producto publicado ×2', total: 800, fecha_pedido: '2026-01-01T12:00:00Z' }] };
    if (r.path === '/api/favoritos') return [{ id: 8, producto: { id: 3, nombre: 'Producto publicado', precio_min: null } }];
    throw new Error('Unexpected request');
  });
  assert.equal((await new HttpAgendaService(f.http).listar())[0].servicioNombre, 'Servicio publicado');
  const curso = (await new HttpInscripcionesService(f.http).listar())[0];
  assert.equal(curso.nombre, 'Curso publicado'); assert.equal(curso.totalPagado, '100'); assert.equal(curso.diasAsistidos, 2);
  const compra = (await new HttpVentasService(f.http).listar())[0];
  assert.equal(compra.total, '800'); assert.equal(compra.detalles[0].cantidad, 2);
  assert.deepEqual((await new HttpNotificacionesService(f.http).listar()).map((item) => item.href), ['/agenda', '/cuenta/compras']);
  assert.equal((await new HttpFavoritosService(f.http).listar('Productos'))[0].precio, null);
});

test('malformed/empty protected responses are errors rather than successful empty lists or write confirmations', async () => {
  const empty = new HttpCarritoService(fixture(() => new Response(null, { status: 204 })).http);
  await assert.rejects(empty.obtener(), AdapterError);
  const unconfirmed = new HttpCarritoService(fixture(() => ({ ok: false })).http);
  await assert.rejects(unconfirmed.eliminar('1'), AdapterError);
  const vm = new SessionResource(() => empty.obtener(), true);
  await vm.cargar(); assert.equal(vm.getSnapshot().estadoCarga, 'error'); assert.equal(vm.getSnapshot().datos, null);
});

test('public FAQ/contact uses server data and rejects unsafe contact URLs without defaults', async () => {
  const { HttpInformacionService } = require('@/modules/informacion/services/informacion-service');
  const f = fixture((r) => r.path === '/api/faq' ? [{ id: 1, pregunta: 'Pregunta publicada', respuesta: 'Respuesta publicada' }] : { red_whatsapp: 'https://wa.me/12345' });
  const service = new HttpInformacionService(f.http);
  assert.equal((await service.preguntas())[0].respuesta, 'Respuesta publicada');
  assert.equal(await service.contacto(), 'https://wa.me/12345');
  const missing = new HttpInformacionService(fixture(() => ({})).http);
  assert.equal(await missing.contacto(), null);
  const unsafe = new HttpInformacionService(fixture(() => ({ red_whatsapp: 'javascript:alert(1)' })).http);
  assert.equal(await unsafe.contacto(), null);
});
